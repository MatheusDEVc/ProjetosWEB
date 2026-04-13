// ✅ SERVER.JS - SERVIDOR PRINCIPAL GLOWUP STORE
// Copie este arquivo para: backend/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let db;

// ===== MIDDLEWARE DE SEGURANÇA =====
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json({ limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições'
});
app.use('/api/', limiter);

// ===== INICIALIZAR BANCO DE DADOS =====
async function initDB() {
    db = await open({
        filename: path.join(__dirname, 'database.db'),
        driver: sqlite3.Database
    });

    await db.exec(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        category TEXT,
        gender TEXT,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.exec(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_number TEXT UNIQUE NOT NULL,
        items TEXT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'confirmado',
        payment_method TEXT NOT NULL,
        address TEXT NOT NULL,
        order_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    console.log('✅ Banco de dados inicializado');

    // Seed de produtos
    const count = await db.get('SELECT COUNT(*) as count FROM products');
    if (count.count === 0) {
        const products = [
            {id: 1, name: 'Sérum Facial Vitamina C', price: 89.90, category: 'skincare', gender: 'Feminino', stock: 50},
            {id: 2, name: 'Creme Anti-Rugas Premium', price: 124.50, category: 'skincare', gender: 'Feminino', stock: 30},
            {id: 3, name: 'Máscara Facial Hidratante', price: 45.00, category: 'skincare', gender: 'Feminino', stock: 100},
            {id: 4, name: 'Base Líquida Cobertura Total', price: 67.50, category: 'maquiagem', gender: 'Feminino', stock: 70},
            {id: 5, name: 'Whey Protein Chocolate', price: 89.90, category: 'suplementos', gender: 'Masculino', stock: 100}
        ];

        for (const product of products) {
            await db.run(
                'INSERT INTO products (id, name, price, category, gender, stock, image_url) VALUES (?,?,?,?,?,?,?)',
                [product.id, product.name, product.price, product.category, product.gender, product.stock, 'https://via.placeholder.com/300']
            );
        }
        console.log('✅ Produtos inseridos');
    }
}

function calculateEstimatedDelivery(createdAt) {
    const date = createdAt ? new Date(createdAt) : new Date();
    const daysToAdd = 7;
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
}

function getStatusMessage(status) {
    const messages = {
        confirmado: 'Seu pedido foi confirmado com sucesso!',
        processando: 'Seu pedido está sendo processado pelo nosso sistema.',
        preparando: 'Estamos preparando seu pedido para envio.',
        enviado: 'Seu pedido saiu para entrega! 🚚',
        entregue: 'Seu pedido foi entregue com sucesso! Obrigado pela compra!',
        cancelado: 'Seu pedido foi cancelado.'
    };
    return messages[status] || 'Status do pedido atualizado.';
}

function normalizeOrder(order) {
    return {
        ...order,
        orderNumber: order.order_number,
        currentStatus: order.status,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        createdAt: order.created_at || order.createdAt,
        estimatedDelivery: calculateEstimatedDelivery(order.created_at || order.createdAt),
        statusHistory: [
            {
                status: order.status,
                timestamp: order.created_at || order.createdAt,
                message: getStatusMessage(order.status)
            }
        ]
    };
}

// ===== ROTAS =====

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Registrar usuário
app.post('/api/auth/register', async (req, res) => {
    try {
        const {email, password, full_name, phone, cpf} = req.body;

        if (!email || !password || !full_name || !phone || !cpf) {
            return res.status(400).json({success: false, message: 'Campos obrigatórios faltando'});
        }

        const password_hash = await bcryptjs.hash(password, 10);

        await db.run(
            'INSERT INTO users (email, password_hash, full_name, phone, cpf) VALUES (?,?,?,?,?)',
            [email, password_hash, full_name, phone, cpf]
        );

        const user = await db.get('SELECT id, email, full_name, phone, cpf FROM users WHERE email = ?', [email]);
        const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET || 'secret', {expiresIn: '7d'});

        res.json({success: true, token, user});

    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return res.status(409).json({success: false, message: 'Email ou CPF já cadastrado'});
        }
        res.status(500).json({success: false, message: error.message});
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await db.get('SELECT id, email, full_name, password_hash, phone, cpf FROM users WHERE email = ?', [email]);
        if (!user) return res.status(401).json({success: false, message: 'Usuário não encontrado'});

        const validPassword = await bcryptjs.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({success: false, message: 'Senha incorreta'});

        const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET || 'secret', {expiresIn: '7d'});

        res.json({success: true, token, user: {id: user.id, email: user.email, full_name: user.full_name, phone: user.phone, cpf: user.cpf}});

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

// Perfil do usuário autenticado
app.get('/api/auth/me', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({success: false, message: 'Não autenticado'});

        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        const user = await db.get('SELECT id, email, full_name, phone, cpf FROM users WHERE id = ?', [decoded.id]);
        if (!user) return res.status(404).json({success: false, message: 'Usuário não encontrado'});

        res.json({success: true, user});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

// Listar produtos
app.get('/api/products', async (req, res) => {
    try {
        const products = await db.all('SELECT * FROM products WHERE stock > 0');
        res.json({success: true, data: products});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

// Obter preço do produto (seguro)
app.post('/api/products/:id/price', async (req, res) => {
    try {
        const {id} = req.params;
        const {quantity} = req.body;

        const product = await db.get('SELECT id, price, stock FROM products WHERE id = ?', [id]);
        if (!product) return res.status(404).json({success: false, message: 'Produto não encontrado'});

        if (quantity > product.stock) {
            return res.status(400).json({success: false, message: 'Estoque insuficiente'});
        }

        res.json({
            success: true,
            productId: product.id,
            unitPrice: product.price,
            quantity,
            totalPrice: product.price * quantity
        });

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

// Criar pedido
app.post('/api/orders', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({success: false, message: 'Não autenticado'});

        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        const {items, total, paymentMethod, address, orderHash} = req.body;

        // Validar itens e preços
        for (const item of items) {
            const product = await db.get('SELECT price FROM products WHERE id = ?', [item.id]);
            if (!product || Math.abs(product.price - item.price) > 0.01) {
                return res.status(400).json({success: false, message: 'Preço inválido detectado'});
            }
        }

        const orderNumber = `GLW-${Date.now()}`;
        await db.run(
            'INSERT INTO orders (user_id, order_number, items, total, payment_method, address, order_hash, status) VALUES (?,?,?,?,?,?,?,?)',
            [decoded.id, orderNumber, JSON.stringify(items), total, paymentMethod, address, orderHash, 'confirmado']
        );

        const order = await db.get('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);

        res.json({
            success: true,
            order: normalizeOrder(order)
        });

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

// Listar meus pedidos
app.get('/api/orders', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({success: false, message: 'Não autenticado'});

        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [decoded.id]);
        const parsedOrders = orders.map(normalizeOrder);
        res.json({success: true, data: parsedOrders});

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

// Admin: Listar todos os pedidos
app.get('/api/admin/orders', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({success: false, message: 'Não autenticado'});

        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        const user = await db.get('SELECT role FROM users WHERE id = ?', [decoded.id]);
        if (user?.role !== 'admin') {
            return res.status(403).json({success: false, message: 'Acesso negado'});
        }

        const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');
        const parsedOrders = orders.map(normalizeOrder);
        res.json({success: true, data: parsedOrders});

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

// Admin: Atualizar status do pedido
app.put('/api/admin/orders/:id/status', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({success: false, message: 'Não autenticado'});

        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        const user = await db.get('SELECT role FROM users WHERE id = ?', [decoded.id]);
        if (user?.role !== 'admin') {
            return res.status(403).json({success: false, message: 'Acesso negado'});
        }

        const {id} = req.params;
        const {status} = req.body;

        const validStatuses = ['confirmado', 'processando', 'preparando', 'enviado', 'entregue', 'cancelado'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({success: false, message: 'Status inválido'});
        }

        await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

        res.json({success: true, message: `Status atualizado para: ${status}`});

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
});

// ===== INICIAR SERVIDOR =====
async function start() {
    try {
        await initDB();
        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════╗
║      ✨ GLOWUP STORE BACKEND                       ║
║                                                    ║
║  🚀 Servidor: http://localhost:${PORT}
║  📊 Health: http://localhost:${PORT}/api/health
║                                                    ║
║  Endpoints:                                        ║
║  POST   /api/auth/register                         ║
║  POST   /api/auth/login                            ║
║  GET    /api/products                              ║
║  POST   /api/products/:id/price                    ║
║  POST   /api/orders                                ║
║  GET    /api/orders                                ║
║  GET    /api/admin/orders (admin)                  ║
║  PUT    /api/admin/orders/:id/status (admin)      ║
║                                                    ║
╚════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar:', error);
        process.exit(1);
    }
}

start();

# 🚀 GlowUp Store Backend - Setup Rápido

## ⚡ Setup Automático (Recomendado)

### Passo 1: Execute setup.bat
```
Clique 2 vezes no arquivo: setup.bat
```

O script vai automaticamente:
- ✅ Limpar arquivos antigos
- ✅ Instalar todas as dependências
- ✅ Configurar o banco de dados

### Passo 2: Inicie o servidor
```bash
npm run dev
```

Você vai ver:
```
╔════════════════════════════════════════════════════╗
║      ✨ GLOWUP STORE BACKEND                       ║
║                                                    ║
║  🚀 Servidor: http://localhost:5000              ║
║  📊 Health: http://localhost:5000/api/health     ║
╚════════════════════════════════════════════════════╝
```

### Passo 3: Teste o servidor
Abra seu navegador: http://localhost:5000/api/health

Você deve ver:
```json
{"status":"OK","timestamp":"2024-04-12T16:20:29.754Z"}
```

---

## 📁 Estrutura do Backend

```
backend/
├── .env                          # Configurações (JWT_SECRET, PORT, etc)
├── .env.example                  # Template de configuração
├── package.json                  # Dependências do projeto
├── package-lock.json             # Lock file (criado automaticamente)
├── server.js                     # Servidor principal
├── database.db                   # Database SQLite (criado automaticamente)
├── setup.bat                     # Script de instalação automática
├── SETUP_AUTOMATIZADO.txt        # Guia de setup
├── node_modules/                 # Dependências (criado por npm install)
└── README.md                     # Este arquivo
```

---

## 🔌 API Endpoints Disponíveis

### Autenticação
```
POST /api/auth/register      - Registrar novo usuário
POST /api/auth/login         - Fazer login
```

### Produtos
```
GET  /api/products                      - Listar produtos
POST /api/products/:id/price            - Validar preço de produto
```

### Pedidos
```
POST /api/orders             - Criar novo pedido (requer autenticação)
GET  /api/orders             - Listar meus pedidos (requer autenticação)
```

### Admin
```
GET  /api/admin/orders                  - Listar todos os pedidos (admin)
PUT  /api/admin/orders/:id/status       - Atualizar status (admin)
```

### Health Check
```
GET /api/health              - Verificar se servidor está online
```

---

## 🛡️ Segurança

- ✅ Autenticação com JWT
- ✅ Senhas com hash bcryptjs
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Rate limiting (100 req/15min)
- ✅ Validação de preços no servidor
- ✅ Proteção contra XSS
- ✅ CSRF tokens

---

## 🗄️ Banco de Dados

O backend usa **SQLite** com 3 tabelas:

### Tabela: products
- id (INTEGER PRIMARY KEY)
- name (TEXT UNIQUE)
- price (DECIMAL)
- category (TEXT)
- gender (TEXT)
- stock (INTEGER)
- created_at (DATETIME)

### Tabela: users
- id (INTEGER PRIMARY KEY AUTO_INCREMENT)
- email (TEXT UNIQUE)
- password_hash (TEXT)
- full_name (TEXT)
- phone (TEXT)
- cpf (TEXT UNIQUE)
- role (TEXT) - 'user' ou 'admin'
- created_at (DATETIME)

### Tabela: orders
- id (INTEGER PRIMARY KEY AUTO_INCREMENT)
- user_id (INTEGER FK)
- order_number (TEXT UNIQUE)
- items (JSON TEXT)
- total (DECIMAL)
- status (TEXT)
- payment_method (TEXT)
- address (TEXT)
- order_hash (TEXT)
- created_at (DATETIME)

---

## 📦 Dependências Instaladas

```json
{
  "express": "^4.18.2",           // Framework web
  "cors": "^2.8.5",               // CORS middleware
  "dotenv": "^16.3.1",            // Variáveis de ambiente
  "bcryptjs": "^2.4.3",           // Hash de senhas
  "jsonwebtoken": "^9.1.2",       // JWT tokens
  "helmet": "^7.1.0",             // Security headers
  "express-rate-limit": "^7.1.5", // Rate limiting
  "sqlite3": "^5.1.6",            // Database
  "sqlite": "^5.0.1",             // Promise wrapper
  "morgan": "^1.10.0",            // Request logging
  "nodemon": "^3.0.2"             // Dev hot reload
}
```

---

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Inicia com nodemon (hot reload)
npm start        # Inicia em produção
npm test         # Placeholder de testes
```

---

## 🐛 Troubleshooting

### Erro: Port 5000 already in use
**Solução:** 
- Mude `PORT=5001` em `.env`
- Ou feche outro processo usando porta 5000

### Erro: Cannot find module
**Solução:**
- Delete `node_modules/` e `package-lock.json`
- Execute `setup.bat` novamente

### Banco de dados vazio
**Solução:**
- Database é criado automaticamente na primeira execução
- Aguarde 5 segundos para `database.db` ser gerado
- 5 produtos de exemplo são inseridos automaticamente

### Erro de autenticação
**Solução:**
- Certifique-se que JWT_SECRET em `.env` é forte
- Use token retornado do `/api/auth/register` ou `/api/auth/login`
- Inclua header: `Authorization: Bearer <token>`

---

## 🚀 Próximas Fases

- [ ] Integrar MercadoPago para pagamentos
- [ ] Conectar frontend ao backend
- [ ] Implementar webhooks de pagamento
- [ ] Migrar para PostgreSQL em produção
- [ ] Deploy em servidor de produção

---

## 📞 Contacto

Para problemas ou dúvidas sobre o backend, consulte:
1. `BACKEND_SETUP_COMPLETO.txt` - Guia detalhado
2. `SETUP_AUTOMATIZADO.txt` - Guia simplificado
3. `BACKEND_QUICK_START.txt` - Quick start rápido

---

**Backend v1.0 - Pronto para Usar!** ✅

Desenvolvido para GlowUp Store

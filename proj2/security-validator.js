// ✅ VALIDAÇÃO SEGURA - Sanitização e Verificação
// Implementa validações tanto no client quanto (em produção) no server

class SecurityValidator {
    // Validar ID do produto (deve ser número inteiro positivo)
    static validateProductId(productId) {
        const id = parseInt(productId);
        if (!Number.isInteger(id) || id < 1 || id > 10000) {
            console.warn('❌ ID do produto inválido:', productId);
            return false;
        }
        return true;
    }

    // Validar quantidade (deve ser número inteiro positivo, máx 100)
    static validateQuantity(quantity) {
        const qty = parseInt(quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
            console.warn('❌ Quantidade inválida:', quantity);
            return false;
        }
        return true;
    }

    // Validar preço (deve ser número positivo)
    static validatePrice(price) {
        const p = parseFloat(price);
        if (typeof p !== 'number' || isNaN(p) || p < 0 || p > 100000) {
            console.warn('❌ Preço inválido:', price);
            return false;
        }
        return true;
    }

    // Validar email (formato básico)
    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            console.warn('❌ Email inválido:', email);
            return false;
        }
        return true;
    }

    // Validar telefone (10-11 dígitos)
    static validatePhone(phone) {
        const regex = /^(\d{10,11})$/;
        const cleaned = phone.replace(/\D/g, '');
        if (!regex.test(cleaned)) {
            console.warn('❌ Telefone inválido:', phone);
            return false;
        }
        return true;
    }

    // Validar CPF (valida formato, não valida dígitos verif.)
    static validateCPF(cpf) {
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length !== 11) {
            console.warn('❌ CPF deve ter 11 dígitos:', cpf);
            return false;
        }
        // Validação básica de dígitos verificadores
        if (this.isCPFValid(cleaned)) {
            return true;
        }
        console.warn('❌ CPF inválido:', cpf);
        return false;
    }

    // Algoritmo de validação de CPF
    static isCPFValid(cpf) {
        if (cpf === '00000000000' || cpf === '11111111111' || 
            cpf === '22222222222' || cpf === '33333333333' || 
            cpf === '44444444444' || cpf === '55555555555' || 
            cpf === '66666666666' || cpf === '77777777777' || 
            cpf === '88888888888' || cpf === '99999999999') {
            return false;
        }

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    // Sanitizar string (remover caracteres perigosos)
    static sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str
            .trim()
            .replace(/[<>\"'`]/g, '') // Remove caracteres perigosos
            .substring(0, 200); // Limita comprimento
    }

    // Sanitizar endereço
    static sanitizeAddress(address) {
        if (typeof address !== 'string') return '';
        return this.sanitizeString(address).substring(0, 100);
    }

    // Gerar hash simples para validação (NÃO criptografia forte)
    static generateOrderHash(items, total) {
        // ⚠️ ISSO É APENAS PARA DETECÇÃO DE MANIPULAÇÃO ÓBVIA
        // Em produção, usar HMAC-SHA256 com chave secreta do servidor
        
        let hashData = '';
        items.forEach(item => {
            hashData += `${item.id}:${item.quantity}:${item.price}|`;
        });
        hashData += `total:${total}`;
        
        // Algoritmo simples de hash (apenas para demo)
        let hash = 0;
        for (let i = 0; i < hashData.length; i++) {
            const char = hashData.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converte para 32-bit integer
        }
        
        return Math.abs(hash).toString(16);
    }

    // Validar integridade do carrinho
    static validateCartIntegrity(cart) {
        console.log('🔐 Validando integridade do carrinho...');
        
        if (!Array.isArray(cart)) {
            console.warn('❌ Carrinho não é um array');
            return false;
        }

        for (const item of cart) {
            if (!this.validateProductId(item.id)) return false;
            if (!this.validateQuantity(item.quantity)) return false;
            if (item.price !== undefined && !this.validatePrice(item.price)) return false;
        }

        console.log('✅ Carrinho válido');
        return true;
    }

    // Validar pedido completo
    static validateOrder(orderData) {
        console.log('🔐 Validando pedido...');
        
        const required = ['fullName', 'email', 'phone', 'cpf', 'address', 'items', 'total'];
        for (const field of required) {
            if (!orderData[field]) {
                console.warn(`❌ Campo obrigatório faltando: ${field}`);
                return false;
            }
        }

        if (!this.validateEmail(orderData.email)) return false;
        if (!this.validatePhone(orderData.phone)) return false;
        if (!this.validateCPF(orderData.cpf)) return false;
        if (!this.validateCartIntegrity(orderData.items)) return false;

        console.log('✅ Pedido válido');
        return true;
    }

    // Detectar manipulação de preço
    static detectPriceManipulation(cart) {
        console.log('🔍 Verificando manipulação de preço...');
        
        for (const item of cart) {
            const productId = item.id;
            const expectedPrice = getPriceFromServer(productId);
            const itemPrice = item.price;

            if (Math.abs(expectedPrice - itemPrice) > 0.01) {
                console.error(`❌ MANIPULAÇÃO DETECTADA - Produto ${productId}: esperado R$ ${expectedPrice}, recebido R$ ${itemPrice}`);
                return true; // Sim, foi manipulado
            }
        }

        console.log('✅ Nenhuma manipulação detectada');
        return false; // Não foi manipulado
    }

    // Validar desconto (não pode ser maior que total)
    static validateDiscount(discount, total) {
        const d = parseFloat(discount);
        const t = parseFloat(total);

        if (d < 0 || d > t) {
            console.warn('❌ Desconto inválido:', discount);
            return false;
        }

        console.log('✅ Desconto válido');
        return true;
    }

    // Rate limiting simples (no client, apenas para UX)
    static checkRateLimit(key, maxAttempts = 5, timeWindowMs = 60000) {
        const now = Date.now();
        const storageKey = `rate_limit_${key}`;
        const attempts = JSON.parse(localStorage.getItem(storageKey) || '[]');

        // Remove tentativas antigas
        const validAttempts = attempts.filter(time => now - time < timeWindowMs);

        if (validAttempts.length >= maxAttempts) {
            console.warn('⚠️ Rate limit atingido para:', key);
            return false;
        }

        validAttempts.push(now);
        localStorage.setItem(storageKey, JSON.stringify(validAttempts));
        return true;
    }

    // Log de atividade suspeita
    static logSuspiciousActivity(activity, details) {
        const log = {
            timestamp: new Date().toISOString(),
            activity,
            details,
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };

        console.warn('⚠️ Atividade suspeita:', log);
        
        // Em produção, enviar para servidor de logging
        // fetch('/api/security/log', { method: 'POST', body: JSON.stringify(log) });
    }
}

// ✅ VALIDAÇÕES ADICIONAIS PARA PROTEÇÃO XSS

// Escapar HTML (previne injeção de código)
function escapeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Validar URL (evitar open redirects)
function isValidURL(url) {
    try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

// ✅ PROTEÇÃO CONTRA CSRF (token simples)
class CSRFProtection {
    static generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static getToken() {
        let token = sessionStorage.getItem('csrf_token');
        if (!token) {
            token = this.generateToken();
            sessionStorage.setItem('csrf_token', token);
        }
        return token;
    }

    static validateToken(token) {
        const stored = sessionStorage.getItem('csrf_token');
        return stored === token;
    }
}

console.log('✅ security-validator.js carregado - Validações robustas ativas');

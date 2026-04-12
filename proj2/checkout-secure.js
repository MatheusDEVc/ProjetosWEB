// ✅ CHECKOUT SEGURO - Validações completas e proteções

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('checkout-form')) {
        setupCheckoutSecure();
        loadOrderSummarySecure();
    }
});

function setupCheckoutSecure() {
    const form = document.getElementById('checkout-form');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updatePaymentMethod(this.value);
        });
    });

    form.addEventListener('submit', handleCheckoutSubmitSecure);
    
    // Mostrar método de pagamento por cartão por padrão
    updatePaymentMethod('credit');
    
    // Adicionar token CSRF
    addCSRFToken();
}

// Adicionar token CSRF ao formulário
function addCSRFToken() {
    const token = CSRFProtection.getToken();
    let input = document.querySelector('input[name="csrf_token"]');
    
    if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf_token';
        document.getElementById('checkout-form').appendChild(input);
    }
    
    input.value = token;
    console.log('🔐 Token CSRF adicionado');
}

function updatePaymentMethod(method) {
    const cardPayment = document.getElementById('card-payment');
    const pixPayment = document.getElementById('pix-payment');
    const boletoPayment = document.getElementById('boleto-payment');

    cardPayment.style.display = 'none';
    pixPayment.style.display = 'none';
    boletoPayment.style.display = 'none';

    if (method === 'credit' || method === 'debit') {
        cardPayment.style.display = 'block';
    } else if (method === 'pix') {
        pixPayment.style.display = 'block';
    } else if (method === 'boleto') {
        boletoPayment.style.display = 'block';
    }
}

function loadOrderSummarySecure() {
    console.log('📋 Carregando resumo do pedido de forma segura...');
    
    const cart = getCart();
    const summaryItems = document.getElementById('summary-items');

    if (!summaryItems) return;

    // ✅ VALIDAR INTEGRIDADE DO CARRINHO PRIMEIRO
    if (!SecurityValidator.validateCartIntegrity(cart)) {
        console.error('❌ Carrinho corrompido ou inválido!');
        alert('Erro: Seu carrinho pode ter sido alterado. Recarregue a página.');
        return;
    }

    // ✅ DETECTAR MANIPULAÇÃO DE PREÇO
    if (SecurityValidator.detectPriceManipulation(cart)) {
        console.error('❌ MANIPULAÇÃO DE PREÇO DETECTADA!');
        SecurityValidator.logSuspiciousActivity('price_manipulation', {
            cart,
            timestamp: new Date()
        });
        alert('Erro: Preços foram alterados. Por segurança, seu carrinho foi resetado.');
        localStorage.removeItem('glowupCart');
        location.reload();
        return;
    }

    let subtotal = 0;
    summaryItems.innerHTML = cart.map(item => {
        // ✅ VALIDAR CADA ITEM
        if (!SecurityValidator.validateProductId(item.id) || !SecurityValidator.validateQuantity(item.quantity)) {
            console.error('❌ Item do carrinho inválido:', item);
            return '';
        }

        const product = PRODUCTS.find(p => p.id === item.id);
        if (!product) {
            console.error('❌ Produto não encontrado:', item.id);
            return '';
        }

        // ✅ SEMPRE OBTER PREÇO DO SERVIDOR (não do carrinho)
        const price = getPriceFromServer(item.id);
        
        if (!SecurityValidator.validatePrice(price)) {
            console.error('❌ Preço inválido do servidor:', price);
            return '';
        }

        const total = price * item.quantity;
        subtotal += total;

        return `
            <div class="summary-item">
                <span>${escapeHTML(product.name)} (x${item.quantity})</span>
                <span>R$ ${total.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    const shippingCost = 15; // Valor fixo, não pode ser alterado
    const discountRaw = sessionStorage.getItem('discount') || 0;
    const discount = parseFloat(discountRaw);

    // ✅ VALIDAR DESCONTO
    if (!SecurityValidator.validateDiscount(discount, subtotal + shippingCost)) {
        console.warn('❌ Desconto inválido, removido');
        sessionStorage.removeItem('discount');
        const finalTotal = subtotal + shippingCost;
        document.getElementById('summary-discount').textContent = 'R$ 0,00';
        document.getElementById('summary-total').textContent = 'R$ ' + finalTotal.toFixed(2);
    } else {
        const finalTotal = subtotal + shippingCost - discount;
        document.getElementById('summary-discount').textContent = discount > 0 ? '- R$ ' + discount.toFixed(2) : 'R$ 0,00';
        document.getElementById('summary-total').textContent = 'R$ ' + finalTotal.toFixed(2);
    }

    document.getElementById('summary-subtotal').textContent = 'R$ ' + subtotal.toFixed(2);
    document.getElementById('summary-shipping').textContent = 'R$ ' + shippingCost.toFixed(2);
    
    console.log('✅ Resumo carregado com segurança');
}

function handleCheckoutSubmitSecure(e) {
    e.preventDefault();

    try {
        console.log('🔐 Processando checkout seguro...');

        // ✅ VERIFICAR RATE LIMIT
        if (!SecurityValidator.checkRateLimit('checkout', 3, 60000)) {
            alert('Você está tentando muito rápido. Aguarde 1 minuto.');
            return;
        }

        // ✅ VALIDAR CSRF TOKEN
        const token = document.querySelector('input[name="csrf_token"]').value;
        if (!CSRFProtection.validateToken(token)) {
            console.error('❌ Token CSRF inválido!');
            SecurityValidator.logSuspiciousActivity('csrf_token_invalid', {
                receivedToken: token,
                sessionToken: sessionStorage.getItem('csrf_token')
            });
            alert('Erro de segurança: Token inválido. Recarregue a página.');
            return;
        }

        // ✅ VALIDAR FORMULÁRIO
        if (!validateFormSecure()) {
            return;
        }

        // ✅ CONSTRUIR PEDIDO SEGURO
        const orderData = buildSecureOrder();
        if (!orderData) return;

        // ✅ VALIDAR PEDIDO COMPLETO
        if (!SecurityValidator.validateOrder(orderData)) {
            alert('Erro: Dados do pedido inválidos. Verifique e tente novamente.');
            return;
        }

        // ✅ GERAR HASH DO PEDIDO (para validação futura)
        const orderHash = SecurityValidator.generateOrderHash(
            orderData.items,
            orderData.total
        );
        orderData.hash = orderHash;

        console.log('✅ Pedido validado e seguro');
        console.log('🔐 Hash do pedido:', orderHash);

        // Processar pagamento
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        processPaymentSecure(paymentMethod, orderData);

    } catch (error) {
        console.error('❌ Erro ao submeter checkout:', error);
        SecurityValidator.logSuspiciousActivity('checkout_error', {
            error: error.message,
            stack: error.stack
        });
        alert('Erro ao processar o formulário. Tente novamente.');
    }
}

function validateFormSecure() {
    console.log('✓ Validando formulário...');

    const fullName = document.getElementById('full-name')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const phone = document.getElementById('phone')?.value?.trim() || '';
    const cpf = document.getElementById('cpf')?.value?.trim() || '';
    const address = document.getElementById('address')?.value?.trim() || '';

    // ✅ VALIDAR CADA CAMPO
    if (!fullName || fullName.length < 3 || fullName.length > 100) {
        alert('Nome deve ter entre 3 e 100 caracteres');
        return false;
    }

    if (!SecurityValidator.validateEmail(email)) {
        alert('Email inválido');
        return false;
    }

    if (!SecurityValidator.validatePhone(phone)) {
        alert('Telefone deve ter 10 ou 11 dígitos');
        return false;
    }

    if (!SecurityValidator.validateCPF(cpf)) {
        alert('CPF inválido');
        return false;
    }

    if (!address || address.length < 5 || address.length > 100) {
        alert('Endereço deve ter entre 5 e 100 caracteres');
        return false;
    }

    console.log('✅ Formulário válido');
    return true;
}

function buildSecureOrder() {
    console.log('📦 Construindo pedido seguro...');

    const cart = getCart();
    
    // ✅ REVALIDAR CARRINHO
    if (!SecurityValidator.validateCartIntegrity(cart)) {
        alert('Erro: Carrinho corrompido');
        return null;
    }

    // ✅ CONSTRUIR ITENS COM PREÇO SEGURO
    const items = cart.map(item => {
        const price = getPriceFromServer(item.id);
        return {
            id: item.id,
            quantity: item.quantity,
            price: price // Sempre do servidor
        };
    });

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 15;
    const discount = parseFloat(sessionStorage.getItem('discount') || 0);
    const total = subtotal + shipping - discount;

    // ✅ VALIDAR TOTAL
    if (!SecurityValidator.validatePrice(total)) {
        alert('Erro: Total inválido');
        return null;
    }

    return {
        fullName: SecurityValidator.sanitizeString(document.getElementById('full-name').value),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.replace(/\D/g, ''),
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
        address: SecurityValidator.sanitizeAddress(document.getElementById('address').value),
        items,
        subtotal,
        shipping,
        discount,
        total,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        timestamp: new Date().toISOString()
    };
}

function processPaymentSecure(method, orderData) {
    console.log('💳 Processando pagamento seguro...');
    
    // Simular processamento (em produção, conectar com MercadoPago)
    alert(`✅ Pagamento via ${method === 'credit' ? 'Crédito' : method === 'debit' ? 'Débito' : method === 'pix' ? 'PIX' : 'Boleto'} de R$ ${orderData.total.toFixed(2)}`);

    // Salvar pedido
    if (typeof saveOrder === 'function') {
        saveOrder(orderData);
    }

    // Limpar carrinho
    localStorage.removeItem('glowupCart');
    
    // Redirecionar
    setTimeout(() => {
        window.location.href = 'pedidos.html';
    }, 1500);
}

console.log('✅ checkout-secure.js carregado - Checkout com segurança ativa');

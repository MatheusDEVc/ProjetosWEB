// Lógica de Checkout e Pagamento

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('checkout-form')) {
        setupCheckout();
        loadOrderSummary();
    }
});

function setupCheckout() {
    const form = document.getElementById('checkout-form');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updatePaymentMethod(this.value);
        });
    });

    form.addEventListener('submit', handleCheckoutSubmit);

    // Mostrar método de pagamento por cartão por padrão
    updatePaymentMethod('credit');
}

function updatePaymentMethod(method) {
    const cardPayment = document.getElementById('card-payment');
    const pixPayment = document.getElementById('pix-payment');
    const boletoPayment = document.getElementById('boleto-payment');

    // Ocultar todos
    cardPayment.style.display = 'none';
    pixPayment.style.display = 'none';
    boletoPayment.style.display = 'none';

    // Mostrar o método selecionado
    if (method === 'credit' || method === 'debit') {
        cardPayment.style.display = 'block';
    } else if (method === 'pix') {
        pixPayment.style.display = 'block';
    } else if (method === 'boleto') {
        boletoPayment.style.display = 'block';
    }
}

function loadOrderSummary() {
    const cart = getCart();
    const summaryItems = document.getElementById('summary-items');

    if (!summaryItems) return;

    let subtotal = 0;
    summaryItems.innerHTML = cart.map(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        if (!product) return '';
        
        const total = product.price * item.quantity;
        subtotal += total;

        return `
            <div class="summary-item">
                <span>${product.name} (x${item.quantity})</span>
                <span>R$ ${total.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    const shippingCost = 15;
    const discount = parseFloat(sessionStorage.getItem('discount') || 0);
    const finalTotal = subtotal + shippingCost - discount;

    document.getElementById('summary-subtotal').textContent = 'R$ ' + subtotal.toFixed(2);
    document.getElementById('summary-shipping').textContent = 'R$ ' + shippingCost.toFixed(2);
    document.getElementById('summary-discount').textContent = discount > 0 ? '- R$ ' + discount.toFixed(2) : 'R$ 0,00';
    document.getElementById('summary-total').textContent = 'R$ ' + finalTotal.toFixed(2);
}

function handleCheckoutSubmit(e) {
    e.preventDefault();

    // Validações básicas
    if (!validateForm()) {
        return;
    }

    // Simular processamento de pagamento
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    processPayment(paymentMethod);
}

function validateForm() {
    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const address = document.getElementById('address').value.trim();
    const terms = document.getElementById('terms').checked;

    if (!fullName || !email || !phone || !cpf || !address || !terms) {
        alert('Por favor, preencha todos os campos obrigatórios e aceite os termos.');
        return false;
    }

    if (!validateEmail(email)) {
        alert('Por favor, insira um email válido.');
        return false;
    }

    return true;
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function processPayment(method) {
    // Mostrar loading
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processando pagamento...';

    // Simular processamento de 2 segundos
    setTimeout(() => {
        // Simular sucesso (90% de chance)
        if (Math.random() < 0.9) {
            completeOrder();
        } else {
            alert('Houve um erro no processamento. Tente novamente.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }, 2000);
}

function completeOrder() {
    // Gerar número de pedido único
    const orderNumber = 'GU' + Date.now().toString().slice(-8).toUpperCase();
    const orderTotal = document.getElementById('summary-total').textContent;
    
    // Extrair valor numérico do total
    const totalValue = parseFloat(orderTotal.replace('R$ ', '').replace(',', '.'));

    // Obter dados do carrinho
    const cart = getCart();

    // Obter dados do formulário
    const customerData = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        cpf: document.getElementById('cpf').value,
        address: document.getElementById('address').value,
        number: document.getElementById('number').value,
        complement: document.getElementById('complement').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value
    };

    // Obter método de pagamento
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // Salvar pedido
    saveOrder(orderNumber, cart, totalValue, customerData, paymentMethod);

    // Limpar carrinho
    localStorage.removeItem('glowupCart');
    sessionStorage.removeItem('discount');

    // Mostrar mensagem de sucesso
    document.querySelector('.checkout-container').style.display = 'none';
    document.querySelector('.form-section:first-of-type').parentElement.style.display = 'none';
    
    const successMessage = document.getElementById('success-message');
    successMessage.style.display = 'block';

    document.getElementById('order-number').textContent = orderNumber;
    document.getElementById('order-total').textContent = orderTotal;

    // Limpar sessão após 3 segundos para próxima compra
    setTimeout(() => {
        // Página fica exibindo a mensagem de sucesso
    }, 3000);
}

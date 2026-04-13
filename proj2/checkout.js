// Lógica de Checkout e Pagamento

document.addEventListener('DOMContentLoaded', async function() {
    if (document.getElementById('checkout-form')) {
        if (!requireAuth('login.html')) return;
        setupCheckout();
        loadOrderSummary();
        prefillCheckoutFields();
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

    try {
        if (!validateForm()) {
            return;
        }

        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        processPayment(paymentMethod);
    } catch (error) {
        console.error('Erro ao submeter checkout:', error);
        alert('Erro ao processar o formulário. Tente novamente.');
    }
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
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processando pagamento...';

    setTimeout(async () => {
        try {
            await completeOrder();
        } catch (error) {
            console.error('Erro no processamento de pagamento:', error);
            alert('Houve um erro no processamento. Tente novamente.\n\nDetalhes: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }, 2000);
}

async function completeOrder() {
    try {
        if (!requireAuth('login.html')) {
            return;
        }

        const orderTotal = document.getElementById('summary-total').textContent;
        const totalValue = parseFloat(orderTotal.replace('R$ ', '').replace(',', '.'));
        const cart = getCart();

        if (!cart.length) {
            throw new Error('Carrinho vazio. Adicione produtos antes de finalizar.');
        }

        const customerData = {
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            cpf: document.getElementById('cpf').value,
            address: document.getElementById('address').value,
            number: document.getElementById('number').value || '',
            complement: document.getElementById('complement').value || '',
            city: document.getElementById('city').value || '',
            state: document.getElementById('state').value || '',
            zip: document.getElementById('zip').value || ''
        };

        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const items = cart.map(item => {
            const product = PRODUCTS.find(p => p.id === item.id);
            return {
                id: item.id,
                quantity: item.quantity,
                price: product ? product.price : 0
            };
        });

        const backendOrder = await submitOrderToBackend({
            items,
            total: totalValue,
            paymentMethod,
            address: formatCheckoutAddress(customerData),
            orderHash: generateOrderHash()
        });

        localStorage.removeItem('glowupCart');
        sessionStorage.removeItem('discount');

        const checkoutContainer = document.querySelector('.checkout-container');
        if (checkoutContainer) {
            checkoutContainer.style.display = 'none';
        }

        const successMessage = document.getElementById('success-message');
        if (successMessage) {
            successMessage.style.display = 'block';
            document.getElementById('order-number').textContent = backendOrder.orderNumber || 'N/A';
            document.getElementById('order-total').textContent = orderTotal;
        }

        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Erro ao processar pedido:', error);
        alert('Erro ao processar pedido. Por favor, tente novamente.\n\n' + error.message);
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar Pedido';
        }
    }
}

async function submitOrderToBackend(orderPayload) {
    const response = await fetchJson('/api/orders', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(orderPayload)
    });
    return response.order;
}

function formatCheckoutAddress(data) {
    return `${data.address}, ${data.number}${data.complement ? ' - ' + data.complement : ''}, ${data.city} - ${data.state}, ${data.zip}`;
}

function prefillCheckoutFields() {
    const user = getUser();
    if (!user) return;

    const fullName = document.getElementById('full-name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const cpf = document.getElementById('cpf');

    if (fullName && user.full_name) fullName.value = user.full_name;
    if (email && user.email) email.value = user.email;
    if (phone && user.phone) phone.value = user.phone;
    if (cpf && user.cpf) cpf.value = user.cpf;
}


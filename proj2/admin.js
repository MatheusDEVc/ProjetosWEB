// Painel Administrativo - Gerenciamento de Pedidos

let filteredOrders = [];
let currentSearch = '';
let currentStatusFilter = '';
let currentSort = 'newest';

document.addEventListener('DOMContentLoaded', function() {
    loadAdminDashboard();
    setupFilterListeners();
});

function loadAdminDashboard() {
    const orders = getAllOrders();
    filteredOrders = [...orders];
    
    displayStatistics(orders);
    renderOrders(filteredOrders);
}

function displayStatistics(orders) {
    const stats = {
        total: orders.length,
        confirmado: orders.filter(o => o.currentStatus === 'confirmado').length,
        processando: orders.filter(o => o.currentStatus === 'processando').length,
        preparando: orders.filter(o => o.currentStatus === 'preparando').length,
        enviado: orders.filter(o => o.currentStatus === 'enviado').length,
        entregue: orders.filter(o => o.currentStatus === 'entregue').length,
        cancelado: orders.filter(o => o.currentStatus === 'cancelado').length
    };

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const statsHtml = `
        <div class="stat-card">
            <div class="stat-label">Total de Pedidos</div>
            <div class="stat-number">${stats.total}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Receita Total</div>
            <div class="stat-number">R$ ${totalRevenue.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Entregues ✅</div>
            <div class="stat-number">${stats.entregue}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Pendentes</div>
            <div class="stat-number">${stats.total - stats.entregue - stats.cancelado}</div>
        </div>
    `;

    document.getElementById('stats-section').innerHTML = statsHtml;
}

function setupFilterListeners() {
    document.getElementById('search-order').addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase();
    });

    document.getElementById('filter-status').addEventListener('change', function(e) {
        currentStatusFilter = e.target.value;
    });

    document.getElementById('sort-orders').addEventListener('change', function(e) {
        currentSort = e.target.value;
    });
}

function applyFilters() {
    let orders = getAllOrders();

    // Aplicar filtro de busca
    if (currentSearch) {
        orders = orders.filter(order => 
            order.orderNumber.toLowerCase().includes(currentSearch) ||
            order.customerData.email.toLowerCase().includes(currentSearch)
        );
    }

    // Aplicar filtro de status
    if (currentStatusFilter) {
        orders = orders.filter(order => order.currentStatus === currentStatusFilter);
    }

    // Aplicar ordenação
    orders = sortOrders(orders, currentSort);

    filteredOrders = orders;
    renderOrders(filteredOrders);
}

function sortOrders(orders, sortType) {
    const sorted = [...orders];

    switch(sortType) {
        case 'oldest':
            return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'highest':
            return sorted.sort((a, b) => b.total - a.total);
        case 'lowest':
            return sorted.sort((a, b) => a.total - b.total);
        case 'newest':
        default:
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}

function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');

    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <h3>📭 Nenhum pedido encontrado</h3>
                <p>Tente ajustar os filtros</p>
            </div>
        `;
        return;
    }

    const ordersHtml = orders.map(order => createOrderCard(order)).join('');
    ordersList.innerHTML = ordersHtml;
}

function createOrderCard(order) {
    const statusInfo = ORDER_STATUSES[order.currentStatus];
    const formattedDate = formatDate(new Date(order.createdAt));
    const lastUpdate = order.statusHistory[order.statusHistory.length - 1];
    const lastUpdateTime = formatTime(new Date(lastUpdate.timestamp));

    const itemsHtml = order.items.map(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        return `
            <div class="item">
                <span>${product ? product.name : 'Produto não encontrado'} (x${item.quantity})</span>
                <span>R$ ${product ? (product.price * item.quantity).toFixed(2) : '0.00'}</span>
            </div>
        `;
    }).join('');

    const statusButtonsHtml = Object.keys(ORDER_STATUSES).map(status => {
        const isActive = order.currentStatus === status;
        const statusLabel = ORDER_STATUSES[status].label;
        const statusIcon = ORDER_STATUSES[status].icon;
        return `
            <button class="status-btn ${isActive ? 'active' : ''}" 
                    onclick="updateOrderStatus('${order.orderNumber}', '${status}')"
                    ${status === 'cancelado' ? '' : ''}>
                ${statusIcon} ${statusLabel}
            </button>
        `;
    }).join('');

    const historyHtml = order.statusHistory.map((item, index) => {
        const timestamp = new Date(item.timestamp);
        const time = formatTime(timestamp);
        const statusIcon = ORDER_STATUSES[item.status]?.icon || '📌';
        const statusLabel = ORDER_STATUSES[item.status]?.label || item.status;
        
        return `
            <div class="history-item">
                <strong>${statusIcon} ${statusLabel}</strong>
                <div class="history-time">${time}</div>
                <div>${item.message}</div>
            </div>
        `;
    }).reverse().join('');

    return `
        <div class="order-card-admin status-${order.currentStatus}">
            <!-- Header -->
            <div class="order-card-header">
                <div>
                    <div class="order-number">Pedido #${order.orderNumber}</div>
                    <div class="order-date">📅 ${formattedDate}</div>
                </div>
                <div class="current-status-badge">
                    ${statusInfo.icon} ${statusInfo.label}
                </div>
            </div>

            <!-- Customer Info -->
            <div class="order-customer">
                <div class="customer-info">
                    <strong>👤 Cliente</strong>
                    <span>${order.customerData.fullName}</span>
                    <span>${order.customerData.email}</span>
                </div>
                <div class="customer-info">
                    <strong>📞 Contato</strong>
                    <span>${order.customerData.phone}</span>
                    <span>${order.customerData.cpf}</span>
                </div>
                <div class="customer-info">
                    <strong>📦 Entrega</strong>
                    <span>${order.customerData.address}, ${order.customerData.number}</span>
                    <span>${order.customerData.city}, ${order.customerData.state} ${order.customerData.zip}</span>
                </div>
                <div class="customer-info">
                    <strong>💳 Pagamento</strong>
                    <span>${getPaymentMethodLabel(order.paymentMethod)}</span>
                    <span style="color: #10b981; font-weight: bold;">Total: R$ ${order.total.toFixed(2)}</span>
                </div>
            </div>

            <!-- Items -->
            <div class="order-items">
                <h4>📋 Produtos do Pedido</h4>
                ${itemsHtml}
                <div class="item" style="margin-top: 10px; border-top: 2px solid #ddd; padding-top: 10px;">
                    <strong>Total:</strong>
                    <strong>R$ ${order.total.toFixed(2)}</strong>
                </div>
            </div>

            <!-- Status Management -->
            <div class="order-status-section">
                <h4>🔄 Alterar Status</h4>
                <p style="color: #666; margin: 10px 0;">Clique no botão para alterar o status do pedido</p>
                <div class="status-selector">
                    ${statusButtonsHtml}
                </div>
            </div>

            <!-- Status History -->
            <div class="status-history">
                <h4>📜 Histórico de Status</h4>
                ${historyHtml}
            </div>
        </div>
    `;
}

function updateOrderStatus(orderNumber, newStatus) {
    const orders = getAllOrders();
    const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber);

    if (orderIndex === -1) {
        alert('Pedido não encontrado!');
        return;
    }

    const order = orders[orderIndex];
    const statusInfo = ORDER_STATUSES[newStatus];

    // Mensagens personalizadas para cada status
    const statusMessages = {
        'confirmado': 'Seu pedido foi confirmado com sucesso!',
        'processando': 'Seu pedido está sendo processado pelo nosso sistema.',
        'preparando': 'Estamos preparando seu pedido para envio.',
        'enviado': 'Seu pedido saiu para entrega! 🚚',
        'entregue': 'Seu pedido foi entregue com sucesso! Obrigado por sua compra! 🎉',
        'cancelado': 'Seu pedido foi cancelado.'
    };

    // Atualizar status
    order.currentStatus = newStatus;
    order.addStatusUpdate(newStatus, statusMessages[newStatus]);

    // Salvar alterações
    updateOrderInStorage(order);

    // Atualizar exibição
    loadAdminDashboard();

    // Notificar
    showNotification(`Status do pedido ${orderNumber} atualizado para ${statusInfo.label}!`, 'success');
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
}

function formatTime(date) {
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    };
    return date.toLocaleDateString('pt-BR', options);
}

function getPaymentMethodLabel(method) {
    const methods = {
        'credit': '💳 Cartão de Crédito',
        'debit': '🏦 Cartão de Débito',
        'pix': '📱 PIX',
        'boleto': '📄 Boleto'
    };
    return methods[method] || method;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Recarregar pedidos a cada 10 segundos para sincronização
setInterval(() => {
    loadAdminDashboard();
}, 10000);

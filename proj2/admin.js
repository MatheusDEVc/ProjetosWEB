// Painel Administrativo - Gerenciamento de Pedidos

let allOrders = [];
let filteredOrders = [];
let allProducts = [];
let siteSettings = {};
let currentSearch = '';
let currentStatusFilter = '';
let currentSort = 'newest';

const API_BASE = 'http://localhost:5000';

function apiHeaders() {
    return getAuthHeader();
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!await requireAdmin('login.html')) return;
    setupAdminTabs();
    await loadAdminDashboard();
    setupFilterListeners();
    setupSiteSettingsListeners();
    setupProductListeners();
});

async function loadAdminDashboard() {
    await Promise.all([loadAdminOrders(), loadSiteSettings(), loadAdminProducts()]);
}

async function loadAdminOrders() {
    const orders = await fetchAdminOrders();
    allOrders = orders;
    filteredOrders = [...orders];
    displayStatistics(orders);
    renderOrders(filteredOrders);
}

async function loadSiteSettings() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/site-settings`, {
            headers: apiHeaders()
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Erro ao carregar configurações');
        siteSettings = body.data;
        renderSiteSettings();
    } catch (error) {
        console.error('Erro ao carregar configurações do site:', error);
        alert('Não foi possível carregar as configurações do site.');
    }
}

function renderSiteSettings() {
    document.getElementById('site-title').value = siteSettings.site_title || '';
    document.getElementById('hero-title').value = siteSettings.hero_title || '';
    document.getElementById('hero-subtitle').value = siteSettings.hero_subtitle || '';
    document.getElementById('hero-button-primary').value = siteSettings.hero_button_primary || '';
    document.getElementById('hero-button-secondary').value = siteSettings.hero_button_secondary || '';
    document.getElementById('footer-about').value = siteSettings.footer_about || '';
    document.getElementById('footer-email').value = siteSettings.footer_email || '';
    document.getElementById('footer-phone').value = siteSettings.footer_phone || '';
}

function setupSiteSettingsListeners() {
    const saveSiteBtn = document.getElementById('save-site-settings');
    if (saveSiteBtn) {
        saveSiteBtn.addEventListener('click', saveSiteSettings);
    }
}

async function saveSiteSettings() {
    try {
        const payload = {
            settings: {
                site_title: document.getElementById('site-title').value,
                hero_title: document.getElementById('hero-title').value,
                hero_subtitle: document.getElementById('hero-subtitle').value,
                hero_button_primary: document.getElementById('hero-button-primary').value,
                hero_button_secondary: document.getElementById('hero-button-secondary').value,
                footer_about: document.getElementById('footer-about').value,
                footer_email: document.getElementById('footer-email').value,
                footer_phone: document.getElementById('footer-phone').value
            }
        };

        const response = await fetch(`${API_BASE}/api/admin/site-settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...apiHeaders()
            },
            body: JSON.stringify(payload)
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Erro ao salvar configurações');
        siteSettings = body.data;
        alert('Configurações do site atualizadas com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar configurações do site:', error);
        alert('Falha ao salvar as configurações do site: ' + error.message);
    }
}

async function loadAdminProducts() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/products`, {
            headers: apiHeaders()
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Erro ao carregar produtos');
        allProducts = body.data;
        renderProductTable();
    } catch (error) {
        console.error('Erro ao carregar produtos admin:', error);
        alert('Não foi possível carregar os produtos do painel.');
    }
}

function renderProductTable() {
    const tbody = document.getElementById('admin-product-list');
    if (!tbody) return;
    if (!allProducts || !allProducts.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 16px; text-align:center;">Nenhum produto encontrado.</td></tr>`;
        return;
    }

    tbody.innerHTML = allProducts.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.gender}</td>
            <td>R$ ${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button class="btn-edit" onclick="openProductForm(${product.id})">Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

function setupProductListeners() {
    const newProductBtn = document.getElementById('new-product-btn');
    const saveProductBtn = document.getElementById('save-product-btn');
    const cancelProductBtn = document.getElementById('cancel-product-btn');

    if (newProductBtn) {
        newProductBtn.addEventListener('click', () => openProductForm());
    }
    if (saveProductBtn) {
        saveProductBtn.addEventListener('click', submitProductForm);
    }
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', closeProductForm);
    }
}

function openProductForm(productId) {
    const panel = document.getElementById('product-form-panel');
    const title = document.getElementById('product-form-title');
    const product = allProducts.find(item => item.id === productId) || null;

    title.textContent = product ? 'Editar produto' : 'Novo produto';
    panel.style.display = 'block';
    panel.dataset.editId = product ? product.id : '';

    document.getElementById('product-name').value = product?.name || '';
    document.getElementById('product-category').value = product?.category || '';
    document.getElementById('product-gender').value = product?.gender || 'Feminino';
    document.getElementById('product-price').value = product?.price || '';
    document.getElementById('product-stock').value = product?.stock || 0;
    document.getElementById('product-image').value = product?.image_url || product?.image || '';
    document.getElementById('product-description').value = product?.description || '';
}

function closeProductForm() {
    const panel = document.getElementById('product-form-panel');
    if (!panel) return;
    panel.style.display = 'none';
    panel.dataset.editId = '';
}

async function submitProductForm() {
    try {
        const panel = document.getElementById('product-form-panel');
        const productId = panel?.dataset.editId;
        const payload = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            gender: document.getElementById('product-gender').value,
            price: parseFloat(document.getElementById('product-price').value) || 0,
            stock: parseInt(document.getElementById('product-stock').value, 10) || 0,
            image_url: document.getElementById('product-image').value,
            description: document.getElementById('product-description').value
        };

        const url = `${API_BASE}/api/admin/products${productId ? `/${productId}` : ''}`;
        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...apiHeaders()
            },
            body: JSON.stringify(payload)
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Erro ao salvar produto');

        await loadAdminProducts();
        closeProductForm();
        alert('Produto salvo com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert('Falha ao salvar produto: ' + error.message);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
        const response = await fetch(`${API_BASE}/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: apiHeaders()
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Erro ao excluir produto');
        await loadAdminProducts();
        alert('Produto removido com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Falha ao excluir produto: ' + error.message);
    }
}

function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            switchAdminTab(tab.dataset.section);
        });
    });
}

function switchAdminTab(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.toggle('admin-section-active', section.id === `admin-section-${sectionId}`);
    });
}

async function fetchAdminOrders() {
    try {
        const response = await fetchJson('/api/admin/orders', {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar pedidos admin:', error);
        alert('Não foi possível carregar os pedidos. Verifique se você está logado como admin.');
        return [];
    }
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
    let orders = [...allOrders];

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

    const addressText = order.customerData.address || 'Endereço não disponível';
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
                    <span>${addressText}</span>
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

async function updateOrderStatus(orderNumber, newStatus) {
    const orderIndex = allOrders.findIndex(o => o.orderNumber === orderNumber);

    if (orderIndex === -1) {
        alert('Pedido não encontrado!');
        return;
    }

    const order = allOrders[orderIndex];

    const statusMessages = {
        'confirmado': 'Seu pedido foi confirmado com sucesso!',
        'processando': 'Seu pedido está sendo processado pelo nosso sistema.',
        'preparando': 'Estamos preparando seu pedido para envio.',
        'enviado': 'Seu pedido saiu para entrega! 🚚',
        'entregue': 'Seu pedido foi entregue com sucesso! Obrigado por sua compra! 🎉',
        'cancelado': 'Seu pedido foi cancelado.'
    };

    try {
        await fetchJson(`/api/admin/orders/${order.id}/status`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ status: newStatus })
        });

        order.currentStatus = newStatus;
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            message: statusMessages[newStatus]
        });

        applyFilters();
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        alert('Falha ao atualizar status do pedido: ' + error.message);
        return;
    }

    await loadAdminDashboard();
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

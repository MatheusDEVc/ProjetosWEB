// Sistema de Rastreamento de Pedidos

const ORDER_STATUSES = {
    'confirmado': { label: 'Pedido Confirmado', icon: '✅', color: '#10b981' },
    'processando': { label: 'Em Processamento', icon: '⚙️', color: '#3b82f6' },
    'preparando': { label: 'Preparando Pedido', icon: '📦', color: '#f59e0b' },
    'enviado': { label: 'Saiu para Entrega', icon: '🚚', color: '#06b6d4' },
    'entregue': { label: 'Entregue', icon: '🎉', color: '#10b981' },
    'cancelado': { label: 'Cancelado', icon: '❌', color: '#ef4444' }
};

class Order {
    constructor(orderNumber, items, total, customerData, paymentMethod) {
        this.orderNumber = orderNumber;
        this.items = items;
        this.total = total;
        this.customerData = customerData;
        this.paymentMethod = paymentMethod;
        this.createdAt = new Date().toISOString();
        this.currentStatus = 'confirmado';
        this.statusHistory = [
            {
                status: 'confirmado',
                timestamp: new Date().toISOString(),
                message: 'Seu pedido foi confirmado com sucesso!'
            }
        ];
        this.estimatedDelivery = this.calculateEstimatedDelivery();
    }

    calculateEstimatedDelivery() {
        // Calcular data estimada de entrega (5-10 dias úteis)
        const date = new Date();
        const days = 7 + Math.floor(Math.random() * 3);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    addStatusUpdate(status, message) {
        if (ORDER_STATUSES[status]) {
            this.currentStatus = status;
            this.statusHistory.push({
                status: status,
                timestamp: new Date().toISOString(),
                message: message
            });
        }
    }

    getFormattedDate(isoDate) {
        const date = new Date(isoDate);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Função para salvar um novo pedido
function saveOrder(orderNumber, items, total, customerData, paymentMethod) {
    const order = new Order(orderNumber, items, total, customerData, paymentMethod);
    
    // Simular atualizações automáticas de status
    simulateStatusUpdates(order);
    
    const orders = getAllOrders();
    orders.push(order);
    
    localStorage.setItem('glowupOrders', JSON.stringify(orders));
    return order;
}

// Simular atualizações automáticas de status
function simulateStatusUpdates(order) {
    // Atualizar para "processando" após 1 segundo
    setTimeout(() => {
        order.addStatusUpdate('processando', 'Seu pedido está sendo processado pelo nosso sistema.');
        updateOrderInStorage(order);
    }, 1000);

    // Atualizar para "preparando" após 5 segundos
    setTimeout(() => {
        order.addStatusUpdate('preparando', 'Estamos preparando seu pedido para envio.');
        updateOrderInStorage(order);
    }, 5000);

    // Atualizar para "enviado" após 10 segundos
    setTimeout(() => {
        order.addStatusUpdate('enviado', 'Seu pedido saiu para entrega! 🚚');
        updateOrderInStorage(order);
    }, 10000);

    // Atualizar para "entregue" após 15 segundos
    setTimeout(() => {
        order.addStatusUpdate('entregue', 'Seu pedido foi entregue com sucesso! Obrigado por sua compra! 🎉');
        updateOrderInStorage(order);
    }, 15000);
}

// Atualizar um pedido específico no localStorage
function updateOrderInStorage(order) {
    const orders = getAllOrders();
    const index = orders.findIndex(o => o.orderNumber === order.orderNumber);
    if (index !== -1) {
        orders[index] = order;
        localStorage.setItem('glowupOrders', JSON.stringify(orders));
    }
}

// Obter todos os pedidos
function getAllOrders() {
    const orders = localStorage.getItem('glowupOrders');
    return orders ? JSON.parse(orders) : [];
}

// Obter um pedido específico
function getOrder(orderNumber) {
    const orders = getAllOrders();
    return orders.find(o => o.orderNumber === orderNumber);
}

// Obter status atual de um pedido
function getOrderStatus(orderNumber) {
    const order = getOrder(orderNumber);
    if (!order) return null;
    return {
        ...ORDER_STATUSES[order.currentStatus],
        status: order.currentStatus
    };
}

// Formatar data para exibição
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Formatar data e hora para exibição
function formatDateTime(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Obter porcentagem de progresso do pedido
function getOrderProgress(status) {
    const progressMap = {
        'confirmado': 20,
        'processando': 40,
        'preparando': 60,
        'enviado': 80,
        'entregue': 100,
        'cancelado': 0
    };
    return progressMap[status] || 0;
}

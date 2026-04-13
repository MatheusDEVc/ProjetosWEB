const API_BASE = 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'glowupAuthToken';
const AUTH_USER_KEY = 'glowupAuthUser';

function setAuth(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    updateAuthUI();
}

function clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    updateAuthUI();
}

function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getUser() {
    const userJson = localStorage.getItem(AUTH_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

function isAuthenticated() {
    return !!getAuthToken();
}

function getAuthHeader() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function requireAuth(redirectPage = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectPage;
        return false;
    }
    return true;
}

async function requireAdmin(redirectPage = 'index.html') {
    if (!requireAuth()) return false;
    const user = await fetchProfile();
    if (!user || user.role !== 'admin') {
        alert('Acesso restrito ao administrador');
        window.location.href = redirectPage;
        return false;
    }
    return true;
}

function isAdmin() {
    const user = getUser();
    return user?.role === 'admin';
}

function updateAuthUI() {
    const authActions = document.getElementById('auth-actions');
    if (!authActions) return;

    const user = getUser();
    if (user) {
        authActions.innerHTML = `
            <span class="user-badge">Olá, ${user.full_name.split(' ')[0]}</span>
            ${user.role === 'admin' ? '<a href="admin.html" class="btn btn-primary btn-small">Admin</a>' : ''}
            <button id="logout-btn" class="btn btn-secondary btn-small">Sair</button>
        `;
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                clearAuth();
                window.location.href = 'index.html';
            });
        }
    } else {
        authActions.innerHTML = `
            <a href="login.html" class="btn btn-primary btn-small">Entrar</a>
            <a href="register.html" class="btn btn-secondary btn-small">Criar conta</a>
        `;
    }
}

async function fetchJson(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
    }

    return data;
}

function generateOrderHash() {
    return `order_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

async function fetchOrders() {
    if (!isAuthenticated()) {
        return getAllOrders();
    }

    try {
        const response = await fetchJson('/api/orders', {
            headers: getAuthHeader()
        });
        return response.data.map(normalizeOrder);
    } catch (error) {
        console.warn('Falha ao carregar pedidos do backend:', error.message);
        return getAllOrders();
    }
}

function normalizeOrder(order) {
    try {
        if (typeof order.items === 'string') {
            order.items = JSON.parse(order.items);
        }
    } catch (error) {
        console.warn('Falha ao normalizar itens do pedido:', error);
    }
    return order;
}

async function fetchProfile() {
    if (!isAuthenticated()) return null;
    const response = await fetchJson('/api/auth/me', {
        headers: getAuthHeader()
    });
    return response.user;
}

window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});

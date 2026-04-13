// Lógica Principal da Aplicação

const API_BASE = 'http://localhost:5000';

async function apiGet(path) {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Erro ao buscar dados do servidor');
    }
    return response.json();
}

async function loadProducts() {
    try {
        const body = await apiGet('/api/products');
        if (!body.success || !Array.isArray(body.data)) {
            console.warn('Resposta inválida do backend de produtos, mantendo catálogo local.');
            return;
        }
        if (body.data.length === 0) {
            console.warn('Backend retornou 0 produtos, mantendo catálogo local.');
            return;
        }

        const backendProducts = body.data.map(product => ({
            ...product,
            image: product.image_url || product.image,
            description: product.description || '',
            fullDescription: product.full_description || product.description || '',
            specs: product.specs || [],
            benefits: product.benefits || []
        }));

        const localProducts = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
        const localProductsMap = new Map(localProducts.map(product => [product.id, product]));

        const merged = backendProducts.map(product => {
            const existing = localProductsMap.get(product.id);
            return existing ? { ...existing, ...product } : product;
        });

        for (const localProduct of localProducts) {
            if (!merged.some(product => product.id === localProduct.id)) {
                merged.push(localProduct);
            }
        }

        window.PRODUCTS = merged;
    } catch (error) {
        console.warn('Não foi possível carregar produtos do backend:', error.message);
    }
}

async function loadSiteSettings() {
    try {
        const response = await fetch(`${API_BASE}/api/site-settings`);
        if (!response.ok) throw new Error('Falha ao buscar configurações do site');

        const body = await response.json();
        if (!body.success || !body.data) throw new Error('Resposta inválida do servidor');

        applySiteSettings(body.data);
    } catch (error) {
        console.warn('Não foi possível carregar configurações do site:', error.message);
    }
}

function applySiteSettings(settings) {
    if (!settings) return;
    if (settings.site_title) {
        document.title = settings.site_title;
    }
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle && settings.hero_title) heroTitle.textContent = settings.hero_title;

    const heroSubtitle = document.getElementById('hero-subtitle');
    if (heroSubtitle && settings.hero_subtitle) heroSubtitle.textContent = settings.hero_subtitle;

    const heroButtonPrimary = document.getElementById('hero-button-primary');
    if (heroButtonPrimary && settings.hero_button_primary) heroButtonPrimary.textContent = settings.hero_button_primary;

    const heroButtonSecondary = document.getElementById('hero-button-secondary');
    if (heroButtonSecondary && settings.hero_button_secondary) heroButtonSecondary.textContent = settings.hero_button_secondary;

    const footerEmailEl = document.getElementById('footer-email');
    if (footerEmailEl && settings.footer_email) {
        footerEmailEl.textContent = `Email: ${settings.footer_email}`;
    }

    const footerPhoneEl = document.getElementById('footer-phone');
    if (footerPhoneEl && settings.footer_phone) {
        footerPhoneEl.textContent = `Telefone: ${settings.footer_phone}`;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ DOM Content Loaded');
    console.log('📦 PRODUCTS definido:', typeof PRODUCTS !== 'undefined' && PRODUCTS.length > 0);
    await loadSiteSettings();
    await loadProducts();
    
    // Carregar produtos em destaque na home
    const featuredProducts = document.getElementById('featured-products');
    console.log('🎯 Featured products container encontrado:', !!featuredProducts);
    
    if (featuredProducts && typeof PRODUCTS !== 'undefined' && PRODUCTS.length > 0) {
        console.log('📥 Carregando', Math.min(6, PRODUCTS.length), 'produtos em destaque...');
        const featured = PRODUCTS.slice(0, 6);
        
        const html = featured.map((product, index) => `
            <div class="product-card scroll-fade-up" data-delay="${index * 100}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-description">${product.description.substring(0, 80)}...</p>
                    <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                    <a href="produto.html?id=${product.id}" class="product-button">Ver Detalhes</a>
                </div>
            </div>
        `).join('');
        
        featuredProducts.innerHTML = html;
        console.log('✅ Produtos em destaque carregados!');
    } else {
        console.warn('⚠️ Não foi possível carregar produtos. Featured:', !!featuredProducts, 'PRODUCTS:', typeof PRODUCTS);
    }

    // Adicionar event listeners para as categorias
    setupCategoryClickHandlers();

    // Atualizar active link na navegação
    updateActiveNavLink();
    
    // Atualizar contador do carrinho
    updateCartCount();

    // INICIALIZAR ScrollAnimations DEPOIS de todo conteúdo carregar
    setTimeout(() => {
        console.log('🎬 Inicializando ScrollAnimations...');
        setupScrollEffects();
        console.log('✅ ScrollAnimations inicializado');
    }, 100);
});

function setupScrollEffects() {
    // Inicializar scroll animations para elementos estáticos E dinâmicos
    new ScrollAnimations();
    
    // Adicionar efeitos adicionais
    setupParallaxEffect();
    setupMouseFollowEffect();
    setupScrollProgressBar();
}

function setupCategoryClickHandlers() {
    const categoryCards = document.querySelectorAll('.category-card');
    console.log('🏷️ Encontradas', categoryCards.length, 'categorias');
    
    if (categoryCards.length === 0) {
        console.warn('⚠️ Nenhuma categoria encontrada!');
        return;
    }
    
    categoryCards.forEach((card, index) => {
        const categoryName = card.querySelector('h3')?.textContent || 'Unknown';
        console.log(`  ✅ Categoria ${index + 1}: "${categoryName}"`);
        
        card.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Clicou em categoria:', categoryName);
            navigateToCategory(categoryName);
        });
        
        // Adicionar efeito visual no clique
        card.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        card.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        card.style.cursor = 'pointer';
    });
    
    console.log('✅ Event listeners de categorias configurados');
}

function navigateToCategory(category) {
    console.log('🔄 Navegando para categoria:', category);
    
    // Mapeamento de categorias para categorias de gênero
    const categoryMap = {
        'Skincare': { page: 'feminino.html', filter: 'Skincare' },
        'Suplementos': { page: 'masculino.html', filter: 'Suplementos' },
        'Maquiagem': { page: 'feminino.html', filter: 'Maquiagem' },
        'Perfumaria': { page: 'feminino.html', filter: 'Perfumaria' },
        'eBooks': { page: 'feminino.html', filter: 'eBooks' },
        'Receitas': { page: 'feminino.html', filter: 'Receitas' }
    };
    
    const target = categoryMap[category];
    console.log('🎯 Destino:', target);
    
    if (target) {
        // Guardar categoria selecionada no sessionStorage
        sessionStorage.setItem('selectedCategory', category);
        console.log('📝 Categoria guardada em sessionStorage');
        window.location.href = target.page;
    } else {
        console.warn('⚠️ Categoria não encontrada no mapa:', category);
    }
}

function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
    
    console.log('🔗 Página atual:', currentPage);
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('glowupCart')) || [];
        cartCount.textContent = cart.length;
        console.log('🛒 Contador do carrinho atualizado:', cart.length);
    }
}

// Formatador de moeda
function formatCurrency(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
}

console.log('✅ app.js carregado e pronto');

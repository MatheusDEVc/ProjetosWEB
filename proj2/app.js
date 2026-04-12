// Lógica Principal da Aplicação

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Content Loaded');
    console.log('📦 PRODUCTS definido:', typeof PRODUCTS !== 'undefined' && PRODUCTS.length > 0);
    
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
        
        // Re-inicializar animações após carregar produtos
        if (typeof ScrollAnimations !== 'undefined') {
            console.log('🎬 Reinicializando ScrollAnimations...');
            setTimeout(() => {
                new ScrollAnimations();
                console.log('✅ ScrollAnimations reinicializado');
            }, 100);
        }
    } else {
        console.warn('⚠️ Não foi possível carregar produtos. Featured:', !!featuredProducts, 'PRODUCTS:', typeof PRODUCTS);
    }

    // Adicionar event listeners para as categorias
    setupCategoryClickHandlers();

    // Atualizar active link na navegação
    updateActiveNavLink();
    
    // Atualizar contador do carrinho
    updateCartCount();
});

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

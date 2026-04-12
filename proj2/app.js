// Lógica Principal da Aplicação

document.addEventListener('DOMContentLoaded', function() {
    // Carregar produtos em destaque na home
    const featuredProducts = document.getElementById('featured-products');
    if (featuredProducts && typeof PRODUCTS !== 'undefined' && PRODUCTS.length > 0) {
        const featured = PRODUCTS.slice(0, 6);
        featuredProducts.innerHTML = featured.map((product, index) => `
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
        
        // Re-inicializar animações após carregar produtos
        if (typeof ScrollAnimations !== 'undefined') {
            ScrollAnimations.observe();
        }
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
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const categoryName = this.querySelector('h3').textContent;
            // Redirecionar para a seção apropriada baseado na categoria
            navigateToCategory(categoryName);
        });
        
        // Adicionar efeito visual no clique
        card.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        card.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
    });
}

function navigateToCategory(category) {
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
    if (target) {
        // Guardar categoria selecionada no sessionStorage
        sessionStorage.setItem('selectedCategory', category);
        window.location.href = target.page;
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
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount && typeof getCartTotal === 'function') {
        const cart = JSON.parse(localStorage.getItem('glowupCart')) || [];
        cartCount.textContent = cart.length;
    }
}

// Formatador de moeda
function formatCurrency(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
}

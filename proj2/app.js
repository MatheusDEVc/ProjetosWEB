// Lógica Principal da Aplicação

document.addEventListener('DOMContentLoaded', function() {
    // Carregar produtos em destaque na home
    const featuredProducts = document.getElementById('featured-products');
    if (featuredProducts) {
        const featured = PRODUCTS.slice(0, 6);
        featuredProducts.innerHTML = featured.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="category-badge">${product.category}</p>
                    <p class="product-desc">${product.description.substring(0, 80)}...</p>
                    <div class="product-footer">
                        <span class="price">R$ ${product.price.toFixed(2)}</span>
                        <a href="produto.html?id=${product.id}" class="btn btn-small">Ver Detalhes</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Atualizar active link na navegação
    updateActiveNavLink();
});

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

// Formatador de moeda
function formatCurrency(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
}

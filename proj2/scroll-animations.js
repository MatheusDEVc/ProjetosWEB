// scroll-animations.js
// Sistema de animações ao fazer scroll na página

class ScrollAnimations {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        // Encontrar todos os elementos com classes de animação
        const animationClasses = [
            'scroll-fade-up',
            'scroll-fade-down',
            'scroll-slide-left',
            'scroll-slide-right',
            'scroll-scale',
            'scroll-rotate'
        ];

        animationClasses.forEach(className => {
            document.querySelectorAll(`.${className}`).forEach(element => {
                this.elements.push({
                    element,
                    className,
                    triggered: false
                });
            });
        });

        // Setup intersection observer
        this.setupIntersectionObserver();

        // Ativar no carregamento
        window.addEventListener('load', () => this.triggerVisibleElements());
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.elements.forEach(item => {
            observer.observe(item.element);
        });
    }

    triggerAnimation(element) {
        // Adicionar pequeno delay para efeito em cascata
        const delayInMs = element.dataset.delay ? parseInt(element.dataset.delay) : 0;
        
        setTimeout(() => {
            element.classList.add('active');
        }, delayInMs);
    }

    triggerVisibleElements() {
        this.elements.forEach(item => {
            const rect = item.element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                this.triggerAnimation(item.element);
            }
        });
    }
}

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();

    // Adicionar efeitos adicionais
    setupParallaxEffect();
    setupMouseFollowEffect();
    setupScrollProgressBar();
});

// ===== PARALLAX EFFECT =====
function setupParallaxEffect() {
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero');
        if (hero) {
            const scrollY = window.scrollY;
            hero.style.backgroundPosition = `center ${scrollY * 0.5}px`;
        }
    });
}

// ===== MOUSE FOLLOW EFFECT =====
function setupMouseFollowEffect() {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.product-card, .category-card');
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            const angleX = (e.clientY - cardCenterY) / 10;
            const angleY = (cardCenterX - e.clientX) / 10;

            // Subtle 3D effect (comentado para não ser muito)
            // card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        });
    });
}

// ===== SCROLL PROGRESS BAR =====
function setupScrollProgressBar() {
    // Criar barra de progresso se não existir
    let progressBar = document.querySelector('.scroll-progress-bar');
    
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #d946a6, #ec4899);
            z-index: 9999;
            transition: width 0.2s ease;
            box-shadow: 0 0 20px rgba(217, 70, 166, 0.5);
        `;
        document.body.appendChild(progressBar);
    }

    window.addEventListener('scroll', () => {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrollPercentage + '%';
    });
}

// ===== NUMBER COUNTER ANIMATION =====
function animateCounter(element, target, duration = 1000) {
    let current = 0;
    const increment = target / (duration / 16);

    function update() {
        current += increment;
        if (current >= target) {
            element.textContent = target;
        } else {
            element.textContent = Math.floor(current);
            requestAnimationFrame(update);
        }
    }

    update();
}

// ===== STAGGER ANIMATION HELPER =====
function staggerElements(selector, baseDelay = 100) {
    document.querySelectorAll(selector).forEach((element, index) => {
        element.style.animationDelay = `${index * baseDelay}ms`;
    });
}

// ===== SMOOTH SCROLL FOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== RIPPLE EFFECT ON BUTTONS =====
document.querySelectorAll('.btn, button').forEach(button => {
    button.addEventListener('click', function(e) {
        // Criar elemento de ripple
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
        `;

        // Adicionar animação de ripple
        if (!document.querySelector('style[data-ripple]')) {
            const style = document.createElement('style');
            style.setAttribute('data-ripple', 'true');
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// ===== TYPING EFFECT (opcional) =====
function typeText(element, text, speed = 50) {
    let index = 0;
    element.textContent = '';

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ===== ELEMENT VISIBILITY CHECKER =====
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.bottom >= 0 &&
        rect.right >= 0
    );
}

// Export para uso em outros scripts
window.ScrollAnimations = {
    animateCounter,
    staggerElements,
    typeText,
    isElementInViewport
};

console.log('✨ Scroll Animations inicializado com sucesso!');

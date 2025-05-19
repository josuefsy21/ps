class ScrollReveal {
    constructor(options = {}) {
        this.elements = document.querySelectorAll(options.selector || '.reveal');
        this.offset = options.offset || 100;
        this.duration = options.duration || '0.6s';
        this.init();
    }

    init() {
        this.elements.forEach(el => {
            el.style.opacity = "0";
            el.style.transition = `opacity ${this.duration} ease-out, transform ${this.duration} ease-out`;

            if (el.classList.contains("left")) {
                el.style.transform = "translateX(-60px)";
            } else if (el.classList.contains("right")) {
                el.style.transform = "translateX(60px)";
            } else if (el.classList.contains("top")){
                el.style.transform = "translateY(-60px)";
            } else {
                el.style.transform = "translateY(60px)";
            }
        });

        window.addEventListener("load", () => this.scrollHandler());
        window.addEventListener("scroll", () => this.scrollHandler());
    }

    scrollHandler() {
        this.elements.forEach(el => {
            if (this.isElementInViewport(el)) {
                el.style.opacity = "1";
                el.style.transform = "translateX(0)";
                el.style.transform = "translateY(0)";
            }
        });
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return rect.top <= window.innerHeight - this.offset;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new ScrollReveal({ selector: ".reveal", offset: 100, duration: "0.8s" });
});

document.querySelectorAll('.accordion-header').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('.accordion-icon');
        
        content.classList.toggle('active');
        icon.classList.toggle('rotate');
        
        if (content.classList.contains('active')) {
            icon.textContent = 'x';
        } else {
            icon.textContent = '+';
        }
    });
});




//........................Here’s a professional copyright notice for your Node.js code:

//....................................This Node.js code is protected by copyright laws. 
//............................Unauthorized reproduction, distribution, or modification 
//............................of this code, in whole or in part, without explicit
//............................permission from the owner is strictly prohibited. 

//............................All rights reserved.
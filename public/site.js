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

// Inicializar o efeito
document.addEventListener("DOMContentLoaded", () => {
    new ScrollReveal({ selector: ".reveal", offset: 100, duration: "0.8s" });
});


//______________________________________________________
// Set the promotion end date and time

const endDate = new Date("2025-05-29T23:59:59-03:00").getTime();

function updateCountdown() {
const now = new Date().getTime();
const timeRemaining = endDate - now;

    if (timeRemaining >= 0) {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        document.getElementById("countdown").textContent =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
        document.getElementById("countdown").textContent = "Promotion has ended!";
    }
}

// Update the countdown every second
setInterval(updateCountdown, 1000);


//______________________________________________________
// accordeon

let accordion = document.getElementsByClassName("accordion-list");

for (i = 0; i < accordion.length; i++) {
    accordion[i].addEventListener("click", function(){
        this.classList.toggle("active");
    });
}


//______________________________________________________

document.addEventListener("contextmenu", (e) => e.preventDefault()); // Bloqueia botão direito
document.addEventListener("copy", (e) => e.preventDefault()); // Bloqueia Ctrl+C

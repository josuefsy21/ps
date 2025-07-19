
// Inicializando o player Wistia
window._wq = window._wq || [];
_wq.push({
  id: "g1kh8kg6bp",
  onReady: function (video) {
    video.bind("timechange", function (t) {
      // 486
      if (t >= 485) {
        document.getElementById("article").style.display = "block";
        document.getElementById("article2").style.display = "block";
        document.getElementById("card-btn").style.display = "none";
        document.getElementById("benefits").style.display = "none";
        document.getElementById("nav").style.display = "block";
        video.unbind("timechange");
      }
    });
  },
});

//const endDate = new Date("2025-06-30T23:59:59-03:00").getTime();

// Pega a data atual do navegador
const now = new Date();

// Adiciona 3 dias
now.setDate(now.getDate() + 2);

// Formata a data para "YYYY-MM-DDT23:59:59-03:00"
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

const formattedDate = `${year}-${month}-${day}T23:59:59-03:00`;
const endDate = new Date(formattedDate).getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const timeRemaining = endDate - now;

  if (timeRemaining >= 0) {
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    document.getElementById(
      "countdown"
    ).textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    document.getElementById(
      "countdownb"
    ).textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else {
    document.getElementById("countdown").textContent =
      "Promotion has ended!";
    document.getElementById("countdownb").textContent =
      "Promotion has ended!";
  }
}

// Update the countdown every second
setInterval(updateCountdown, 1000);

document.addEventListener("contextmenu", (e) => e.preventDefault()); // Bloqueia botão direito
document.addEventListener("copy", (e) => e.preventDefault()); // Bloqueia Ctrl+C

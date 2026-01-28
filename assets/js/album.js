window.addEventListener("load", () => {
  const img = document.getElementById("albumCover");
  const colorThief = new ColorThief();

  if (img.complete) {
    applyColor();
  } else {
    img.addEventListener("load", applyColor);
  }

  function applyColor() {
    const color = colorThief.getColor(img);
    const rgb = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    document.documentElement.style.setProperty("--album-color", rgb);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const trackRows = document.querySelectorAll(".track-row");

  // Elementi del Player da aggiornare
  const playerTitle = document.querySelector(".player-info-section .fw-bold");
  const playerArtist = document.querySelector(".player-info-section .text-white-50");
  const playerDuration = document.querySelector(".player-songbar span:last-child");
  const playBtn = document.querySelector(".bi-play-circle-fill");

  // Funzione per aggiornare il player
  trackRows.forEach((row) => {
    row.addEventListener("click", () => {
      const title = row.getAttribute("data-title");
      const artist = row.getAttribute("data-artist");
      const duration = row.getAttribute("data-duration");

      // Aggiorniamo i testi nel player
      playerTitle.textContent = title;
      playerArtist.textContent = artist;
      playerDuration.textContent = duration;

      // colore verde quando una traccia è selezionata)
      trackRows.forEach((r) => (r.style.color = "white"));
      row.style.color = "#1ed760";

      // cambia l'icona in "Pausa"
      playBtn.classList.remove("bi-play-circle-fill");
      playBtn.classList.add("bi-pause-circle-fill");
      playBtn.classList.add("text-white"); // Spotify usa bianco per il tasto attivo
    });
  });

  // Play/Pausa nel player
  playBtn.addEventListener("click", function () {
    this.classList.toggle("bi-play-circle-fill");
    this.classList.toggle("bi-pause-circle-fill");
  });
});

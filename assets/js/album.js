const params = new URLSearchParams(window.location.search);
const albumId = params.get("id");

// ELEMENTI DOM
const albumCover = document.getElementById("albumCover");
const albumTitle = document.getElementById("albumTitle");
const albumArtist = document.getElementById("albumArtist");
const albumMeta = document.getElementById("albumMeta");
const artistImg = document.getElementById("artistImg");
const tracklist = document.getElementById("tracklist");

// PLAYER
const playerTitle = document.querySelector(".player-info-section .fw-bold");
const playerArtist = document.querySelector(".player-info-section .text-secondary-custom");
const playerDuration = document.querySelector(".player-songbar span:last-child");
const playBtn = document.querySelector(".bi-play-circle-fill");

// COLOR THIEF
const colorThief = new ColorThief();

// FETCH ALBUM
const fetchAlbum = async () => {
  try {
    const res = await fetch(`https://striveschool-api.herokuapp.com/api/deezer/album/${albumId}`);
    const album = await res.json();
    populateAlbum(album);
  } catch (err) {
    console.error(err);
  }
};

// USERNAME

function ensureUserName() {
  const saved = localStorage.getItem("spUserFullName"); // leggo nome salvato

  if (saved) {
    updateProfileUI(saved); // aggiorno profilo
  } else {
    openNameModal((name) => {
      localStorage.setItem("spUserFullName", name); // salvo
      updateProfileUI(name); // aggiorno icona
    });
  }
}

// aggiunge il bottone Esci nel menu profilo e resetta il nome quando clicchi
function initLogout() {
  const menu = document.querySelector(".dropdown-menu.sp-dd"); // menu dropdown
  if (!menu) return;

  // lo aggiungo una sola volta
  if (!document.querySelector("#logoutBtn")) {
    const li = document.createElement("li");
    li.innerHTML = `
      <hr class="dropdown-divider">
      <button class="dropdown-item text-danger" id="logoutBtn" type="button">
        <i class="bi bi-box-arrow-right me-2"></i>Esci
      </button>
    `;
    menu.appendChild(li);
  }

  // click su esci e cancella e riapre la modal
  const logoutBtn = document.querySelector("#logoutBtn");
  logoutBtn.onclick = () => {
    localStorage.removeItem("spUserFullName"); // reset
    ensureUserName(); // richiede di nuovo nome
  };
}

// HEADER
const populateAlbum = (album) => {
  albumCover.src = album.cover_big;
  albumTitle.textContent = album.title;
  albumArtist.textContent = album.artist.name;
  artistImg.src = album.artist.picture_small;

  albumMeta.textContent = `• ${album.release_date.slice(0, 4)} • ${album.nb_tracks} brani`;

  // TRACKLIST
  tracklist.innerHTML = "";

  album.tracks.data.forEach((track, index) => {
    const minutes = Math.floor(track.duration / 60);
    const seconds = String(track.duration % 60).padStart(2, "0");

    tracklist.innerHTML += `
      <div
        class="track-row row align-items-center py-2 rounded"
        data-title="${track.title}"
        data-artist="${track.artist.name}"
        data-duration="${minutes}:${seconds}"
      >
        <div class="col-auto text-secondary" style="width: 40px">${index + 1}</div>
        <div class="col-5 d-flex flex-column">
          <span class="text-white fw-bold">${track.title}</span>
          <small class="text-secondary">${track.artist.name}</small>
        </div>
        <div class="col-4 text-end text-secondary">
          ${track.rank.toLocaleString()}
        </div>
        <div class="col-auto ms-auto text-end text-secondary" style="width: 80px">
          ${minutes}:${seconds}
        </div>
      </div>
    `;
  });

  initPlayer();
  applyAlbumColor();
};

// PLAYER LOGIC
const initPlayer = () => {
  const trackRows = document.querySelectorAll(".track-row");

  trackRows.forEach((row) => {
    row.addEventListener("click", () => {
      const title = row.dataset.title;
      const artist = row.dataset.artist;
      const duration = row.dataset.duration;

      playerTitle.textContent = title;
      playerArtist.textContent = artist;
      playerDuration.textContent = duration;

      trackRows.forEach((r) => (r.style.color = "white"));
      row.style.color = "#1ed760";

      playBtn.classList.remove("bi-play-circle-fill");
      playBtn.classList.add("bi-pause-circle-fill");
    });
  });

  playBtn.addEventListener("click", function () {
    this.classList.toggle("bi-play-circle-fill");
    this.classList.toggle("bi-pause-circle-fill");
  });
};

// COLOR THIEF
const applyAlbumColor = () => {
  if (albumCover.complete) {
    const color = colorThief.getColor(albumCover);
    document.documentElement.style.setProperty("--album-color", `rgb(${color[0]}, ${color[1]}, ${color[2]})`);
  } else {
    albumCover.addEventListener("load", applyAlbumColor);
  }
};

fetchAlbum();

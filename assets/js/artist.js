async function getData(searchAPI) {
  try {
    const response = await fetch(searchAPI);
    if (!response.ok) {
      throw new Error("Errore nel recupero dati");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Errore durante la fetch:", error);
  }
}

async function getDataTrack(searchAPIsong) {
  try {
    const response = await fetch(searchAPIsong);
    if (!response.ok) {
      throw new Error("Errore nel recupero dati");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Errore durante la fetch:", error);
  }
}

async function secondsToMinutes(data) {
  let duration = data.duration;

  let minutes = Math.floor(duration / 60);
  let seconds = duration % 60;

  let finalSeconds = seconds < 10 ? "0" + seconds : seconds;

  let finalDuration = minutes.toString() + ":" + finalSeconds.toString();
  return finalDuration;
}

let likedCount = 0;
let updateLikedText = () => {};

const renderArtistPage = async (artistId) => {
  document.getElementById("artist-name").innerText = "Caricamento...";
  document.getElementById("artist-listeners").innerText = "";
  document.getElementById("popular-songs-container").innerHTML = "";

  const songUrl = `https://striveschool-api.herokuapp.com/api/deezer/track/${localStorage.getItem("songId")}`;

  const artistUrl = `https://striveschool-api.herokuapp.com/api/deezer/artist/${artistId}`;
  const tracksUrl = `https://striveschool-api.herokuapp.com/api/deezer/artist/${artistId}/top?limit=8`;
  const verifiedBadge = document.getElementById("artist-verified");
  if (verifiedBadge) verifiedBadge.style.visibility = "hidden";

  const songData = await getDataTrack(songUrl);
  const artistData = await getData(artistUrl);
  const tracksData = await getData(tracksUrl);

  populatePlayer(songData);

  if (artistData && tracksData) {
    likedCount = Math.floor(Math.random() * 26); // numero canzoni piaciute random

    updateLikedText = () => {
      document.querySelectorAll(".liked-artist-name").forEach((el) => {
        el.innerText = `${likedCount} brani di ${artistData.name}`;
      });
    };

    // prima render iniziale testo
    updateLikedText();
    if (verifiedBadge) verifiedBadge.style.visibility = "visible";
    const goToArtistAlbum = document.getElementById("goToArtistAlbum"); // per album
    if (goToArtistAlbum && tracksData.data?.length > 0) {
      const firstAlbumId = tracksData.data[0].album.id;

      goToArtistAlbum.onclick = (e) => {
        e.preventDefault();
        window.location.href = `album.html?id=${firstAlbumId}`;
      };
    }

    const artistNameElem = document.getElementById("artist-name");
    artistNameElem.innerText = artistData.name;
    artistNameElem.textContent = artistData.name;
    artistNameElem.classList.add("artist-title");

    document.getElementById("artist-img").src = artistData.picture_xl;
    document.getElementById("artist-listeners").innerText = `${artistData.nb_fan.toLocaleString()} ascoltatori mensili`;

    document.querySelectorAll(".liked-artist-name").forEach((el) => {
      el.innerText = `${likedCount} brani di ${artistData.name}`;
    });

    const imgMob = document.getElementById("artist-liked-img-mobile");
    const imgDesk = document.getElementById("artist-liked-img-desktop");
    if (imgMob) imgMob.src = artistData.picture_small;
    if (imgDesk) imgDesk.src = artistData.picture_small;

    const container = document.getElementById("popular-songs-container");
    container.innerHTML = `<h4 class="mb-4 fw-bold text-white">Popolari</h4>`;

    for (const [index, track] of tracksData.data.entries()) {
      const duration = await secondsToMinutes(track);

      container.innerHTML += `
  <div class="song-row" data-track-id="${track.id}">
    <div class="row align-items-center g-0">

      <div class="col-auto text-secondary small pe-3" style="width: 30px">
        ${index + 1}
      </div>

      <div class="col d-flex align-items-center overflow-hidden">
        <img src="${track.album.cover_small}" class="song-cover me-3 flex-shrink-0" alt="${track.title}" />
        <div class="overflow-hidden">
          <div class="fw-bold lh-1 text-truncate">${track.title}</div>
          <div class="small text-secondary d-lg-none mt-1">${track.rank.toLocaleString()}</div>
        </div>
      </div>

      <div class="col-xxl-3 text-end text-secondary small d-none d-xxl-block px-3">
        ${track.rank.toLocaleString()}
      </div>

      <div class="col-auto col-lg-2 text-end text-secondary small d-none d-lg-block pe-3 ms-auto" style="min-width: 70px;">
        ${duration}
      </div>

      <div class="col-auto flex-shrink-0 dropdown">
        <button
          class="btn btn-link p-0 text-secondary more-btn dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-three-dots-vertical"></i>
        </button>

        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
        <li>
  <a
    class="dropdown-item go-to-album"
    href="#"
    data-album-id="${track.album.id}"
  >
    Vai all'album
  </a>
</li>
          <li>
  <a class="dropdown-item add-to-playlist" href="#">Aggiungi alla playlist</a>
</li>
          <li><a class="dropdown-item" href="#">Condividi</a></li>
        </ul>
      </div>

    </div>
  </div>
`;
    }

    container.innerHTML += `
    <div class="mt-3 ps-2">
    <button class="btn btn-link text-secondary text-decoration-none fw-bold small p-0 text-uppercase" style="font-size: 0.75rem; letter-spacing: 1px">
    Visualizza altro
    </button>
    </div>`;
  }
};

document.addEventListener("click", (e) => {
  const row = e.target.closest(".song-row");
  if (!row) return;

  if (e.target.closest(".dropdown, .more-btn, .dropdown-menu")) return;

  const trackId = row.dataset.trackId;
  console.log("click riga:", trackId);
});

//PARTE ABA DI USER

// ===== PROFILO: Nome + Cognome (come homepage del tuo compagno) =====

// aggiorna nome e avatar nel profilo
function updateProfileUI(fullName) {
  const nameEl = document.getElementById("profileName");
  const avatarEl = document.getElementById("profileAvatar");

  if (nameEl) nameEl.textContent = fullName;
  if (avatarEl) avatarEl.textContent = (fullName?.trim()?.[0] || "U").toUpperCase();
}

// modal per inserire Nome e Cognome (obbligatorio)
function openNameModal(onDone) {
  const wrap = document.createElement("div");

  wrap.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:9999">
      <div style="width:min(520px,92vw);background:#121212;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:18px;color:#fff;font-family:system-ui">
        <div style="font-weight:700;font-size:18px;margin-bottom:10px">Benvenuto 👋</div>
        <div style="opacity:.8;margin-bottom:8px">Inserisci Nome e Cognome</div>
        <input id="fullName" type="text" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:#0b0b0b;color:#fff" />
        <div style="display:flex;justify-content:flex-end;margin-top:12px;gap:10px">
          <button id="okBtn" disabled style="padding:10px 14px;border-radius:999px;border:0;background:#1db954;color:#000;font-weight:700;opacity:.4;cursor:not-allowed">Ok</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(wrap);

  const input = wrap.querySelector("#fullName");
  const okBtn = wrap.querySelector("#okBtn");

  const normalize = (v) => v.trim().replace(/\s+/g, " ");
  const isValid = (v) => normalize(v).split(" ").length >= 2;

  input.addEventListener("input", () => {
    const ok = isValid(input.value);
    okBtn.disabled = !ok;
    okBtn.style.opacity = ok ? "1" : ".4";
    okBtn.style.cursor = ok ? "pointer" : "not-allowed";
  });

  okBtn.addEventListener("click", () => {
    const name = normalize(input.value);
    wrap.remove();
    onDone(name);
  });

  input.focus();
}

// controlla localStorage: se manca il nome apre la modal
function ensureUserName() {
  const saved = localStorage.getItem("spUserFullName");

  if (saved) {
    updateProfileUI(saved);
  } else {
    openNameModal((name) => {
      localStorage.setItem("spUserFullName", name);
      updateProfileUI(name);
    });
  }
}

// collega il tasto Esci già presente nella tua pagina artist
function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("spUserFullName");
    ensureUserName();
  });
}

//FINE PARTE ABA DI USER

window.onload = () => {
  ensureUserName();
  initLogout();
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("id") || "239";
  renderArtistPage(artistId);
  const prevBtn = document.getElementById("artist-prev");
  const nextBtn = document.getElementById("artist-next");

  prevBtn.addEventListener("click", () => {
    const currentId = Number(artistId);
    const randomOffset = Math.floor(Math.random() * 10) + 1;
    const newId = Math.max(1, currentId - randomOffset); //numero causale artista piaciute dell artista PER SINISTRA MENO

    window.location.search = `?id=${newId}`;
  });
  // AVREI POTUTO RAGGRUPPARLE VABBEH
  nextBtn.addEventListener("click", () => {
    //numero causale artista piaciute dell artista PER PIU
    const currentId = Number(artistId);
    const randomOffset = Math.floor(Math.random() * 10) + 1;
    const newId = currentId + randomOffset;

    window.location.search = `?id=${newId}`;
  });
};
// vai all album
document.addEventListener("click", (e) => {
  const albumLink = e.target.closest(".go-to-album");
  if (!albumLink) return;

  e.preventDefault();
  const albumId = albumLink.dataset.albumId;
  window.location.href = `album.html?id=${albumId}`;
});
//per playlist
document.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-to-playlist");
  if (!addBtn) return;

  e.preventDefault();

  likedCount++;
  updateLikedText();
});

//bottone seguiti
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-follow");
  if (!btn) return;

  const following = btn.classList.toggle("is-following");

  btn.textContent = following ? "Seguito" : "Segui";

  // IMPORTANTISSIMO: toglie lo stato "attivo/focus" di bootstrap
  btn.blur();
});

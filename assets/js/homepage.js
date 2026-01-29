window.addEventListener("DOMContentLoaded", () => {
  // 1) Prendo gli elementi principali
  const hero = document.querySelector("#heroCarousel")?.closest("section");
  const arrows = document.querySelector(".sp-nav-arrows");
  const header = document.querySelector(".sp-header");
  const profile = header?.querySelector(".dropdown.d-none.d-lg-block.ms-auto");
  if (!hero || !header || !profile) return;

  // 2) Bottone MOSTRA ANNUNCI
  let showBtn = null;

  // 3) Funzione per nascondere annunci
  const hideHero = () => {
    hero.classList.replace("d-lg-block", "d-lg-none"); // nasconde hero
    arrows?.classList.add("d-none"); // nasconde le frecce

    // Creo il bottone solo la prima volta che si nasconde
    if (!showBtn) {
      showBtn = document.createElement("button");
      showBtn.id = "showAdsBtn";
      showBtn.type = "button";
      showBtn.className = "btn sp-hero-hide-btn d-lg-inline-block";
      showBtn.style.marginRight = "8px";
      showBtn.textContent = "MOSTRA ANNUNCI";
      header.insertBefore(showBtn, profile);

      // 4) Click su "Mostra": ripristino hero + frecce e rimuovo il bottone
      showBtn.addEventListener("click", (e) => {
        e.preventDefault();
        hero.classList.replace("d-lg-none", "d-lg-block");
        arrows?.classList.remove("d-none");
        showBtn.remove(); // lo tolgo dal DOM
        showBtn = null; // reset
      });
    }
  };

  // 5) Aggancio l'evento ai bottoni "NASCONDI ANNUNCI"
  document.querySelectorAll(".sp-hero-hide-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      hideHero();
    });
  });
});

// HERO + PROFILO
const API = "https://striveschool-api.herokuapp.com/api/deezer/search?q="; // endpoint API
const heroQueries = ["drake", "eminem", "kendrick lamar", "travis scott", "j cole"]; // artisti di partenza
let currentAudio = null; // audio attualmente in riproduzione

// aggiorna nome e avatar nel profilo
function updateProfileUI(fullName) {
  const nameEl = document.querySelector(".sp-profile .fw-semibold"); // testo nome
  const avatarEl = document.querySelector(".sp-profile .sp-avatar"); // cerchio avatar

  if (nameEl) nameEl.textContent = fullName; // set nome
  if (avatarEl) avatarEl.textContent = (fullName[0] || "U").toUpperCase(); // set iniziale
}

// apre una modal che obbliga l’utente a inserire Nome e Cognome
function openNameModal(onDone) {
  const wrap = document.createElement("div"); // overlay

  // HTML della modal con input e bottone ok
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
  document.body.appendChild(wrap); // mostra modal

  const input = wrap.querySelector("#fullName"); // campo testo
  const okBtn = wrap.querySelector("#okBtn"); // bottone ok

  // pulisce spazi extra
  function normalize(v) {
    return v.trim().replace(/\s+/g, " ");
  }

  // valida: almeno nome + cognome
  function isValid(v) {
    return normalize(v).split(" ").length >= 2;
  }

  // abilita/disabilita ok mentre scrivi
  input.addEventListener("input", () => {
    const ok = isValid(input.value);
    okBtn.disabled = !ok;
    okBtn.style.opacity = ok ? "1" : ".4";
    okBtn.style.cursor = ok ? "pointer" : "not-allowed";
  });

  // conferma: salva e chiude
  okBtn.addEventListener("click", () => {
    const name = normalize(input.value);
    wrap.remove(); // chiude modal
    onDone(name); // ritorna nome al chiamante
  });

  input.focus();
}

// controlla localStorage, se manca il nome apre la modal, altrimenti aggiorna subito icona
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

// fa la chiamata API e restituisce lista tracce
async function fetchTracks(query) {
  const res = await fetch(API + encodeURIComponent(query)); // chiamata
  const json = await res.json(); // parse json
  return json.data || []; // fallback
}

// sceglie una traccia casuale che abbia preview
function randomPlayableTrack(tracks) {
  const playable = tracks.filter((t) => t && t.preview); // solo con preview
  if (playable.length === 0) return null;
  return playable[Math.floor(Math.random() * playable.length)];
}

// aggiorna una singola slide del carousel con una canzone nuova
async function updateSlide(slide) {
  const q = heroQueries[Math.floor(Math.random() * heroQueries.length)]; // artista random
  const tracks = await fetchTracks(q); // prendo tracce
  const t = randomPlayableTrack(tracks); // scelgo traccia
  if (!t) return;

  slide.querySelector(".sp-hero-cover").src = t.album.cover_medium; // cover
  slide.querySelector(".sp-hero-title").textContent = t.title; // titolo
  slide.querySelector(".sp-hero-meta").textContent = t.artist.name; // artista
  slide.querySelector(".sp-btn-play").dataset.preview = t.preview; // salvo preview sul bottone
}

// popola le slide e gestisce cambio slide + play preview
function initHero() {
  const carousel = document.querySelector("#heroCarousel"); // carousel
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".carousel-item"); // tutte le slide

  // al caricamento: popolo tutte le slide
  slides.forEach((s) => updateSlide(s));

  // quando cambi slide aggiorno la slide appena attiva
  carousel.addEventListener("slid.bs.carousel", (e) => updateSlide(e.relatedTarget));

  // click su Play della HERO
  carousel.addEventListener("click", (e) => {
    const btn = e.target.closest(".sp-btn-play");
    if (!btn || !btn.dataset.preview) return;

    // stop precedente
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // play nuova preview
    currentAudio = new Audio(btn.dataset.preview);
    currentAudio.volume = 0.2;
    currentAudio.play();
  });
}

// ===== AVVIO PAGINA =====
window.addEventListener("DOMContentLoaded", () => {
  ensureUserName(); // chiede/mostra nome
  initLogout(); // crea "Esci"
  initHero(); // collega carousel ad API
});

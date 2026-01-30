window.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector("#heroCarousel")?.closest("section"); // prendo section hero
  const arrows = document.querySelector(".sp-nav-arrows"); // prendo frecce nav
  const header = document.querySelector(".sp-header"); // prendo header top
  const profile = header?.querySelector(".dropdown.d-none.d-lg-block.ms-auto"); // prendo box profilo
  if (!hero || !header || !profile) return; // se manca esco

  // 2) bottone mostra annunci
  let showBtn = null; // placeholder bottone show

  // 3) funzione nascondi hero
  const hideHero = () => {
    hero.classList.replace("d-lg-block", "d-lg-none"); // nascondo hero desktop
    arrows?.classList.add("d-none"); // nascondo frecce nav

    // creo bottone una volta
    if (!showBtn) {
      showBtn = document.createElement("button"); // creo button DOM
      showBtn.id = "showAdsBtn"; // setto id bottone
      showBtn.type = "button"; // setto tipo button
      showBtn.className = "btn sp-hero-hide-btn d-lg-inline-block"; // setto classi stile
      showBtn.style.marginRight = "8px"; // margine a destra
      showBtn.textContent = "MOSTRA ANNUNCI"; // testo bottone show
      header.insertBefore(showBtn, profile); // inserisco in header

      // 4) click mostra hero
      showBtn.addEventListener("click", (e) => {
        e.preventDefault(); // blocco default click
        hero.classList.replace("d-lg-none", "d-lg-block"); // ri-mostro hero desktop
        arrows?.classList.remove("d-none"); // ri-mostro frecce nav
        showBtn.remove(); // rimuovo dal DOM
        showBtn = null; // reset variabile
      });
    }
  };
  // 5) aggancio tasti hide
  document.querySelectorAll(".sp-hero-hide-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // blocco default click
      hideHero(); // chiamo nascondi hero
    });
  });
});

// HERO + PROFILO
const API = "https://striveschool-api.herokuapp.com/api/deezer/search?q="; // endpoint
const heroQueries = ["drake", "eminem", "kendrick lamar", "travis scott", "j cole"]; // query di base
let currentAudio = null; // audio in corso

// aggiorna nome profilo
function updateProfileUI(fullName) {
  const nameEl = document.querySelector(".sp-profile .fw-semibold"); // testo nome profilo
  const avatarEl = document.querySelector(".sp-profile .sp-avatar"); // cerchio iniziale

  if (nameEl) nameEl.textContent = fullName; // setto testo nome
  if (avatarEl) avatarEl.textContent = (fullName[0] || "U").toUpperCase(); // setto iniziale avatar
}

// apre modal nome
function openNameModal(onDone) {
  const wrap = document.createElement("div"); // creo overlay modal

  // HTML modal overlay
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
  document.body.appendChild(wrap); // appendo al body

  const input = wrap.querySelector("#fullName"); // prendo input nome
  const okBtn = wrap.querySelector("#okBtn"); // prendo bottone ok

  // normalizza spazi testo
  function normalize(v) {
    return v.trim().replace(/\s+/g, " "); // trim + spazi singoli
  }

  // valida nome cognome
  function isValid(v) {
    return normalize(v).split(" ").length >= 2; // almeno due parole
  }

  // abilito ok
  input.addEventListener("input", () => {
    const ok = isValid(input.value); // controllo validità testo
    okBtn.disabled = !ok; // setto disabled ok
    okBtn.style.opacity = ok ? "1" : ".4"; // cambio opacità ok
    okBtn.style.cursor = ok ? "pointer" : "not-allowed"; // cambio cursore ok
  });

  // conferma e chiude
  okBtn.addEventListener("click", () => {
    const name = normalize(input.value); // prendo nome pulito
    wrap.remove(); // chiudo overlay modal
    onDone(name); // ritorno nome finale
  });

  input.focus(); // focus input subito
}

// garantisce nome utente
function ensureUserName() {
  const saved = localStorage.getItem("spUserFullName"); // leggo nome salvato

  if (saved) {
    updateProfileUI(saved); // aggiorno icona profilo
  } else {
    openNameModal((name) => {
      localStorage.setItem("spUserFullName", name); // salvo su storage
      updateProfileUI(name); // aggiorno icona profilo
    });
  }
}

function initLogout() {
  const menu = document.querySelector(".dropdown-menu.sp-dd"); // prendo menu dropdown
  if (!menu) return; // se manca esco

  if (!document.querySelector("#logoutBtn")) {
    const li = document.createElement("li"); // creo elemento li
    li.innerHTML = `
      <hr class="dropdown-divider">
      <button class="dropdown-item text-danger" id="logoutBtn" type="button">
        <i class="bi bi-box-arrow-right me-2"></i>Esci
      </button>
    `;
    menu.appendChild(li); // appendo al menu
  }

  // collego click logout
  const logoutBtn = document.querySelector("#logoutBtn"); // prendo bottone esci
  logoutBtn.onclick = () => {
    localStorage.removeItem("spUserFullName"); // resetto nome salvato
    ensureUserName(); // ri-chiedo nome utente
  };
}

// fetch tracce query
async function fetchTracks(query) {
  const res = await fetch(API + encodeURIComponent(query)); // chiamo endpoint api
  const json = await res.json(); // converto risposta json
  return json.data || []; // ritorno lista tracce
}

// prende traccia playabile
function randomPlayableTrack(tracks) {
  const playable = tracks.filter((t) => t && t.preview); // filtro con preview
  if (playable.length === 0) return null; // se vuoto ritorno null
  return playable[Math.floor(Math.random() * playable.length)]; // scelgo random
}

// aggiorna slide hero
async function updateSlide(slide) {
  if (!slide || slide.dataset.loading === "1") return; // se manca o in caricamento esco
  slide.dataset.loading = "1"; // caricamento

  try {
    const q = heroQueries[Math.floor(Math.random() * heroQueries.length)]; // scelgo query random
    const tracks = await fetchTracks(q); // scarico tracce query
    const t = randomPlayableTrack(tracks); // scelgo traccia valida
    if (!t) return; // se manca esco

    slide.querySelector(".sp-hero-cover").src = t.album.cover_medium; // setto cover slide
    slide.querySelector(".sp-hero-title").textContent = t.title; // setto titolo slide
    slide.querySelector(".sp-hero-meta").textContent = t.artist.name; // setto artista slide
    slide.querySelector(".sp-btn-play").dataset.preview = t.preview; // setto url preview
    slide.querySelector(".song").textContent = t.artist.id; // setto id artista
  } finally {
    slide.dataset.loading = "0"; // unlock caricamento
  }
}

// inizializza hero carousel
function initHero() {
  const carousel = document.querySelector("#heroCarousel"); // prendo carousel hero
  if (!carousel) return; // se manca esco

  const slides = [...carousel.querySelectorAll(".carousel-item")]; // prendo tutte slide

  // 1) preload tutte slide
  Promise.all(slides.map(updateSlide)); // aggiorno tutte subito

  // 2) refresh slide nascosta
  carousel.addEventListener("slid.bs.carousel", (e) => {
    const prevSlide = typeof e.from === "number" ? slides[e.from] : slides.find((s) => !s.classList.contains("active")); // trovo slide precedente
    if (prevSlide) updateSlide(prevSlide); // aggiorno quella nascosta
  });

  // 3) click play hero
  carousel.addEventListener("click", (e) => {
    const btn = e.target.closest(".sp-btn-play"); // cerco bottone play
    if (!btn || !btn.dataset.preview) return; // se manca esco

    if (currentAudio) {
      currentAudio.pause(); // stop audio attuale
      currentAudio.currentTime = 0; // reset tempo audio
    }

    currentAudio = new Audio(btn.dataset.preview); // creo nuovo audio
    currentAudio.volume = 0.2; // setto volume basso
    currentAudio.play(); // avvio riproduzione
  });
}

// ===== AVVIO PAGINA =====
window.addEventListener("DOMContentLoaded", () => {
  ensureUserName(); // gestisco nome utente
  initLogout(); // attivo voce esci
  initHero(); // avvio hero dinamico
});

// PREFERITI + bottone salva
const FAV_KEY = "spFavorites"; // chiave storage preferiti

function favsGet() {
  return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); // leggo lista preferiti
}
function favsSet(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list)); // salvo lista preferiti
}

function playPreview(url) {
  if (!url) return; // se url vuoto esco
  if (currentAudio) {
    currentAudio.pause(); // metto pausa audio
    currentAudio.currentTime = 0; // resetto audio time
  }
  currentAudio = new Audio(url); // creo audio da url
  currentAudio.volume = 0.2; // setto volume basso
  currentAudio.play(); // avvio preview audio
}

function favsRender() {
  const sec = document.getElementById("favoritesSection"); // prendo sezione preferiti
  const grid = document.getElementById("favoritesGrid"); // prendo griglia cards
  if (!sec || !grid) return; // se manca esco

  const list = favsGet(); // carico lista preferiti
  if (list.length === 0) {
    sec.classList.add("d-none"); // nascondo sezione vuota
    grid.innerHTML = ""; // svuoto griglia cards
    return;
  }

  sec.classList.remove("d-none"); // mostro sezione preferiti
  grid.innerHTML = ""; // reset griglia cards

  for (let i = 0; i < list.length; i++) {
    const t = list[i]; // prendo item corrente

    const col = document.createElement("div"); // creo col
    col.className = "col"; // assegno classe col
    col.innerHTML = ` 
      <article class="sp-card rounded-3 p-3 h-100">
        <div class="position-relative">
          <img src="${t.cover}" class="w-100 sp-card-img" alt="">
          <button class="sp-card-play" type="button"><i class="bi bi-play-fill"></i></button>
        </div>
        <div class="fw-bold mt-2 text-truncate">${t.title}</div>
        <div class="text-white-50 small text-truncate">${t.artist}</div>
        <button class="btn btn-link p-0 text-danger small mt-2" type="button">Rimuovi</button>
      </article>
    `;

    col.querySelector(".sp-card-play").onclick = function () {
      playPreview(t.preview); // play preview preferito
    };
    col.querySelector(".text-danger").onclick = function () {
      favsSet(
        favsGet().filter(function (x) {
          return x.id !== t.id; // filtro via id
        }),
      ); // salvo lista filtrata
      favsRender(); // rerender preferiti
    };

    grid.appendChild(col); // appendo card alla grid
  }
}

function toggleFromHero(btn) {
  const slide = btn.closest(".carousel-item"); // prendo slide corrente
  if (!slide) return; // se manca esco

  const title = slide.querySelector(".sp-hero-title")?.textContent || ""; // prendo titolo brano
  const artist = slide.querySelector(".sp-hero-meta")?.textContent || ""; // prendo nome artista
  const cover = slide.querySelector(".sp-hero-cover")?.src || ""; // prendo cover url
  const preview = slide.querySelector(".sp-btn-play")?.dataset?.preview || ""; // prendo preview url
  const track = { id: title + "|" + artist, title: title, artist: artist, cover: cover, preview: preview }; // creo oggetto track

  const list = favsGet(); // leggo lista corrente
  let found = -1; // indice non trovato
  for (let i = 0; i < list.length; i++)
    if (list[i].id === track.id) {
      found = i; // salvo indice trovato
      break; // esco dal ciclo
    }

  if (found >= 0)
    list.splice(found, 1); // se c’era rimuovo
  else list.unshift(track); // se mancava aggiungo

  favsSet(list); // salvo lista aggiornata

  btn.textContent = found >= 0 ? "Rimosso" : "Salvato ✓"; // feedback sul bottone
  setTimeout(function () {
    btn.textContent = "Salva"; // ripristino testo base
  }, 700); // dopo 700ms

  const sec = document.getElementById("favoritesSection"); // prendo sezione preferiti
  if (sec && !sec.classList.contains("d-none")) favsRender(); // se visibile rerender
}

function favsInit() {
  function open(e) {
    e.preventDefault(); // blocco default link
    favsRender(); // render sezione preferiti
    document.getElementById("favoritesSection")?.scrollIntoView({ behavior: "smooth" }); // scroll fino sezione
  }

  const a1 = document.getElementById("favoritesLink"); // link sidebar preferiti
  const a2 = document.getElementById("likedLink"); // link sidebar liked
  const a3 = document.querySelector(".sp-tile .sp-likedcover")?.closest("a"); // tile liked link
  if (a1) a1.onclick = open; // collego click open
  if (a2) a2.onclick = open; // collego click open
  if (a3) a3.onclick = open; // collego click open

  const hideBtn = document.getElementById("favHideBtn"); // bottone chiudi sezione
  if (hideBtn)
    hideBtn.onclick = function () {
      document.getElementById("favoritesSection")?.classList.add("d-none"); // nascondo sezione preferiti
    };

  const saves = document.querySelectorAll(".sp-btn-save"); // prendo bottoni salva
  for (let i = 0; i < saves.length; i++) {
    saves[i].onclick = function (e) {
      e.preventDefault(); // blocco default click
      toggleFromHero(saves[i]); // toggle preferito hero
    };
  }
}

window.addEventListener("DOMContentLoaded", favsInit); // avvio init preferiti

async function refreshMoreLikeCards() {
  const cards = [...document.querySelectorAll("#moreLikeRow .sp-card")]; // prendo cards more like
  if (!cards.length) return;

  cards.forEach((c) => (c.style.opacity = "0")); // nascondo subito cards

  await Promise.all(
    cards.map(async (card) => {
      const q = heroQueries[Math.floor(Math.random() * heroQueries.length)]; // query random artista
      const tracks = await fetchTracks(q); // fetch tracce query
      const t = randomPlayableTrack(tracks); // prendo traccia valida
      if (!t) return;

      card.querySelector("img.sp-card-img").src = t.album.cover_medium; // setto img card
      card.querySelector(".fw-bold").textContent = t.title; // setto titolo card
      card.querySelector(".text-white-50.small").textContent = t.artist.name; // setto artista card
      card.querySelector(".sp-card-play").onclick = () => playPreview(t.preview); // click play card
    }),
  );

  cards.forEach((c) => {
    c.style.transition = "opacity .2s";
    c.style.opacity = "1";
  });
}

window.addEventListener("DOMContentLoaded", refreshMoreLikeCards); // avvio refresh more like

async function refreshBuonaseraTiles() {
  const tiles = [...document.querySelectorAll(".sp-topgrid .sp-tile")]; // prendo tiles buonasera
  if (!tiles.length) return;

  const normalTiles = tiles.filter((tile) => !tile.querySelector(".sp-likedcover")); // escludo tile liked
  if (!normalTiles.length) return;

  normalTiles.forEach((t) => (t.style.opacity = "0")); // nascondo tiles subito

  await Promise.all(
    normalTiles.map(async (tile) => {
      const q = heroQueries[Math.floor(Math.random() * heroQueries.length)]; // query random artista
      const tracks = await fetchTracks(q); // fetch tracce query
      const t = randomPlayableTrack(tracks); // prendo traccia valida
      if (!t) return;

      const titleEl = tile.querySelector(".sp-tile-title"); // prendo titolo tile
      if (titleEl) titleEl.textContent = t.title; // setto titolo tile

      const imgs = [...tile.querySelectorAll(".sp-tile-cover img")]; // prendo img tile
      imgs.forEach((img) => (img.src = t.album.cover_medium)); // setto tutte img

      const playBtn = tile.querySelector(".sp-tile-play"); // prendo play tile
      if (playBtn) {
        playBtn.onclick = (e) => {
          e.preventDefault(); // blocco click default
          e.stopPropagation(); // blocco bubbling click
          playPreview(t.preview); // play preview tile
        };
      }
    }),
  );

  normalTiles.forEach((t) => {
    t.style.transition = "opacity .2s";
    t.style.opacity = "1";
  });
}

window.addEventListener("DOMContentLoaded", refreshBuonaseraTiles); // avvio refresh buonasera

const btn = document.getElementById("viewAllMoreLike"); // prendo bottone view all
let extra = []; // lista col extra
redirectArtist();
btn.onclick = async (e) => {
  e.preventDefault(); // blocco default click

  // NASCONDI
  if (btn.textContent.includes("NASCONDI")) {
    extra.forEach((x) => x.remove()); // rimuovo col aggiunte
    extra = []; // reset array extra
    btn.textContent = "VISUALIZZA TUTTO"; // reset testo bottone
    return;
  }

  // VISUALIZZA TUTTO
  btn.textContent = "NASCONDI"; // cambio testo bottone
  const row = document.getElementById("moreLikeRow"); // prendo riga contenitore

  extra = await Promise.all(
    Array.from({ length: 10 }, async () => {
      const q = heroQueries[Math.floor(Math.random() * heroQueries.length)]; // query random artista
      const tracks = await fetchTracks(q); // fetch tracce query
      const t = randomPlayableTrack(tracks); // prendo traccia valida

      const col = document.createElement("div"); // creo col
      col.className = "col"; // assegno classe col
      col.innerHTML = `
        <article class="sp-card rounded-3 p-3 h-100">
          <div class="position-relative">
            <img class="w-100 sp-card-img" alt="">
            <button class="sp-card-play" type="button"><i class="bi bi-play-fill"></i></button>
          </div>
          <div class="fw-bold mt-2"></div>
          <a href="#" class="artistElement text-white-50 small"></a>
          <div class="d-none song" ></div>
        </article>
      `;
      row.appendChild(col); // appendo col alla row

      if (t) {
        col.querySelector("img").src = t.album.cover_medium; // setto img extra
        col.querySelector(".fw-bold").textContent = t.title; // setto titolo extra
        col.querySelector(".text-white-50").textContent = t.artist.name; // setto artista extra
        col.querySelector(".sp-card-play").onclick = () => playPreview(t.preview); // click play extra
        col.querySelector(".song").textContent = t.artist.id;
      }
      redirectArtist();
      return col;
    }),
  );
};

function redirectArtist() {
  const artistElements = document.querySelectorAll(".artistElement");
  const idElements = document.querySelectorAll(".song");

  artistElements.forEach((element, index) => {
    element.onclick = (e) => {
      e.preventDefault();

      const correctId = idElements[index].innerText;
      window.location.href = `./artist.html?id=${correctId}`;
      console.log(correctId);
    };
  });
}

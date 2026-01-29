async function getData(searchAPI) {
  //uguale a quella di search js
  try {
    const response = await fetch(searchAPI);
    if (!response.ok) {
      throw new Error("Errore nel recupero dati");
    }
    const data = await response.json();
    console.log("Dati ricevuti:", data); // Utile per il debug
    return data;
  } catch (error) {
    console.error("Errore durante la fetch:", error);
  }
}

async function secondsToMinutes(data) {
  //uguale a search ma ..

  let duration = data.duration;

  let minutes = Math.floor(duration / 60);
  let seconds = duration % 60;

  // se i secondi sono meno di 10, aggiungo davanti se no esce 3.5 e non 3.05
  let finalSeconds = seconds < 10 ? "0" + seconds : seconds;

  let finalDuration = minutes.toString() + ":" + finalSeconds.toString();
  return finalDuration;
}

// test con queen per vedere che tipo di oggetto con quali informazioni arriva e se va bene get data anche qui

/*window.onload = () => {
  getData("https://striveschool-api.herokuapp.com/api/deezer/artist/412");
};


Dati ricevuti: 
{id: 412, name: 'Queen', link: 'https://www.deezer.com/artist/412', share: 'https://www.deezer.com/artist/412?utm_source=deeze…t=artist-412&utm_term=0_1769534920&utm_medium=web', picture: 'https://api.deezer.com/artist/412/image', …}
id
: 
412
link
: 
"https://www.deezer.com/artist/412"
name
: 
"Queen"
nb_album
: 
78
nb_fan
: 
12582590
picture
: 
"https://api.deezer.com/artist/412/image"
picture_big
: 
"https://cdn-images.dzcdn.net/images/artist/71eeb9e2eeb375df35a3c0654a5a01ab/500x500-000000-80-0-0.jpg"
picture_medium
: 
"https://cdn-images.dzcdn.net/images/artist/71eeb9e2eeb375df35a3c0654a5a01ab/250x250-000000-80-0-0.jpg"
picture_small
: 
"https://cdn-images.dzcdn.net/images/artist/71eeb9e2eeb375df35a3c0654a5a01ab/56x56-000000-80-0-0.jpg"
picture_xl
: 
"https://cdn-images.dzcdn.net/images/artist/71eeb9e2eeb375df35a3c0654a5a01ab/1000x1000-000000-80-0-0.jpg"
radio
: 
true
share
: 
"https://www.deezer.com/artist/412?utm_source=deezer&utm_content=artist-412&utm_term=0_1769534920&utm_medium=web"
tracklist
: 
"https://striveschool-api.herokuapp.com/api/deezer/artist/412/top?limit=50"
type
: 
"artist"
[[Prototype]]
: 
Object */

const renderArtistPage = async (artistId) => {
  document.getElementById("artist-name").innerText = "Caricamento...";
  document.getElementById("artist-listeners").innerText = "";
  document.getElementById("popular-songs-container").innerHTML = "";

  const artistUrl = `https://striveschool-api.herokuapp.com/api/deezer/artist/${artistId}`;
  const tracksUrl = `https://striveschool-api.herokuapp.com/api/deezer/artist/${artistId}/top?limit=8`;
  const verifiedBadge = document.getElementById("artist-verified");
  if (verifiedBadge) verifiedBadge.style.visibility = "hidden"; //devo farlo sparire nel caricamento

  const artistData = await getData(artistUrl);
  const tracksData = await getData(tracksUrl);

  if (artistData && tracksData) {
    if (verifiedBadge) verifiedBadge.style.visibility = "visible";
    // --- HEADER ARTISTA ---

    const artistNameElem = document.getElementById("artist-name");
    artistNameElem.innerText = artistData.name;
    artistNameElem.textContent = artistData.name;
    artistNameElem.classList.add("artist-title");

    // Immagine e ascoltatori
    document.getElementById("artist-img").src = artistData.picture_xl;
    document.getElementById("artist-listeners").innerText = `${artistData.nb_fan.toLocaleString()} ascoltatori mensili`;

    // --- "BRANI CHE TI PIACCIONO" ---
    document.querySelectorAll(".liked-artist-name").forEach((el) => {
      el.innerText = `8 brani di ${artistData.name}`;
    });

    // Foto liked
    const imgMob = document.getElementById("artist-liked-img-mobile");
    const imgDesk = document.getElementById("artist-liked-img-desktop");
    if (imgMob) imgMob.src = artistData.picture_small;
    if (imgDesk) imgDesk.src = artistData.picture_small;

    // --- CANZONI POPOLARI ---
    const container = document.getElementById("popular-songs-container");
    container.innerHTML = `<h4 class="mb-4 fw-bold text-white">Popolari</h4>`;

    for (const [index, track] of tracksData.data.entries()) {
      const duration = await secondsToMinutes(track);

     container.innerHTML += `
  <div class="song-row" data-track-id="${track.id}">
    <div class="row align-items-center mb-3 g-0">

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
          <li><a class="dropdown-item" href="#">Vai all'album</a></li>
          <li><a class="dropdown-item" href="#">Aggiungi alla playlist</a></li>
          <li><a class="dropdown-item" href="#">Condividi</a></li>
        </ul>
      </div>

    </div>
  </div>
`;


    // visualizza altro
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

  // tentativi per hover non sempre visualizzabile e click
  if (e.target.closest(".dropdown, .more-btn, .dropdown-menu")) return;

  const trackId = row.dataset.trackId;
  console.log("click riga:", trackId);
});

// Avvio
window.onload = () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("id") || "226";
  renderArtistPage(artistId);
  const prevBtn = document.getElementById("artist-prev"); //per freccine in alto
  const nextBtn = document.getElementById("artist-next");

  prevBtn.addEventListener("click", () => {
    const currentId = Number(artistId);
    const randomOffset = Math.floor(Math.random() * 10) + 1; // cambiare artista random
    const newId = Math.max(1, currentId - randomOffset);

    window.location.search = `?id=${newId}`;
  });

  
  nextBtn.addEventListener("click", () => {
    const currentId = Number(artistId);
    const randomOffset = Math.floor(Math.random() * 10) + 1; //
    const newId = currentId + randomOffset;

    window.location.search = `?id=${newId}`;
  });
};

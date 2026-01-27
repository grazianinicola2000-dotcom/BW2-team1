let query = "";

function cardColorsGenerator() {
  const cardColors = [
    "#e13300",
    "#1e3264",
    "#e8125c",
    "#158a08",
    "#bc5800",
    "#7a5a95",
    "#503750",
    "#2d46b9",
    "#777777",
    "#8c1932",
    "#a56752",
    "#7d4b32",
  ];

  const randomIndex = () => {
    return Math.floor(Math.random() * cardColors.length);
  };

  const cards = document.querySelectorAll(".cardGenresNav");

  cards.forEach((card) => {
    card.style.backgroundColor = cardColors[randomIndex()];
  });
}

async function tokenSearch() {
  const searchBar = document.querySelector("input");
  const searchButton = document.querySelector(".bg-transparent.border-0.m-0.p-0");

  searchButton.addEventListener("click", async (e) => {
    let urlAPI = `https://striveschool-api.herokuapp.com/api/deezer/search?q=`;
    e.preventDefault();
    if (searchBar.value.toLowerCase() == "") {
      alert("inserisci un'artista o un brano");
    } else {
      query = searchBar.value;
      urlAPI = urlAPI + query;
      const dataToken = await getData(urlAPI);

      populateCard(dataToken.data);
      generateSongsCard(dataToken.data);
      ///
    }
  });
}

async function generateSongsCard(data) {
  const songsContainer = document.querySelector("#songsContainer");
  const searchResults = document.querySelector("#searchResults");
  searchResults.classList.remove("d-none");
  songsContainer.innerHTML = "<h3>Songs</h3>";
  for (let i = 0; i < 4; i++) {
    let duration = await secondsToMinutes(data[i]);
    songsContainer.innerHTML += `
  <div class="d-flex p-2 rounded-2 searcheSongsContainer">
                <img class="songCover me-2" src="${data[i].album.cover_medium}" alt="song_cover" />
                <div class="d-flex justify-content-between flex-grow-1 align-items-center">
                  <div>
                    <h4 class="searchedSongTitle m-0">${data[i].title}</h4>
                    <div class="d-flex explicit${i}">
                      
                      
                    </div>
                  </div>
                  <p class="m-0 ms-3">${duration}</p>
                </div>
              </div>
              `;
    let explicit = document.querySelector(".explicit" + i);
    explicit;
    if (data[i].explicit_content_lyrics > 0) {
      explicit.innerHTML += `<i class="bi bi-explicit-fill"></i><p class="searchedArtistName m-0 p-0 ms-1">${data[i].artist.name}</p>`;
    } else {
      explicit.innerHTML = `<p class="searchedArtistName m-0 p-0">${data[i].artist.name}</p>`;
    }
  }
}

async function secondsToMinutes(data) {
  let duration = await data.duration;
  let minutes = Math.floor(duration / 60);
  let seconds = duration % 60;
  console.log(seconds);

  let finalDuration = minutes.toString() + ":" + seconds.toString();
  return finalDuration;
}

function populateCard(data) {
  const artistImage = document.querySelector("#artistProfileImg");
  const artistName = document.querySelector("#artistName");
  artistImage.src = data[0].artist.picture_medium;
  artistName.innerText = data[0].artist.name;
}

async function getData(searchAPI) {
  try {
    const response = await fetch(searchAPI);
    if (!response.ok) {
      throw new Error("Errore");
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Errore", error);
  }
}

window.onload = () => {
  tokenSearch();
  cardColorsGenerator();
};

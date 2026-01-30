let query = "";
let id = "";
let urlAPI = `https://striveschool-api.herokuapp.com/api/deezer/search?q=`;

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
  const spinner = document.querySelector(".spinner-border.me-3");
  spinner.classList.add("d-none");
  searchButton.addEventListener("click", async (e) => {
    let urlAPI = `https://striveschool-api.herokuapp.com/api/deezer/search?q=`;

    e.preventDefault();
    localStorage.clear();
    if (searchBar.value.toLowerCase() == "") {
      addAnimationSearchBar(searchBar);
    } else {
      spinner.classList.remove("d-none");
      searchBar.classList.add("border-0");
      query = searchBar.value;
      urlAPI = urlAPI + query;
      const dataToken = await getData(urlAPI);

      if (dataToken && dataToken.data) {
        spinner.classList.add("d-none");
        searchBar.classList.remove("border", "border-danger");

        populateCard(dataToken.data);
        await generateSongsCard(dataToken.data);
        await generateAlbumCard(dataToken.data);
        saveID();
        playSong(dataToken.data);
        console.log(dataToken.data);
      }
    }
  });
}

function saveID() {
  let idArtist = "";
  const songContainerChildren = document.querySelectorAll(".searcheSongsContainer");
  songContainerChildren.forEach((element) => {
    element.addEventListener("click", (e) => {
      let idArtist = e.currentTarget.lastElementChild.innerText;
    });
  });
  return idArtist;
}

async function playSong(songs) {
  const songContainerChildren = document.querySelectorAll(".searcheSongsContainer");
  const play =
    document.querySelector(".player-controls .bi-play-circle-fill") ||
    document.querySelector(".player-controls .bi-pause-circle-fill");

  songContainerChildren.forEach((element, index) => {
    localStorage.setItem("artistId", songs[index].artist.id);
    element.onclick = () => {
      localStorage.setItem("audioState", currentAudio.paused);
      if (play) {
        play.classList.remove("bi-play-circle-fill");
        play.classList.add("bi-pause-circle-fill");
      }

      if (currentAudio) {
        currentAudio.pause();
      }
      localStorage.setItem("songId", songs[index].id);
      currentAudio.src = songs[index].preview;
      currentAudio.volume = 0.2;
      currentAudio.play();

      localStorage.setItem("GetAudio", songs[index].preview);
      localStorage.setItem("audioVolume", currentAudio.volume);

      const currentTimeToPass = currentAudio.currentTime;
      
      localStorage.setItem("duration", currentAudio.duration);

      populatePlayer(songs[index]);
      audioTimes(currentAudio);
    };
  });
}

function addAnimationSearchBar(searchBar) {
  searchBar.classList.remove("border-0");
  searchBar.classList.add("horizontal-shaking");
  searchBar.classList.add("border", "border-danger");

  setTimeout(() => {
    searchBar.classList.remove("horizontal-shaking");
  }, 600);
}

async function generateSongsCard(data) {
  const songsContainer = document.querySelector("#songsContainer");
  const searchResults = document.querySelector("#searchResults");
  searchResults.classList.remove("d-none");
  songsContainer.innerHTML = "<h3>Songs</h3>";

  const limit = Math.min(data.length, 4);

  for (let i = 0; i < 4; i++) {
    let duration = await secondsToMinutes(data[i]);

    console.log(localStorage);
    songsContainer.innerHTML += `
  <div class="d-flex rounded-2 searcheSongsContainer p-2">
                <img class="songCover me-2 artistElement" src="${data[i].album.cover_medium}" alt="song_cover" />
                <div class="d-flex justify-content-between flex-grow-1 align-items-center ">
                  <div>
                    <h4 class="searchedSongTitle m-0">${data[i].title}</h4>
                    <div class="d-flex explicit${i}">
                    </div>
                  </div>
                  <p class="m-0 ms-3">${duration}</p>
                </div>
                <div class="d-none song" >${data[i].artist.id}</div>
              </div>
              `;
    console.log(data[i]);

    let explicit = document.querySelector(".explicit" + i);
    if (explicit) {
      if (data[i].explicit_content_lyrics > 0) {
        explicit.innerHTML += `<i class="bi bi-explicit-fill"></i><p class="searchedArtistName m-0 p-0 ms-1"><a href="#" class="artistElement">${data[i].artist.name}</a href="#"></p>`;
      } else {
        explicit.innerHTML = `<p class="searchedArtistName m-0 p-0 artistElement"><a href="#" class="artistElement">${data[i].artist.name}</a></p>`;
      }
    }
  }
  redirectArtist();
}

async function generateAlbumCard(data) {
  const albums = document.querySelector(".albumsText");
  albums.classList.remove("d-none");
  const showOthers = document.querySelector(".showOthers");

  const existingIcons = showOthers.querySelectorAll(".bi-three-dots");
  existingIcons.forEach((icon) => icon.remove());

  let numberAlbumShown = 5;
  albumNumber(data, numberAlbumShown);

  if (showOthers && data.length > 5) {
    if (showOthers.children.length < 2) {
      const generatedOtherIcon = document.createElement("i");
      showOthers.classList.add("d-flex", "justify-content-between");
      generatedOtherIcon.classList.add("bi", "bi-three-dots", "float-right", "fs-2", "p-2");

      showOthers.appendChild(generatedOtherIcon);

      generatedOtherIcon.addEventListener("click", () => {
        if (numberAlbumShown == 5) {
          numberAlbumShown = data.length;
        } else {
          numberAlbumShown = 5;
        }
        albumNumber(data, numberAlbumShown);
      });
    }
  }
}

async function albumNumber(data, lengthNumber) {
  const albumContainer = document.querySelector("#albumsContainer");
  albumContainer.innerHTML = "";
  const limit = Math.min(data.length, lengthNumber);

  for (let i = 0; i < limit; i++) {
    albumContainer.innerHTML += `<div class="searchedAlbum rounded-3">
                <img class="rounded-3 mb-2 px-0 mx-0" src="${data[i].album.cover_medium}" alt="album_cover">
                <h5 class="m-0 p-0 pt-1 fs-6">${data[i].album.title}</h5>
                <p class="m-0 p-0 pt-1 fs-8">20${data[i].isrc ? data[i].isrc.slice(5, 7) : ""} · <a href="#" class="artistElement">${data[i].artist.name}</a></p>
              </div>
              </div>
                <div class="d-none song" >${data[i].artist.id}</div>
              </div>`;
    localStorage.setItem(`albumId${i}`, data[i].album.id);
    localStorage.setItem(`artistAlbumId${i}`, data[i].artist.id);
    console.log(localStorage);
  }
}

async function secondsToMinutes(data) {
  let duration = await data.duration;
  let minutes = Math.floor(duration / 60);
  let seconds = duration % 60;

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

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
    return data;
  } catch (error) {
    console.error("Errore", error);
  }
}

function redirectArtist() {
  const artistElements = document.querySelectorAll(".artistElement");


  artistElements.forEach((element, index) => {
    element.onclick = (e) => {
      e.preventDefault();

      window.location.href = `./artist.html?id=${localStorage.getItem("artistId")}`;
    };
  });
}


window.onload = () => {
  tokenSearch();
  cardColorsGenerator();
};

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
  const searchButton = document.querySelector(".fa-solid.fa-magnifying-glass.m-0.p-0.fs-1");

  searchButton.addEventListener("click", (e) => {
    let query = "";
    let urlAPI = `https://striveschool-api.herokuapp.com/api/deezer/search?q=`;

    e.preventDefault();
    if (searchBar.value.toLowerCase() == "") {
      alert("inserisci un'artista o un brano");
    } else {
      query = searchBar.value;

      urlAPI = urlAPI + query;
      console.log(urlAPI);
      getData(urlAPI);
    }
  });
}

async function getData(searchAPI) {
  try {
    const response = await fetch(searchAPI);
    if (!response.ok) {
      throw new Error("Errore");
    }
    const data = response.json();
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

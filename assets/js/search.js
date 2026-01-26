
function cardColorsGenerator (){
const cardColors = ["#e13300", "#1e3264", "#e8125c", "#158a08", "#bc5800", "#7a5a95", "#503750", "#2d46b9", "#777777", "#8c1932", "#a56752", "#7d4b32"];

const randomIndex = () => {
  return Math.floor(Math.random() * cardColors.length);
};

const cards = document.querySelectorAll(".cardGenresNav");

cards.forEach((card) => {
  card.style.backgroundColor = cardColors[randomIndex()];
});
}

function getData(){
  
}


window.onload = () => {

cardColorsGenerator();


}

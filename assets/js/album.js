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

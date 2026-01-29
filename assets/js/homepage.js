window.addEventListener("DOMContentLoaded", () => {
  // 1) Prendo gli elementi principali: sezione hero (carousel), frecce, header e profilo
  const hero = document.querySelector("#heroCarousel")?.closest("section");
  const arrows = document.querySelector(".sp-nav-arrows");
  const header = document.querySelector(".sp-header");
  const profile = header?.querySelector(".dropdown.d-none.d-lg-block.ms-auto");
  if (!hero || !header || !profile) return;

  // 2) Bottone "MOSTRA ANNUNCI" (non esiste all'avvio, lo creo solo quando serve)
  let showBtn = null;

  // 3) Funzione per nascondere annunci: nascondo hero + frecce e creo il bottone "Mostra"
  const hideHero = () => {
    hero.classList.replace("d-lg-block", "d-lg-none"); // nasconde la hero su desktop
    arrows?.classList.add("d-none"); // nasconde le frecce

    // Creo il bottone solo la prima volta (se già esiste non lo ricreo)
    if (!showBtn) {
      showBtn = document.createElement("button");
      showBtn.id = "showAdsBtn";
      showBtn.type = "button";
      showBtn.className = "btn sp-hero-hide-btn d-lg-inline-block";
      showBtn.style.marginRight = "8px";
      showBtn.textContent = "MOSTRA ANNUNCI";
      header.insertBefore(showBtn, profile); // lo metto attaccato a sinistra del profilo

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

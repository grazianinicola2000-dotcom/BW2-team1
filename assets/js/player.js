const currentAudio = new Audio();

function populatePlayer(songs) {
  const songDetails = document.querySelector(".player-info-section");
  if (songDetails) {
    songDetails.innerHTML = `<img src="${songs.album.cover_medium}" class="player-desk-cover" alt="cover" />
            <div class="text-truncate min-w-0">
              <div id="playerDesktopTitleWrapper" >
                <div id="playerDesktopTitle" class="small fw-bold mb-0 text-truncate">${songs.title}</div>
              </div >
              <div class="text-white-50" style="font-size: 0.75rem">${songs.artist.name}</div>
            </div>
            <i class="bi bi-heart text-white-50 ms-2"></i`;
  }
}


currentAudio.src = localStorage.getItem("GetAudio");
currentAudio.volume = localStorage.getItem("audioVolume");


if (currentAudio.src) {
  audioTimes(currentAudio); 
  
  if (!currentAudio.paused) {
    currentAudio.pause();
  } else {
    currentAudio.play();
  }
}



function audioTimes(audio) {
  audio.onloadedmetadata = () => {
    const songDuration = document.querySelector(".duration");
    const savedTime = localStorage.getItem("currentTime");

    if (savedTime) {
        
        audio.currentTime = parseFloat(savedTime);
    }

    if (songDuration) {
      const minutesDuration = String(Math.round(audio.duration / 60));
      const seconds = String(Math.round(audio.duration % 60)).padStart(2, "0");
      songDuration.innerText = `${minutesDuration} : ${seconds}`;
    }
  };

  audio.ontimeupdate = () => {
    const realTime = document.querySelector(".realTime");
    
    if (audio.currentTime > 0) {
        localStorage.setItem("currentTime", audio.currentTime);
    }

    if (realTime) {
      const minutes = String(Math.floor(audio.currentTime / 60));
      const seconds = String(Math.floor(audio.currentTime % 60)).padStart(2, "0");
      realTime.innerText = `${minutes}:${seconds}`;
    }
    animateProgress(audio.currentTime, Math.round(audio.duration));
  };
}

function animateProgress(currentTime, duration) {
  const progressTime = document.querySelector(".progress-bar");
  if (progressTime && duration > 0) {
    const currentBarPosition = (currentTime / duration) * 100;
    progressTime.style.width = currentBarPosition + "%";
  }
}

const play =
  document.querySelector(".player-controls .bi-play-circle-fill") ||
  document.querySelector(".player-controls .bi-pause-circle-fill");

if (play) {
  play.onclick = () => {
    localStorage.setItem("audioState", currentAudio.paused);
    if (currentAudio.paused && currentAudio.src) {
      currentAudio.play();
      play.classList.remove("bi-play-circle-fill");
      play.classList.add("bi-pause-circle-fill");
    } else if (!currentAudio.paused) {
      currentAudio.pause();
      play.classList.remove("bi-pause-circle-fill");
      play.classList.add("bi-play-circle-fill");
    }
  };
}
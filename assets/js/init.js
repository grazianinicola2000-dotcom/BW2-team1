window.onload = () => {
  let currentAudio = new Audio();
  audioTimes(currentAudio);

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
};

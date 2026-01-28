function AudioPlayer(){
	audio = new Audio();
	audio.src = "content/introsound4.mp3";
	audio.play();
	audio.loop = true;
	audio.volume = 0.3;
	
	mutebutton = document.getElementById("player");
	button = document.getElementById("player");
	button = document.getElementById("player");
	button = document.getElementById("player");
	button = document.getElementById("player");

	function mute(){
		if(audio.muted){
		    audio.muted = false;
		    mutebutton.style.background = "url(images/index/mute.png) no-repeat";
		} 
		else {
		    audio.muted = true;
		    mutebutton.style.background = "url(images/index/unmute.png) no-repeat";
	    }
	}
	mutebutton.onclick = mute;
}
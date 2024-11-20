
var stTimer = document.getElementById('play');
var psTimer = document.getElementById('pause');
var timerDisplay = document.querySelectorAll(`[data-chronometer]`);
var pageMain = document.getElementById('pageMain');
var pageSetup = document.getElementById('pageSetup');
var pageResum = document.getElementById('pageResum');
var titolPagina = document.getElementById('titolPagina');

var startTime;
var updatedTime;
var difference;
var tInterval;
var savedTime;
var paused = 0;
var running = 0;
var currentTime = 0;
var primeraPart = true;

function startTimer(){
    if(!running){
      startTime = new Date().getTime();
      tInterval = setInterval(getShowTime, 1000);
      paused = 0;
      running = 1;
      stTimer.style.display;
    }
  }

  function pauseTimer(){
    if (!difference){
      // if timer never started, don't allow pause button to do anything
    } else if (!paused) {
      clearInterval(tInterval);
      savedTime = difference;
      paused = 1;
      running = 0;
    } else {
      startTimer();
    }
  }

  function resetTimer(){
    clearInterval(tInterval);
    savedTime = 0;
    difference = 0;
    paused = 0;
    running = 0;
  }

  function getShowTime(){
    updatedTime = new Date().getTime();
  if (savedTime){ 
      difference = (updatedTime - startTime) + savedTime;
    } else { 
      difference =  updatedTime - startTime; 
    }
  // var days = Math.floor(difference / (1000 * 60 * 60 * 24));
    //var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);
 // hours = (hours < 10) ? "0" + hours : hours;
    currentTime = minutes;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  for (let timer of timerDisplay) {
    timer.innerHTML = minutes + ':' + seconds;
  }
  //timerDisplay.innerHTML = minutes + ':' + seconds;
  if(primeraPart & minutes>44){
    pauseTimer();
    primeraPart=false;
    }
  }

  function afegirJugador(){
    let llistaJugadors = document.getElementById('form-jugadors');
    let nouElement = document.createElement('div');
    nouElement.id = 'introJugador';
    nouElement.classList.add('flex', 'row')
    nouElement.innerHTML = `<md-outlined-text-field class="dorsal" label="Dor." value="00" type="text" minlength="5">
    </md-outlined-text-field>
    <md-outlined-text-field class="jugador" label="Jugador" value="Nom jugador" type="text" minlength="5">
    </md-outlined-text-field>`;
    llistaJugadors.appendChild(nouElement);
    dialogAfegirEquip.show();
  }


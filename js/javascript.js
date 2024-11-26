
//Variables DOM
var stTimer = document.getElementById('play');
var psTimer = document.getElementById('pause');
var timerDisplay = document.querySelectorAll(`[data-chronometer]`);
var pageMain = document.getElementById('pageMain');
var pageSetup = document.getElementById('pageSetup');
var pageResum = document.getElementById('pageResum');
var titolPagina = document.getElementById('titolPagina');

//Timer
var startTime;
var updatedTime;
var difference;
var tInterval;
var savedTime;
var paused = 0;
var running = 0;
var currentTime = 0;
var primeraPart = true;

//Setup
var emmagatzematgeEquips = [];
var equip1 = {};
var equip2 = {};

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



  // Pagina SETUP
  //Introducció de Jugadors i creacio de la graella de la base de dades d'equips.
  function afegirJugador(desti){
    let llistaJugadors = document.getElementById(desti);
    let botoAfegirJugador = llistaJugadors.querySelector('#botoAfegirNouJugador');
    let nouElement = document.createElement('div');
    nouElement.classList.add('flex', 'row', 'introJugador')
    nouElement.innerHTML = `<md-outlined-text-field class="dorsal" label="Dor." value="" placeholder="00" type="text" minlength="1">
    </md-outlined-text-field>
    <md-outlined-text-field class="jugador" label="Jugador" value="" placeholder="Nom Jugador" type="text" minlength="1">
    </md-outlined-text-field>`;
    llistaJugadors.insertBefore(nouElement, botoAfegirJugador);
  }

  function desaEquip(){
    emmagatzematgeEquips = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
    let llistaJugadorsForm = document.querySelectorAll('#afegirEquip .introJugador');
    let llistaJugadors = {};
    let equip = {};
    equip['nom'] = document.getElementById('nomEquip').value;
    equip['entrenador'] = document.getElementById('nomEntrenador').value;
    for (jugador of llistaJugadorsForm){
      llistaJugadors[jugador.querySelector('.dorsal').value] = jugador.querySelector('.jugador').value;
    }
    equip['jugadors'] = llistaJugadors;
    emmagatzematgeEquips.push(equip);
    dialogAfegirEquip.close();
    dialogAfegirEquip.innerHTML = `<md-outlined-text-field id="nomEquip" slot="headline" label="Nom Equip" value="Nom del Equip" type="text" minlength="5">
    </md-outlined-text-field>
    <form slot="content" id="form-jugadors" method="dialog" class="flex column gap1"> 
      <md-outlined-text-field id="nomEntrenador" label="Entrenador" value="Entrenador" type="text" minlength="5">
      </md-outlined-text-field>
      <div class="flex row introJugador">
        <md-outlined-text-field class="dorsal" label="Dor." value="" placeholder="00" type="text" minlength="1">
        </md-outlined-text-field>
        <md-outlined-text-field class="jugador" label="Jugador" value="" placeholder="Nom Jugador" type="text" minlength="1">
        </md-outlined-text-field>
      </div>
      <md-filled-button id="botoAfegirNouJugador" onclick="afegirJugador()">Afegeix<md-icon slot="icon">add</md-icon></md-filled-button>
    </form>
    <div slot="actions">
      <md-text-button form="form-id" onclick="desaEquip()">Ok</md-text-button>
      <md-text-button form="form-id" onclick="dialogAfegirEquip.close()">Cancel</md-text-button>
    </div>`;
    localStorage.equips = JSON.stringify(emmagatzematgeEquips);
    document.getElementById('graellaEquips').innerHTML = "";
    generaGraellaEquips(); 
  }

  function generaGraellaEquips(){
    let equipsDesats = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
    let graellaEquips = document.getElementById('graellaEquips');
    for (let[index, equips] of equipsDesats.entries()){
      let nouElement = document.createElement('div');
      nouElement.id = 'tarjaEquip';
      nouElement.classList.add('tarjaEquip');
      nouElement.innerHTML = `<img src="" alt="">
        <div>
          <h4>`+ equips.nom +`</h4>
          <p>`+ equips.entrenador +`</p>
        </div>
        <md-fab id="editEquip`+index+`" onclick="generaDialogEquip(`+index+`)" class="selfEnd alignCenter" size="small" touch-target="none" aria-label="Edit">
          <md-icon slot="icon">edit</md-icon>
        </md-fab>`
        graellaEquips.appendChild(nouElement);
    }
  }

  //Modificació d'equips ja creats:

  function generaDialogEquip(num){
    dialogEditarEquip.innerHTML = `<md-outlined-text-field id="nomEquipEditar" slot="headline" label="Nom Equip" value="Nom del Equip" type="text" minlength="5">
    </md-outlined-text-field>
    <form slot="content" id="form-editar" method="dialog" class="flex column gap1"> 
      <md-outlined-text-field id="nomEntrenadorEditar" label="Entrenador" value="Entrenador" type="text" minlength="5">
      </md-outlined-text-field>
      
      <md-filled-button id="botoAfegirNouJugador" onclick="afegirJugador('form-editar')">Afegeix<md-icon slot="icon">add</md-icon></md-filled-button>
    </form>
    <div slot="actions">
      <md-text-button id="accept" form="form-id">Ok</md-text-button>
      <md-text-button form="form-id" onclick="dialogEditarEquip.close()">Cancel</md-text-button>
    </div>`;
    let botoAfegirJugador = document.querySelector('#editarEquip #botoAfegirNouJugador');
    let llistaJugadors = document.querySelector('#editarEquip #form-editar');
    let botoDesaEquip = document.querySelector('#editarEquip #accept');
    botoDesaEquip.setAttribute("onclick", "actualitzaEquip("+num+")")
    let equipsDesats = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
    let equip = equipsDesats[num];
    dialogEditarEquip.querySelector('#nomEquipEditar').value = equip.nom;
    dialogEditarEquip.querySelector('#nomEntrenadorEditar').value = equip.entrenador;
    for (jugador in equip.jugadors){
      let nouElement = document.createElement('div');
      //nouElement.id = 'introJugador';
      nouElement.classList.add('flex', 'row', 'introJugador');
      nouElement.innerHTML = `<md-outlined-text-field class="dorsal" label="Dor." value="`+jugador[0]+`" placeholder="00" type="text" minlength="1">
        </md-outlined-text-field>
        <md-outlined-text-field class="jugador" label="Jugador" value="`+equip.jugadors[jugador]+`" placeholder="Nom Jugador" type="text" minlength="1">
        </md-outlined-text-field>`;
    llistaJugadors.insertBefore(nouElement, botoAfegirJugador);
    }
    dialogEditarEquip.show();
  }
/* 
    function afegirJugador(){
    let llistaJugadors = document.getElementById('form-jugadors');
    let botoAfegirJugador = document.getElementById('botoAfegirNouJugador');
    let nouElement = document.createElement('div');
    //nouElement.id = 'introJugador';
    nouElement.classList.add('flex', 'row', 'introJugador')
    nouElement.innerHTML = `<md-outlined-text-field class="dorsal" label="Dor." value="" placeholder="00" type="text" minlength="1">
    </md-outlined-text-field>
    <md-outlined-text-field class="jugador" label="Jugador" value="" placeholder="Nom Jugador" type="text" minlength="1">
    </md-outlined-text-field>`;
    llistaJugadors.insertBefore(nouElement, botoAfegirJugador);
    }
    */

  function actualitzaEquip(num){
    emmagatzematgeEquips = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
    let llistaJugadorsForm = document.querySelectorAll('#editarEquip .introJugador');
    let llistaJugadors = {};
    let equip = {};
    equip['nom'] = document.getElementById('nomEquipEditar').value;
    equip['entrenador'] = document.getElementById('nomEntrenadorEditar').value;
    for (jugador of llistaJugadorsForm){
      llistaJugadors[jugador.querySelector('.dorsal').value] = jugador.querySelector('.jugador').value;
    }
    equip['jugadors'] = llistaJugadors;
    emmagatzematgeEquips[num] = equip;
    dialogEditarEquip.close();
    localStorage.equips = JSON.stringify(emmagatzematgeEquips);
    dialogEditarEquip.innerHTML = `<md-outlined-text-field id="nomEquipEditar" slot="headline" label="Nom Equip" value="Nom del Equip" type="text" minlength="5">
    </md-outlined-text-field>
    <form slot="content" id="form-editar" method="dialog" class="flex column gap1"> 
      <md-outlined-text-field id="nomEntrenadorEditar" label="Entrenador" value="Entrenador" type="text" minlength="5">
      </md-outlined-text-field>
      
      <md-filled-button id="botoAfegirNouJugador" onclick="afegirJugador('form-editar')">Afegeix<md-icon slot="icon">add</md-icon></md-filled-button>
    </form>
    <div slot="actions">
      <md-text-button id="accept" form="form-id">Ok</md-text-button>
      <md-text-button form="form-id" onclick="dialogEditarEquip.close()">Cancel</md-text-button>
    </div>`;
  }

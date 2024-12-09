
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
var equips = [];
var emmagatzematgeEquips = []; //Dades equips desats
var equipsSeleccionats = []; //Dades dels dos equips seleccionats
var jugadorsActius = []; //Jugadors sobre el camp
var ipVmix; //adreça del vMix
var dadesVmix; //Info rebuda de l'API en XML
var llistaGrafismes = []; //llista de grafismes detectats al vMix per a seleccionar
var grafismesSeleccionats = []; //info dels grafismes seleccionats per a vincular amb les dades
var resumPartit = []; //accions que s'han desat durant el partit
var accio = "gol";


//Accions a realitzar en carregar la pàgina:
document.addEventListener("DOMContentLoaded", (event) => {
  window.onload = generaGraellaEquips();
  emmagatzematgeEquips = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
  ipVmix = localStorage.vmix===undefined?"":JSON.parse(localStorage.vmix).ip;
  document.getElementById('inputIpVmix').value = ipVmix;
  //  let selectorsDeGrafisme = document.querySelectorAll()
  grafismesSeleccionats[0] = JSON.parse(localStorage.vmix).grafismeAlineacio;
  grafismesSeleccionats[1] = JSON.parse(localStorage.vmix).grafismeGol;
  grafismesSeleccionats[2] = JSON.parse(localStorage.vmix).grafismeTargeta;
  grafismesSeleccionats[3] = JSON.parse(localStorage.vmix).grafismeCanvi;   
  grafismesSeleccionats[4] = JSON.parse(localStorage.vmix).grafismeFinal;
  resumPartit = localStorage.accions===undefined?[]:JSON.parse(localStorage.accions);
  llistaEquips();
  generaGraellaResum();

});

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
  if (event) event.preventDefault();
  let llistaJugadors = document.getElementById(desti);
  let botoAfegirJugador = llistaJugadors.querySelector('#botoAfegirNouJugador');
  let nouElement = document.createElement('div');
  nouElement.classList.add('flex', 'row', 'introJugador')
  nouElement.innerHTML = `<md-outlined-text-field class="dorsal" label="Dor." value="" placeholder="00" type="text" minlength="1">
  </md-outlined-text-field>
  <md-outlined-text-field class="jugador" label="Jugador" value="" placeholder="Nom Jugador" type="text" minlength="1">
  </md-outlined-text-field>
  <md-checkbox touch-target="wrapper"></md-checkbox>`;
  llistaJugadors.insertBefore(nouElement, botoAfegirJugador);
  if (desti == 'form-editar'){
    let botoDesaEquip = document.querySelector('#editarEquip #accept');
    botoDesaEquip.getAttribute('onclick');
    actualitzaEquip(botoDesaEquip.getAttribute('onclick').substr(16,botoDesaEquip.getAttribute('onclick').length-17));
    generaGraellaEquips();
  }
}

function desaEquip(){
  //emmagatzematgeEquips = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
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
      <md-checkbox touch-target="wrapper"></md-checkbox>
    </div>
    <md-filled-button id="botoAfegirNouJugador" type="button" onclick="afegirJugador('form-jugadors')">
      Afegeix
    <md-icon slot="icon">add</md-icon></md-filled-button>
  </form>
  <div slot="actions">
    <md-text-button form="form-jugadors" onclick="desaEquip()">Ok</md-text-button>
    <md-text-button onclick="dialogAfegirEquip.close()">Cancel</md-text-button>
  </div>`;
  localStorage.equips = JSON.stringify(emmagatzematgeEquips);
  document.getElementById('graellaEquips').innerHTML = "";
  generaGraellaEquips(); 
  llistaEquips(); 
}

function generaGraellaEquips(){
  let equipsDesats = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
  let graellaEquips = document.getElementById('graellaEquips');
  graellaEquips.innerHTML = "";
  for (let[index, equips] of equipsDesats.entries()){
    let nouElement = document.createElement('div');
    nouElement.id = 'tarjaEquip_'+index;
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
  let equipsDesats = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
  let equip = equipsDesats[num];

  if ( equip.nom !== document.getElementById('nomEquipEditar').value){
    dialogEditarEquip.innerHTML = `<md-outlined-text-field id="nomEquipEditar" slot="headline" label="Nom Equip" value="Nom del Equip" type="text" minlength="5">
    </md-outlined-text-field>
    <form slot="content" id="form-editar" method="dialog" class="flex column gap1"> 
      <md-outlined-text-field id="nomEntrenadorEditar" label="Entrenador" value="Entrenador" type="text" minlength="5">
      </md-outlined-text-field> 
      <md-filled-button id="botoAfegirNouJugador" type="button" onclick="afegirJugador('form-editar')">
        Afegeix
      <md-icon slot="icon">add</md-icon></md-filled-button>
    </form>
    <div slot="actions">
      <md-text-button id="accept" form="form-editar">Ok</md-text-button>
      <md-text-button onclick="dialogEditarEquip.close()">Cancel</md-text-button>
    </div>`;
    
    let botoAfegirJugador = document.querySelector('#editarEquip #botoAfegirNouJugador');
    let llistaJugadors = document.querySelector('#editarEquip #form-editar');
    let botoDesaEquip = document.querySelector('#editarEquip #accept');
    
    botoDesaEquip.setAttribute("onclick", "actualitzaEquip("+num+")");
    dialogEditarEquip.querySelector('#nomEquipEditar').value = equip.nom;
    dialogEditarEquip.querySelector('#nomEntrenadorEditar').value = equip.entrenador;
    for (jugador in equip.jugadors){
      let nouElement = document.createElement('div');
      //nouElement.id = 'introJugador';
      nouElement.classList.add('flex', 'row', 'introJugador');
      nouElement.innerHTML = `<md-outlined-text-field class="dorsal" label="Dor." value="`+jugador[0]+`" placeholder="00" type="text" minlength="1">
      </md-outlined-text-field>
      <md-outlined-text-field class="jugador" label="Jugador" value="`+equip.jugadors[jugador]+`" placeholder="Nom Jugador" type="text" minlength="1">
      </md-outlined-text-field>
      <md-checkbox touch-target="wrapper"></md-checkbox>`;
      llistaJugadors.insertBefore(nouElement, botoAfegirJugador);
    }
  }
  dialogEditarEquip.show();
}

function actualitzaEquip(num){
  //emmagatzematgeEquips = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
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
  /* dialogEditarEquip.innerHTML = `<md-outlined-text-field id="nomEquipEditar" slot="headline" label="Nom Equip" value="Nom del Equip" type="text" minlength="5">
  </md-outlined-text-field>
  <form slot="content" id="form-editar" method="dialog" class="flex column gap1"> 
    <md-outlined-text-field id="nomEntrenadorEditar" label="Entrenador" value="Entrenador" type="text" minlength="5">
    </md-outlined-text-field>
    
    <md-filled-button id="botoAfegirNouJugador" onclick="afegirJugador('form-editar')">Afegeix<md-icon slot="icon">add</md-icon></md-filled-button>
  </form>
  <div slot="actions">
    <md-text-button id="accept" form="form-id">Ok</md-text-button>
    <md-text-button form="form-id" onclick="dialogEditarEquip.close()">Cancel</md-text-button>
  </div>`;*/
  document.getElementById('graellaEquips').innerHTML = "";
  generaGraellaEquips(); 
}



// PAG MAIN

function llistaEquips(){
  let llistaEquipLocal = document.getElementById('equipLocal');
  let llistaEquipVisitant = document.getElementById('equipVisitant');
  for (equip in emmagatzematgeEquips){
    let nouElement = document.createElement('md-select-option');
    nouElement.setAttribute('value', equip);
    //console.log(equip + " - " + emmagatzematgeEquips[equip].nom);
    nouElement.innerHTML = `<div slot="headline">` + emmagatzematgeEquips[equip].nom + `</div>`;
    let nouElement2 = nouElement.cloneNode(true);
    llistaEquipVisitant.appendChild(nouElement);
    llistaEquipLocal.appendChild(nouElement2);
  }
}

function seleccioEquips(num){
  let equipTemporal = document.getElementById(num==0?'equipLocal':'equipVisitant').value;
  let counter = 0;
  equipsSeleccionats[num] = emmagatzematgeEquips[equipTemporal];
  for (let [index, jugador] of Object.entries(equipsSeleccionats[num].jugadors)){
    document.querySelectorAll('#alineacio'+ num+' md-list-item')[counter].children[0].innerHTML = jugador;
    document.querySelectorAll('#alineacio'+ num+' md-list-item')[counter].children[1].innerHTML = index;
    counter += 1;
  }
  document.getElementById('buttonAccio'+num).disabled = false;
  document.getElementById('selectAccioEquip'+num).nextElementSibling.innerHTML = equipsSeleccionats[num].nom;
  document.getElementById('entrenador'+num).innerHTML = equipsSeleccionats[num].entrenador;
  jugadorsAccio(num);

}

function jugadorsAccio(num){
  equipsSeleccionats[num];
  let counter = 0;
  let llistes = document.getElementsByClassName('selectJugador');
  for (jugador in equipsSeleccionats[num].jugadors){
    console.log(jugador+ " - " + equipsSeleccionats[num].jugadors[jugador]);
    jugadorsActius[parseInt(num)*11+parseInt(counter)]= jugador + " - " + equipsSeleccionats[num].jugadors[jugador];
    llistes[0].children[parseInt(num)*11+parseInt(counter)].innerHTML = jugador + " - " + equipsSeleccionats[num].jugadors[jugador];
    llistes[0].children[parseInt(num)*11+parseInt(counter)].value = jugador;
    //La segona llista ha de ser dels no sel·leccionats
    llistes[1].children[parseInt(num)*11+parseInt(counter)].innerHTML = jugador + " - " + equipsSeleccionats[num].jugadors[jugador];
    llistes[1].children[parseInt(num)*11+parseInt(counter)].value = jugador;
    counter += 1;
  }
}

function filtraJugadorsAccio(classe){
  let seleccionats = document.querySelectorAll('.'+classe);
  let deseleccionats = document.querySelectorAll('.'+ (classe=='llistaJugadorsEquip0'?'llistaJugadorsEquip1':'llistaJugadorsEquip0'));
  deseleccionats.forEach(element => {
    element.classList.add('amaga'); 
  });
  seleccionats.forEach(element => {
    element.classList.remove('amaga'); 
  });
}

async function obtenirDadesVmix(ipVmix) {
  //Aquesta funció l'he adaptat d'alguns fils de Stackoverflow. 
  const url = `http://${ipVmix}/api`;
  try {
      const resposta = await fetch(url);       
      if (!resposta.ok) {
        throw new Error(`Error en la solicitud: ${resposta.status}`);
      }
      const textXML = await resposta.text();
      const parser = new DOMParser(); 
      dadesVmix = parser.parseFromString(textXML, "application/xml");
  } catch (error) {
      console.error("Error al obtener los datos de vMix:", error);
      alert("Error al obtener los datos de vMix:\n"+ error);
      return
  }
  const inputs = dadesVmix.querySelectorAll("input");
  //Creem un array filtrant per l'atribut type
  const inputsGT = Array.from(inputs).filter(input => input.getAttribute("type") === "GT");
  llistaGrafismes = inputsGT.map(input => ({
      key: input.getAttribute("key"),
      title: input.getAttribute("title")
  }));
  afegirOpcionsGrafismes(llistaGrafismes);
}

function afegirOpcionsGrafismes(llistaGrafismes) {
  const elementsSelect = document.querySelectorAll("#configuracioEscenes ul li md-outlined-select");
  elementsSelect.forEach(select => {
      select.innerHTML = '';

      // Recórrer la llista de grafismes
      llistaGrafismes.forEach(grafisme => {
          // Crear l'element <md-select-option>
          const option = document.createElement("md-select-option");
          option.setAttribute("value", grafisme.key);

          // Crear el <div> amb el text del title
          const div = document.createElement("div");
          div.setAttribute("slot", "headline");
          div.textContent = grafisme.title;

          // Inserir el <div> dins de <md-select-option>
          option.appendChild(div);

          // Afegir l'opció al <md-outlined-select>
          select.appendChild(option);
      });
  });
}

function desaDadesVmix(){
let temporalGrafismes = {};
temporalGrafismes['ip'] = ipVmix;
let temp = document.querySelectorAll('#configuracioEscenes ul li md-outlined-select');
temporalGrafismes['grafismeAlineacio'] =temp[0].value;
grafismesSeleccionats[0] = temp[0].value;
temporalGrafismes['grafismeGol'] = temp[1].value;
grafismesSeleccionats[1] = temp[1].value;
temporalGrafismes['grafismeTargeta'] = temp[2].value;
grafismesSeleccionats[2] = temp[2].value;
temporalGrafismes['grafismeCanvi'] = temp[3].value;
grafismesSeleccionats[3] = temp[3].value;
temporalGrafismes['grafismeFinal'] = temp[4].value;   
grafismesSeleccionats[4] = temp[4].value;
localStorage.vmix = JSON.stringify(temporalGrafismes);
}


//Accions per modificar el dialog d'afegir acció
function accioGol(){
  accio='gol';
  document.getElementById('selectJugador2').classList.contains('amaga')?"":document.getElementById('selectJugador2').classList.add('amaga');
  document.querySelectorAll('.selectTargeta').forEach(element => {
    element.classList.contains('amaga')?"":element.classList.add('amaga');
  });
}

function accioTargeta(){
  accio='targeta;'
  document.getElementById('selectJugador2').classList.contains('amaga')?"":document.getElementById('selectJugador2').classList.add('amaga');
  document.querySelectorAll('.selectTargeta').forEach(element => {
    element.classList.contains('amaga')?element.classList.remove('amaga'):"";
  });
}

function accioCanvi(){
  accio='canvi';
  document.getElementById('selectJugador2').classList.contains('amaga')?document.getElementById('selectJugador2').classList.remove('amaga'):"";
  document.querySelectorAll('.selectTargeta').forEach(element => {
    element.classList.contains('amaga')?"":element.classList.add('amaga');
  });
}

function accuiLesio(){
  accio='lesio';
}

function desaAccio(){
  let accioTemp = {};
  accioTemp.timecode = currentTime;
  accioTemp.equipAccio = document.getElementById('selectAccioEquip0').checked?'0':'1';
  accioTemp.tipus = accio;
  accioTemp.jugador0 = document.getElementById('selectJugador1').value;
  accioTemp.jugador1 = document.getElementById('selectJugador2').value;
  resumPartit.push(accioTemp);
  localStorage.accions = JSON.stringify(resumPartit);

  llencaGrafisme();
  generaGraellaResum();
}

async function obtenirDadesVmix(ipVmix) {
  //Aquesta funció l'he adaptat d'alguns fils de Stackoverflow. 
  const url = `http://${ipVmix}/api`;
  try {
      const resposta = await fetch(url);       
      if (!resposta.ok) {
        throw new Error(`Error en la solicitud: ${resposta.status}`);
      }
      const textXML = await resposta.text();
      const parser = new DOMParser(); 
      dadesVmix = parser.parseFromString(textXML, "application/xml");
  } catch (error) {
      console.error("Error al obtener los datos de vMix:", error);
      alert("Error al obtener los datos de vMix:\n"+ error);
      return
  }
  const inputs = dadesVmix.querySelectorAll("input");
  //Creem un array filtrant per l'atribut type
  const inputsGT = Array.from(inputs).filter(input => input.getAttribute("type") === "GT");
  llistaGrafismes = inputsGT.map(input => ({
      key: input.getAttribute("key"),
      title: input.getAttribute("title")
  }));
  afegirOpcionsGrafismes(llistaGrafismes);
}

async function llencaGrafisme(){
  const url = `http://${ipVmix}/api`;
  let equip = equipsSeleccionats[document.getElementById('selectAccioEquip0').checked?'0':'1'];
  let jugadorOut = equip.jugadors[document.getElementById('selectJugador1').value];
  
  switch(accio){
    case 'gol':
      break;
    case 'targeta':

      break;
    case 'canvi':     
      let jugadorIn = equip.jugadors[document.getElementById('selectJugador2').value];
      let url1 = ''+url+'/?Function=SetText&Input='+grafismesSeleccionats[3].replace(/ /g, '%20')+'&Value='+jugadorIn.replace(/ /g, '%20')+'&SelectedName=On%20Name.Text';
      let url2 = ''+url+'/?Function=SetText&Input='+grafismesSeleccionats[3].replace(/ /g, '%20')+'&Value='+jugadorOut.replace(/ /g, '%20')+'&SelectedName=Off%20Name.Text';
      let url3 = ''+url+'/?Function=OverlayInput2&Input='+grafismesSeleccionats[3].replace(/ /g, '%20');
      try {
        console.log(url1)       
        const resposta = await fetch(url1);
        if (!resposta.ok) {
          alert('Grafisme Targeta actualitzat!');
          throw new Error(`Error en la solicitud: ${resposta.status}`);
        }
      } catch (error) {
          alert("Error al obtener los datos de vMix:\n"+ error);
          return
      }
      try {
              
        const resposta2 = await fetch(url2); 
        if (!resposta2.ok) {
          throw new Error(`Error en la solicitud: ${resposta2.status}`);
        }
      } catch (error) {
        alert("Error al obtener los datos de vMix:\n"+ error);
        return
      }
      alert('Grafisme Targeta actualitzat!');
      try {
        console.log(url3); 
        const resposta3 = await fetch(url3);      
        if (!resposta3.ok) {
          throw new Error(`Error en la solicitud: ${resposta3.status}`);
        }
      } catch (error) {
        alert("Error al obtener los datos de vMix:\n"+ error);
        return
      }
      alert('Grafisme Targeta actualitzat!');
      break;
    case 'lesio':
      break;
  }
}

function generaIcones(accio){
  switch(accio){
    case 'gol':
      return '⚽'
    case 'targeta':
      return '🟨'
    case 'canvi':
      return '🔃'
    case 'lesio':
      return'🚑'
  }
}

function generaGraellaResum(){
  let accionsDesades = localStorage.accions===undefined?[]:JSON.parse(localStorage.accions);
  let graellaResum = document.getElementById('graellaResum');
  graellaResum.innerHTML = "";
  let golsLocal = 0;
  let golsVisitant = 0;
  for (let[index, accions] of accionsDesades.entries()){
    accions.tipus=='gol'?accions.equipAccio==0?golsLocal +=1:golsVisitant +=1:"";
    let nouElement = document.createElement('li');
    nouElement.id = 'accio_'+index;
    //nouElement.classList.add('tarjaEquip');
    console.log(accions.equipAccio);
    console.log(equipsSeleccionats[accions.equipAccio]);
    nouElement.innerHTML = `
    <span class="timecode">${accions.timecode}</span>
    <span class="icona">${accions.equipAccio==0?generaIcones(accions.tipus):""}</span>
    <span class="jugador">${accions.equipAccio==0?accions.tipus=='canvi'?equipsSeleccionats[0].jugadors[accions.jugador0] + " > "+equipsSeleccionats[0].jugadors[accions.jugador1]:equipsSeleccionats[0].jugadors[accions.jugador0]:""}</span>
    <span class="resultat">${golsLocal}-${golsVisitant}</span>
    <span class="icona">${accions.equipAccio==1?generaIcones(accions.tipus):""}</span>
    <span class="jugador">${accions.equipAccio==1?accions.tipus=='canvi'?equipsSeleccionats[1].jugadors[accions.jugador0] + " > "+equipsSeleccionats[1].jugadors[accions.jugador1]:equipsSeleccionats[1].jugadors[accions.jugador0]:""}</span>
    <md-icon slot="icon" onclick="editaAccio('${index}')">Cancel</md-icon>`
    graellaResum.appendChild(nouElement);
  }
}



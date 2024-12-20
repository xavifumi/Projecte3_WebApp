
//Variables DOM
var stTimer = document.getElementById('play');
var psTimer = document.getElementById('pause');
var timerDisplay = document.querySelectorAll(`[data-chronometer]`);
var pageMain = document.getElementById('pageMain');
var pageSetup = document.getElementById('pageSetup');
var pageResum = document.getElementById('pageResum');
var titolPagina = document.getElementById('titolPagina');

//Variables Crono
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
var targetes = [];
targetes[0] = {};
targetes[1] = {};
var accio = "gol";

//Elements html que generem via codi (exclosos els que inserten variables ja que no estan declarades encara):
var htmlAfegirJugador = `<md-outlined-text-field class="dorsal" label="Dor." value="" placeholder="00" type="text" minlength="1">
</md-outlined-text-field>
<md-outlined-text-field class="jugador" label="Jugador" value="" placeholder="Nom Jugador" type="text" minlength="1">
</md-outlined-text-field>
<md-checkbox touch-target="wrapper" class="seleccionat" onchange="limitarCheckboxes(this)"></md-checkbox>`;

var htmlAfegirJugadorNoCheck = `<md-outlined-text-field class="dorsal" label="Dor." value="" placeholder="00" type="text" minlength="1">
</md-outlined-text-field>
<md-outlined-text-field class="jugador" label="Jugador" value="" placeholder="Nom Jugador" type="text" minlength="1">
</md-outlined-text-field>`;

var htmlDialogCreaEquip = `<md-outlined-text-field id="nomEquip" slot="headline" label="Nom Equip" value="Nom del Equip" type="text" minlength="5">
</md-outlined-text-field>
<md-outlined-text-field id="abreviEquip" slot="headline" label="Abreviatura Equip"  type="text" minlength="3" maxlength="4" class="abreviatura" style="text-transform:uppercase">
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
  <md-filled-button id="botoAfegirNouJugador" type="button" onclick="afegirJugador('form-jugadors')">
    Afegeix
  <md-icon slot="icon">add</md-icon></md-filled-button>
</form>
<div slot="actions">
  <md-text-button form="form-jugadors" onclick="desaEquip()">Ok</md-text-button>
  <md-text-button onclick="dialogAfegirEquip.close()">Cancel</md-text-button>
</div>`;

var htmlDialogEditaEquip = `<md-outlined-text-field id="nomEquipEditar" slot="headline" label="Nom Equip" value="Nom del Equip" type="text" minlength="5">
</md-outlined-text-field>
<md-outlined-text-field id="abreviEquipEditar" slot="headline" label="Abreviatura Equip"  type="text" minlength="3" maxlength="4" class="abreviatura" style="text-transform:uppercase">
</md-outlined-text-field>
<form slot="content" id="form-editar" method="dialog" class="flex column gap1"> 
  <md-outlined-text-field id="nomEntrenadorEditar" label="Entrenador" value="Entrenador" type="text" minlength="5" oninput="validarNomPropi(this)">
  </md-outlined-text-field> 
  <md-filled-button id="botoAfegirNouJugador" type="button" onclick="afegirJugador('form-editar')">
    Afegeix
  <md-icon slot="icon">add</md-icon></md-filled-button>
</form>
<div slot="actions">
  <md-text-button id="accept" form="form-editar">Ok</md-text-button>
  <md-text-button onclick="dialogEditarEquip.close()">Cancel</md-text-button>
</div>`;


//Accions a realitzar en carregar la pàgina:
document.addEventListener("DOMContentLoaded", (event) => {
  window.onload = generaGraellaEquips();
  emmagatzematgeEquips = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
  ipVmix = localStorage.vmix===undefined?"":JSON.parse(localStorage.vmix).ip;
  document.getElementById('inputIpVmix').value = ipVmix;
  //  let selectorsDeGrafisme = document.querySelectorAll()
  if(localStorage.vmix!==undefined){
    grafismesSeleccionats[0] = JSON.parse(localStorage.vmix).grafismeAlineacio;
    grafismesSeleccionats[1] = JSON.parse(localStorage.vmix).grafismeGol;
    grafismesSeleccionats[2] = JSON.parse(localStorage.vmix).grafismeTargeta;
    grafismesSeleccionats[3] = JSON.parse(localStorage.vmix).grafismeCanvi;
    grafismesSeleccionats[4] = JSON.parse(localStorage.vmix).grafismeFinal;
  };
  resumPartit = localStorage.accions===undefined?[]:JSON.parse(localStorage.accions);
  //'equipLocal':'equipVisitant'
  obtenirDadesVmix(ipVmix);
  llistaEquips();
  document.getElementById('equipLocal').value = localStorage[0];
  seleccioEquips(0);
  document.getElementById('equipVisitant').value = localStorage[1];
  seleccioEquips(1);
  generaGraellaResum();

});

dialogAfegirEquip.addEventListener('cancel', (e) => e.preventDefault());
dialogEditarEquip.addEventListener('cancel', (e) => e.preventDefault());
dialog.addEventListener('cancel', (e) => e.preventDefault());

// Opcional: també podem interceptar el "close"
//dialogAfegirEquip.addEventListener('close', (e) => e.preventDefault());
//dialogEditarEquip.addEventListener('close', (e) => e.preventDefault());
//dialog.addEventListener('close', (e) => e.preventDefault());

function startTimer(){
    if(!running){
      startTime = new Date().getTime();
      tInterval = setInterval(getShowTime, 1000);
      paused = 0;
      running = 1;
      stTimer.style.display;
      fetch(`http://${ipVmix}/api/?Function=StartCountdown&Input=${grafismesSeleccionats[5]}&SelectedName=Time.Text`);
      fetch(`http://${ipVmix}/api/?Function=OverlayInput1In&Input=${grafismesSeleccionats[5]}`)
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
  fetch('http://172.30.208.1:8088/api/?Function=OverlayInput1Out')
  }
}




// Pagina SETUP ************************************************************************************************************
//Introducció de Jugadors i creacio de la graella de la base de dades d'equips.*********************************************
function afegirJugador(desti){
  let llistaJugadors = document.getElementById(desti);
  let botoAfegirJugador = llistaJugadors.querySelector('#botoAfegirNouJugador');
  let nouElement = document.createElement('div');
  nouElement.classList.add('flex', 'row', 'introJugador')
  nouElement.innerHTML = desti=='form-editar'?htmlAfegirJugador:htmlAfegirJugadorNoCheck;
  llistaJugadors.insertBefore(nouElement, botoAfegirJugador);
  /** 
   * 
  if (desti == 'form-editar'){
    let botoDesaEquip = document.querySelector('#editarEquip #accept');
    //botoDesaEquip.getAttribute('onclick');
    //mirarem en el l'accio onclick quin es el nombre de equip a l'array
    actualitzaEquip(botoDesaEquip.getAttribute('onclick').substr(16,botoDesaEquip.getAttribute('onclick').length-17));
    generaGraellaEquips();
  }
  */
}

function desaEquip(){
  //emmagatzematgeEquips = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
  let llistaJugadorsForm = document.querySelectorAll('#afegirEquip .introJugador');
  let llistaJugadors = {};
  let equip = {};
  equip['nom'] = document.getElementById('nomEquip').value;
  equip['entrenador'] = document.getElementById('nomEntrenador').value;
  equip['abrevi'] = document.getElementById('abreviEquip').value; 
  for (jugador of llistaJugadorsForm){
    llistaJugadors[jugador.querySelector('.dorsal').value] = [jugador.querySelector('.jugador').value, false];
  }
  equip['jugadors'] = llistaJugadors;
  emmagatzematgeEquips.push(equip);
  dialogAfegirEquip.close();
  dialogAfegirEquip.innerHTML = htmlDialogCreaEquip;
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
    </md-fab>`;
    graellaEquips.appendChild(nouElement);
  }
}

//Modificació d'equips ja creats:
function generaDialogEquip(num){
  let equipsDesats = localStorage.equips===undefined?[]:JSON.parse(localStorage.equips);
  let equip = equipsDesats[num];

  if ( equip.nom !== document.getElementById('nomEquipEditar').value){
    dialogEditarEquip.innerHTML = htmlDialogEditaEquip;
    
    let botoAfegirJugador = document.querySelector('#editarEquip #botoAfegirNouJugador');
    let llistaJugadors = document.querySelector('#editarEquip #form-editar');
    let botoDesaEquip = document.querySelector('#editarEquip #accept');
    
    botoDesaEquip.setAttribute("onclick", "actualitzaEquip("+num+")");
    dialogEditarEquip.querySelector('#nomEquipEditar').value = equip.nom;
    dialogEditarEquip.querySelector('#abreviEquipEditar').value = equip.abrevi;
    dialogEditarEquip.querySelector('#nomEntrenadorEditar').value = equip.entrenador;
    for (jugador in equip.jugadors){
      //console.log (jugador[0] + " - " + jugador + " - " + equip.jugadors[jugador][0] + " - " + equip.jugadors[jugador][1])
      let nouElement = document.createElement('div');
      //nouElement.id = 'introJugador';
      nouElement.classList.add('flex', 'row', 'introJugador');
      nouElement.innerHTML = `<md-outlined-text-field class="dorsal" label="Dor." value="`+jugador+`" placeholder="00" type="text" minlength="1" pattern="\\d+" oninput="validarDorsal(this)">
      </md-outlined-text-field>
      <md-outlined-text-field class="jugador" label="Jugador" value="`+equip.jugadors[jugador][0]+`" placeholder="Nom Jugador" type="text" minlength="1" oninput="validarNomPropi(this)">
      </md-outlined-text-field>
      <md-checkbox touch-target="wrapper" class="seleccionat" onchange="limitarCheckboxes(this)" ${equip.jugadors[jugador][1]?'checked':''}></md-checkbox>`;
      llistaJugadors.insertBefore(nouElement, botoAfegirJugador);
    }
  }
  dialogEditarEquip.show();
}

//Actualitzar dades que s'han modificat de l'equip
function actualitzaEquip(num){
  let llistaJugadorsForm = document.querySelectorAll('#editarEquip .introJugador');
  let llistaJugadors = {};
  let equip = {};
  equip['nom'] = document.getElementById('nomEquipEditar').value;
  equip['entrenador'] = document.getElementById('nomEntrenadorEditar').value;
  equip['abrevi'] = document.getElementById('abreviEquipEditar').value;
  for (let [index, jugador] of Object.entries(llistaJugadorsForm)){
    llistaJugadors[jugador.querySelector('.dorsal').value] = [jugador.querySelector('.jugador').value,jugador.querySelector('.jugador').nextElementSibling.checked];
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
//LListes d'equips per als desplegables
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
  };
  //actualitzaNomEquips()
}

//En seleccionar l'equip, generem la llista de seleccionats per mostrar els jugadors sobre el camp
function seleccioEquips(num){
  let equipTemporal = document.getElementById(num==0?'equipLocal':'equipVisitant').value;
  let counter = 0;
  equipsSeleccionats[num] = emmagatzematgeEquips[equipTemporal];
  for (let [index, jugador] of Object.entries(equipsSeleccionats[num].jugadors)){
    if (equipsSeleccionats[num].jugadors[index][1]){
      document.querySelectorAll('#alineacio'+ num+' md-list-item')[counter].children[0].innerHTML = jugador[0];
      document.querySelectorAll('#alineacio'+ num+' md-list-item')[counter].children[1].innerHTML = index;
      counter += 1;
    }
  }
  console.log('COUNTER: '+ counter);
  if (counter<11){
    generaDialogEquip(equipTemporal);
    alert('Recorda a afegir el 11 inicial!');
  }
  document.getElementById('buttonAccio'+num).disabled = false;
  document.getElementById('selectAccioEquip'+num).nextElementSibling.innerHTML = equipsSeleccionats[num].nom;
  document.getElementById('entrenador'+num).innerHTML = equipsSeleccionats[num].entrenador;
  jugadorsAccio(num);
  localStorage[num] = equipTemporal;
  console.log(equipTemporal);
  document.getElementById(num==0?'equip1':'equip2').children[0].innerHTML = JSON.parse(localStorage.equips)[num].nom;
  document.getElementById(num==0?'editarEquip0':'editarEquip1').onclick = function() {generaDialogEquip(document.getElementById(num==0?'equipLocal':'equipVisitant').value)};

}

//Per als Dialogs d'accio llistem els jugadors disponibles sobre el camp i els que no hi son per a possibles canvis
function jugadorsAccio(num){
  equipsSeleccionats[num];
  for (let [index, jugador] of Object.entries(equipsSeleccionats[num].jugadors)){
    console.log(index+ " - " + jugador);
    let nouElement = document.createElement('md-select-option');
    nouElement.setAttribute('value', index);
    nouElement.innerHTML = index + " - " + jugador[0];
    nouElement.classList.add(`llistaJugadorsEquip${num}`);
    if(num!==0){
      nouElement.classList.add('amaga');
    }
    
    if(equipsSeleccionats[num].jugadors[index][1]){
      document.getElementById('selectJugador1').appendChild(nouElement);
    } else{
      document.getElementById('selectJugador2').appendChild(nouElement);
    }
  }
}

//les llistes tenen els jugadors dels dos equips, mostrem només els del equip que fa l'acció
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

//Obtenir el XML amb les dasdes de vMix
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

//Detectem quins elements del projecte de vMix son grafismes per mostrar al select
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

//Desem els grafismes sel·leccionats
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
temporalGrafismes['moscaPartit'] = temp[5].value;   
grafismesSeleccionats[5] = temp[5].value;
localStorage.vmix = JSON.stringify(temporalGrafismes);
}

function actualitzaNomEquips(){
  const inputs = dadesVmix.querySelectorAll("input");
  //filtrem els grafismes que contenen marcador
  var inputsGT = Array.from(inputs).filter(input => input.querySelector('text[name="Team1.Text"]'));
  const url = `http://${ipVmix}/api`;
  for(marcador in inputsGT){
    let url1 = ''+url+'/?Function=SetText&Input='+inputsGT[marcador].getAttribute('key').replace(/ /g, '%20')+'&Value='+equipsSeleccionats[0].abrevi+'&SelectedName=Team1.Text';
    let url2 = ''+url+'/?Function=SetText&Input='+inputsGT[marcador].getAttribute('key').replace(/ /g, '%20')+'&Value='+equipsSeleccionats[1].abrevi+'&SelectedName=Team2.Text'; 
    fetch(url1);
    fetch(url2);
  }
  var inputsGT2 = Array.from(inputs).filter(input => input.querySelector('text[name="TeamName1.Text"]'));
  for(marcador in inputsGT2){
    console.log(inputsGT2[marcador]);
    let url1 = ''+url+'/?Function=SetText&Input='+inputsGT2[marcador].getAttribute('key').replace(/ /g, '%20')+'&Value='+equipsSeleccionats[0].nom+'&SelectedName=TeamName1.Text';
    let url2 = ''+url+'/?Function=SetText&Input='+inputsGT2[marcador].getAttribute('key').replace(/ /g, '%20')+'&Value='+equipsSeleccionats[1].nom+'&SelectedName=TeamName2.Text'; 
    fetch(url1);
    fetch(url2);
  }
}

function actualitzaMarcadors(gols0, gols1){
  const inputs = dadesVmix.querySelectorAll("input");
  //filtrem els grafismes que contenen marcador
  const inputsGT = Array.from(inputs).filter(input => input.querySelector('text[name="Score2.Text"]'));
  const url = `http://${ipVmix}/api`;
  for(marcador in inputsGT){
    let url1 = ''+url+'/?Function=SetText&Input='+inputsGT[marcador].getAttribute('key').replace(/ /g, '%20')+'&Value='+gols0+'&SelectedName=Score1.Text';
    let url2 = ''+url+'/?Function=SetText&Input='+inputsGT[marcador].getAttribute('key').replace(/ /g, '%20')+'&Value='+gols1+'&SelectedName=Score2.Text'; 
    fetch(url1);
    fetch(url2);
  }
}

// ACCIONS DIALOG:

// Validació de noms propis
function validarNomPropi(input) {
  const regex = /^[A-ZÀ-Ú][a-zà-ú']+(\s[A-ZÀ-Ú][a-zà-ú']+)*$/;
  if (!regex.test(input.value)) {
    input.setCustomValidity('Nom propi no vàlid');
  } else {
    input.setCustomValidity('');
  }
}

// Validació que "dorsal" sigui un número
function validarDorsal(input) {
  if (isNaN(input.value) || input.value <= 0) {
    input.setCustomValidity('El dorsal ha de ser un nombre positiu.');
  } else {
    input.setCustomValidity('');
  }
}

// Limitar els md-checkbox a un màxim de 11 seleccionats
//Funcio copiada d'StackOverflow
function limitarCheckboxes(checkbox) {
  const checkboxes = document.querySelectorAll('.seleccionat');
  const seleccionats = Array.from(checkboxes).filter(cb => cb.checked);
  if (seleccionats.length > 11) {
    checkbox.checked = false;
    alert('Només pots seleccionar un màxim d’11 jugadors.');
  }
}

//Accions per modificar el dialog d'afegir acció
function presetGol(){
  accio='gol';
  document.getElementById('selectJugador2').classList.contains('amaga')?"":document.getElementById('selectJugador2').classList.add('amaga');
  document.querySelectorAll('.selectTargeta').forEach(element => {
    element.classList.contains('amaga')?"":element.classList.add('amaga');
  });
}

function presetTargeta(){
  accio='targeta';
  document.getElementById('selectJugador2').classList.contains('amaga')?"":document.getElementById('selectJugador2').classList.add('amaga');
  document.querySelectorAll('.selectTargeta').forEach(element => {
    element.classList.contains('amaga')?element.classList.remove('amaga'):"";
  });
}

function presetCanvi(){
  accio='canvi';
  document.getElementById('selectJugador2').classList.contains('amaga')?document.getElementById('selectJugador2').classList.remove('amaga'):"";
  document.querySelectorAll('.selectTargeta').forEach(element => {
    element.classList.contains('amaga')?"":element.classList.add('amaga');
  });
}

function presetLesio(){
  accio='lesio';
}

//Desem les dades de l'accio per al registre, llencem grafisme i actualitzem historic del partit
function desaAccio(){
  let accioTemp = {};
  let accionsDesades = localStorage.accions===undefined?[]:JSON.parse(localStorage.accions);
  let dobleTargeta = false;
  accioTemp.timecode = currentTime;
  accioTemp.equipAccio = document.getElementById('selectAccioEquip0').checked?'0':'1';
  accioTemp.jugador0 = document.getElementById('selectJugador1').value;
  accionsDesades.forEach(element => {
    accio == 'targeta' && element.equipAccio == accioTemp.equipAccio && element.jugador0 == accioTemp.jugador0?dobleTargeta=true:"";
    //console.log(dobleTargeta);
  });
  accio=accio=='targeta'?dobleTargeta?'vermella':document.getElementById('selectTargetaGroga').checked?'groga':'vermella':accio;
  accioTemp.tipus = accio;
  accioTemp.jugador1 = document.getElementById('selectJugador2').value;
  accionsDesades.push(accioTemp);
  localStorage.accions = JSON.stringify(accionsDesades);

  llencaGrafisme();
  generaGraellaResum();
  window.location.reload();
}

function accioCanvi(){
  let equip = equipsSeleccionats[document.getElementById('selectAccioEquip0').checked?'0':'1'];
  let jugadorOut = document.getElementById('selectJugador1').value;
  let jugadorIn = document.getElementById('selectJugador2').value;
  equip.jugadors[jugadorOut][1] = false;
  equip.jugadors[jugadorIn][1] = true;
  localStorage.equips = JSON.stringify(emmagatzematgeEquips);
}

function accioTargeta(){
  targetes[document.getElementById('selectAccioEquip0').checked?'0':'1'][document.getElementById('selectJugador1').value] +=1
}

async function llencaGrafisme(){
  const url = `http://${ipVmix}/api`;
  let inputGrafisme;
  let equip = equipsSeleccionats[document.getElementById('selectAccioEquip0').checked?'0':'1'];
  let abrevi = equip.abrevi;
  let equipNom = equip.nom;
  let jugadorOut = equip.jugadors[document.getElementById('selectJugador1').value][0];
  let url1, url2, url3, url4, url5;
  switch(accio){
    case 'gol':
      break;
      case 'groga':
        inputGrafisme = grafismesSeleccionats[2];
        url1 = ''+url+'/?Function=SetText&Input='+inputGrafisme.replace(/ /g, '%20')+'&Value='+jugadorOut.replace(/ /g, '%20')+'&SelectedName=Player.Text';
        url2 = ''+url+'/?Function=SetText&Input='+inputGrafisme.replace(/ /g, '%20')+'&Value='+equipNom.replace(/ /g, '%20')+'&SelectedName=TeamName.Text';
        url3 = ''+url+'/?Function=SetImageVisibleOn&Input='+inputGrafisme.replace(/ /g, '%20')+'&SelectedName=Yellow.Source';
        url4 = ''+url+'/?Function=SetImageVisibleOff&Input='+inputGrafisme.replace(/ /g, '%20')+'&SelectedName=Red.Source';
        url5 = ''+url+'/?Function=OverlayInput2&Input='+inputGrafisme.replace(/ /g, '%20');
        fetch(url3);
        fetch(url4);
        fetch(url1);
        fetch(url2);
        setTimeout(fetch(url5), 5000);
        presetGol();
      break;
      case 'vermella':
        inputGrafisme = grafismesSeleccionats[2];
        url1 = ''+url+'/?Function=SetText&Input='+inputGrafisme.replace(/ /g, '%20')+'&Value='+jugadorOut.replace(/ /g, '%20')+'&SelectedName=Player.Text';
        url2 = ''+url+'/?Function=SetText&Input='+inputGrafisme.replace(/ /g, '%20')+'&Value='+equipNom.replace(/ /g, '%20')+'&SelectedName=TeamName.Text';
        url3 = ''+url+'/?Function=SetImageVisibleOff&Input='+inputGrafisme.replace(/ /g, '%20')+'&SelectedName=Yellow.Source';
        url4 = ''+url+'/?Function=SetImageVisibleOn&Input='+inputGrafisme.replace(/ /g, '%20')+'&SelectedName=Red.Source';
        url5 = ''+url+'/?Function=OverlayInput2&Input='+inputGrafisme.replace(/ /g, '%20');
        fetch(url3);
        fetch(url4);
        fetch(url1);
        fetch(url2);
        setTimeout(fetch(url5), 5000);
        presetGol();
        break
        case 'canvi':    
        let jugadorIn = equip.jugadors[document.getElementById('selectJugador2').value][0];
        inputGrafisme = grafismesSeleccionats[3]; 
      url1 = ''+url+'/?Function=SetText&Input='+inputGrafisme.replace(/ /g, '%20')+'&Value='+jugadorIn.replace(/ /g, '%20')+'&SelectedName=On%20Name.Text';
      url2 = ''+url+'/?Function=SetText&Input='+inputGrafisme.replace(/ /g, '%20')+'&Value='+jugadorOut.replace(/ /g, '%20')+'&SelectedName=Off%20Name.Text';
      url3 = ''+url+'/?Function=SetText&Input='+inputGrafisme.replace(/ /g, '%20')+'&Value='+abrevi.replace(/ /g, '%20')+'&SelectedName=Team.Text';
      url4 = ''+url+'/?Function=OverlayInput2&Input='+inputGrafisme.replace(/ /g, '%20');
      fetch(url1);
      fetch(url2);
      fetch(url3);
      fetch(url4);
      accioCanvi();
      presetGol();
      //window.location.reload();

      /** 
      try {
        console.log(url1)       
        const resposta = await fetch(url1);
        if (!resposta.ok) {
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
      alert('Grafisme Targeta actualitzat!');*/
      break;
    case 'lesio':
      break;
  }
}

function generaIcones(accio){
  switch(accio){
    case 'gol':
      return '⚽'
    case 'groga':
      return '🟨'
    case 'vermella':
      return '🟥'
    case 'canvi':
      return '🔃'
    case 'lesio':
      return'🚑'
  }
}

//Actualització graella de resum d'accions
function generaGraellaResum(){
  let accionsDesades = localStorage.accions===undefined?[]:JSON.parse(localStorage.accions);
  let graellaResum = document.getElementById('graellaResum');
  graellaResum.innerHTML = "";
  //aprofitem aquesta funcio per recomptar gols i actualitzar el HTML
  let golsLocal = 0;
  let golsVisitant = 0;
  for (let[index, accions] of Object.entries(accionsDesades)){
    accions.tipus=='gol'?accions.equipAccio==0?golsLocal +=1:golsVisitant +=1:"";
    let nouElement = document.createElement('li');
    nouElement.id = 'accio_'+index;
    nouElement.innerHTML = `
    <span class="timecode">${accions.timecode}'</span>
    <span class="icona">${accions.equipAccio==0?generaIcones(accions.tipus):""}</span>
    <span class="jugador">${accions.equipAccio==0?accions.tipus=='canvi'?equipsSeleccionats[0].jugadors[accions.jugador0][0] + " > "+equipsSeleccionats[0].jugadors[accions.jugador1][0]:equipsSeleccionats[0].jugadors[accions.jugador0][0]:""}</span>
    <span class="resultat">${golsLocal}-${golsVisitant}</span>
    <span class="icona">${accions.equipAccio==1?generaIcones(accions.tipus):""}</span>
    <span class="jugador">${accions.equipAccio==1?accions.tipus=='canvi'?equipsSeleccionats[1].jugadors[accions.jugador0][0] + " > "+equipsSeleccionats[1].jugadors[accions.jugador1][0]:equipsSeleccionats[1].jugadors[accions.jugador0][0]:""}</span>
    <md-filled-button onclick="editaAccio('${index}')"><md-icon slot="icon" >Edit</md-icon>edita</md-filled-button>`;
    graellaResum.appendChild(nouElement);
    //Si un jugador es lesiona o és expulsat el deshabilitem dels seleccionables
    accions.tipus=='vermella'?document.querySelector('#selectJugador1 [value="'+accions.jugador0+'"]').disabled = true:"";
  }
  let resultat = document.querySelectorAll('#resultat');
  resultat.forEach( element => {
    element.innerHTML = golsLocal +" - "+golsVisitant;
  });
  dadesVmix==undefined?"":actualitzaMarcadors(golsLocal, golsVisitant);
}

function editaAccio(num){
  let accionsDesades = localStorage.accions===undefined?[]:JSON.parse(localStorage.accions);
  let accioTemp = accionsDesades[num];
  let pestanya = document.getElementById('tabsAccio');
  switch(accioTemp.tipus){
    case 'gol':
      pestanya.children[0].click();
    break
    case 'groga':
    case 'vermella':
      pestanya.children[1].click();
    break
    case 'canvi':
      pestanya.children[2].click();
    break
    case 'lesio':
      pestanya.children[3].click();
    break
  }
  document.getElementById(accioTemp.equipAccio==0?'selectAccioEquip0':'selectAccioEquip1').checked = true;
  document.getElementById('selectJugador1').value = accioTemp.jugador0;
  accioTemp.tipus=='groga'?(document.getElementById('selectJugador2').value = accioTemp.jugador1,document.getElementById('selectTargetaGroga').checked=true):'';
  accioTemp.tipus=='vermella'?(document.getElementById('selectJugador2').value = accioTemp.jugador1,document.getElementById('selectTargetaVermella').checked=true):'';
  dialog.querySelector('[type=submit]').onclick=function(){corregeixAccio(num)};
  dialog.show();
}

function corregeixAccio(num){
  let accionsDesades = localStorage.accions===undefined?[]:JSON.parse(localStorage.accions);
  let accioTemp = accionsDesades[num];
  let accionsAnteriors = accionsDesades.splice(0,num);
  console.log(accioTemp);
  let dobleTargeta = false;
  accioTemp.equipAccio = document.getElementById('selectAccioEquip0').checked?'0':'1';
  accioTemp.jugador0 = document.getElementById('selectJugador1').value;
  accionsAnteriors.forEach(element => {
    accio == 'targeta' && element.equipAccio == accioTemp.equipAccio && element.jugador0 == accioTemp.jugador0?dobleTargeta=true:"";
    //console.log(dobleTargeta);
  });
  accio=accio=='targeta'?dobleTargeta?'vermella':document.getElementById('selectTargetaGroga').checked?'groga':'vermella':accio;
  accioTemp.tipus = accio;
  accioTemp.jugador1 = document.getElementById('selectJugador2').value;
  accionsDesades = accionsAnteriors.concat(accionsDesades);
  accionsDesades[num]=accioTemp;
  localStorage.accions = JSON.stringify(accionsDesades);
  generaGraellaResum();
}

function exportVmix(fileName){
  let sortida = {};
  sortida = localStorage.vmix;
  var textToSaveAsBlob = new Blob([sortida], {
    type: "text/plain"
  });
  var textToSaveAsURL=window.URL.createObjectURL(textToSaveAsBlob);
  var downloadLink = document.createElement("a");
  downloadLink.download = fileName;
  downloadLink.innerHTML = "Download File";
  downloadLink.href = textToSaveAsURL;
  downloadLink.onclick = function () {
    document.body.removeChild(event.target);
  };
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

const JSONToFile = (obj, filename) =>
  writeFileSync(`${filename}.json`, JSON.stringify(obj, null, 2));



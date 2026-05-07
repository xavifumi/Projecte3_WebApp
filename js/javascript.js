
//Variables DOM
var stTimer = document.getElementById('play');
var psTimer = document.getElementById('pause');
var timerDisplay = document.querySelectorAll(`[data-chronometer]`);
var pageMain = document.getElementById('pageMain');
var pageSetup = document.getElementById('pageSetup');
var pageResum = document.getElementById('pageResum');
var titolPagina = document.getElementById('titolPagina');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const imageInputEditar = document.getElementById('imageInputEditar');
const previewImageEditar = document.getElementById('previewImageEditar');
//const uploadIcon = document.getElementById('uploadIcon');
const uploadContainer = document.getElementById('uploadContainer');
const uploadContainerEditar = document.getElementById('uploadContainerEditar');

let imatgeSeleccionada = null; // Aquí desarem el fitxer seleccionat o la seva URL
let imatgeSeleccionadaFilename = "";

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
var emmagatzematgeEquips = JSON.parse(localStorage.getItem("equips")) || []; //Dades equips desats
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
var partit = {
  equipLocal: null,
  equipVisitant: null,
  golsLocal: 0,
  golsVisitant: 0,
  accions: [],
  temps: 0
};
var estatApp = {
  equips: [],
  partit: {
    equipLocal: null,
    equipVisitant: null,
    golsLocal: 0,
    golsVisitant: 0,
    accions: [],
    temps: 0
  }
};

function obreDialogNouEquip() {
  imatgeSeleccionada = null;
  imatgeSeleccionadaFilename = "";
  previewImage.src = "";
  previewImage.style.display = "none";
  document.getElementById('form-equip').reset();
  // Netegem jugadors extra si n'hi ha
  const extraPlayers = document.querySelectorAll('#form-equip .introJugador');
  extraPlayers.forEach((p, i) => { if (i > 0) p.remove(); });
  dialogAfegirEquip.show();
}

// Gestió de selector de tipus logo i transformació a base64
if (imageInput) {
  imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      imatgeSeleccionada = e.target.result; // Data URL (Base64)
      previewImage.src = imatgeSeleccionada;
      previewImage.style.display = "block";

      // Guardem el nom del fitxer per a la ruta de vMix
      imatgeSeleccionadaFilename = file.name;
      console.log("Fitxer seleccionat:", file.name);
    };
    reader.readAsDataURL(file);
  });
}

if (imageInputEditar) {
  imageInputEditar.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      imatgeSeleccionada = e.target.result; // Data URL (Base64)
      previewImageEditar.src = imatgeSeleccionada;
      previewImageEditar.style.display = "block";

      imatgeSeleccionadaFilename = file.name;
      console.log("Fitxer seleccionat (Edició):", file.name);
    };
    reader.readAsDataURL(file);
  });
}


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
<div class="abreviatura" slot="headline">
  <md-outlined-text-field id="abreviEquip" label="Abreviatura Equip" type="text" minlength="3" maxlength="4" style="text-transform:uppercase">
  </md-outlined-text-field>

  <div class="image-upload" id="uploadContainer">
    <!-- Aquesta icona es mostrarà si no hi ha imatge -->
    <md-filled-button class="final" onclick="dialogAfegirEquip.show()">Afegeix<md-icon slot="icon">add</md-icon></md-filled-button>
    <!-- Aquesta imatge es mostrarà quan se seleccioni una -->
    <img id="previewImage" class="image-preview" style="display: none;" />
  </div>
</div>
<!-- Input per seleccionar  imatge (ocult) -->
<input type="file" id="imageInput" accept="image/*" />

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


function carregarEstat() {
  const equips = localStorage.getItem("equips");
  const partit = localStorage.getItem("partit");

  estatApp.equips = equips ? JSON.parse(equips) : [];
  estatApp.partit = partit ? JSON.parse(partit) : estatApp.partit;
}

function guardarEstat() {
  localStorage.setItem("equips", JSON.stringify(estatApp.equips));
  localStorage.setItem("partit", JSON.stringify(estatApp.partit));
}

function carregarPartit() {
  const dades = localStorage.getItem("partit");
  if (dades) {
    partit = JSON.parse(dades);
  }
}

function guardarPartit() {
  localStorage.setItem("partit", JSON.stringify(partit));
}

function carregarEquips() {
  emmagatzematgeEquips = JSON.parse(localStorage.getItem("equips")) || [];
}

function guardarEquips() {
  localStorage.setItem("equips", JSON.stringify(emmagatzematgeEquips));
}

function afegirEquipDB(equip) {
  emmagatzematgeEquips.push(equip);
  guardarEquips();
}

function actualitzaEquipDB(index, equip) {
  emmagatzematgeEquips[index] = equip;
  guardarEquips();
}

function eliminaEquipDB(index) {
  emmagatzematgeEquips.splice(index, 1);
  guardarEquips();
}




//Accions a realitzar en carregar la pàgina:
document.addEventListener("DOMContentLoaded", (event) => {
  carregarEquips();
  carregarPartit();
  generaGraellaEquips();
  llistaEquips();

  //Dades vMix
  const vmixConfig = localStorage.getItem('vmix') === null ? { ip: "", pathLogos: "" } : JSON.parse(localStorage.getItem('vmix'));
  ipVmix = vmixConfig.ip;
  document.getElementById('inputIpVmix').value = ipVmix;
  document.getElementById('inputPathLogos').value = vmixConfig.pathLogos || "";

  if (localStorage.getItem('vmix') !== null) {
    const vmixData = JSON.parse(localStorage.getItem('vmix'));
    grafismesSeleccionats[0] = vmixData.grafismeAlineacio;
    grafismesSeleccionats[1] = vmixData.grafismeGol;
    grafismesSeleccionats[2] = vmixData.grafismeTargeta;
    grafismesSeleccionats[3] = vmixData.grafismeCanvi;
    grafismesSeleccionats[4] = vmixData.grafismeFinal;
    grafismesSeleccionats[5] = vmixData.moscaPartit;
  }

  // Inicialització de la interfície
  generaGraellaEquips();
  llistaEquips();

  //Resum i dades per a les llistes de selecció.
  resumPartit = localStorage.getItem('accions') === null ? [] : JSON.parse(localStorage.getItem('accions'));
  savedTime = localStorage.getItem('savedTime') === null ? "" : JSON.parse(localStorage.getItem('savedTime'));
  running = JSON.parse(localStorage.getItem('running')) === 1 ? (startTimer(), psTimer.style.display = 'inline-flex', stTimer.style.display = 'none') : "";
  if (ipVmix && ipVmix.trim() !== "") {
    obtenirDadesVmix(ipVmix);
  }

  if (partit.equipLocal !== null) {
    document.getElementById('equipLocal').value = String(partit.equipLocal);
    seleccioEquips(0);
  }

  if (partit.equipVisitant !== null) {
    document.getElementById('equipVisitant').value = String(partit.equipVisitant);
    seleccioEquips(1);
  }

  generaGraellaResum();
  if (uploadContainer && imageInput) {
    uploadContainer.addEventListener('click', () => {
      imageInput.click();
    });
  }

  if (uploadContainerEditar && imageInputEditar) {
    uploadContainerEditar.addEventListener('click', () => {
      imageInputEditar.click();
    });
  }
});



//aquest codi intenta que no es tanquin els dialog en clicar fora del quadre o algun altre error per defecte.
if (typeof dialogAfegirEquip !== 'undefined') dialogAfegirEquip.addEventListener('cancel', (e) => e.preventDefault());
if (typeof dialogEditarEquip !== 'undefined') dialogEditarEquip.addEventListener('cancel', (e) => e.preventDefault());


//Gestió del Comptador de temps que ens serveix també per enregistrar els temps de les accions.
function startTimer() {
  if (!running) {
    // Validem que tots dos equips tinguin 11 jugadors seleccionats
    const count0 = equipsSeleccionats[0]
      ? Object.values(equipsSeleccionats[0].jugadors).filter(j => j[1]).length
      : 0;
    const count1 = equipsSeleccionats[1]
      ? Object.values(equipsSeleccionats[1].jugadors).filter(j => j[1]).length
      : 0;

    if (!equipsSeleccionats[0] || !equipsSeleccionats[1]) {
      alert('Cal seleccionar els dos equips per iniciar el partit!');
      return;
    }
    if (count0 < 11 || count1 < 11) {
      alert(`Cal tenir 11 jugadors seleccionats per cada equip per iniciar el partit!\n${equipsSeleccionats[0].nom}: ${count0}/11\n${equipsSeleccionats[1].nom}: ${count1}/11`);
      return;
    }

    startTime = new Date().getTime();
    tInterval = setInterval(getShowTime, 1000);
    paused = 0;
    running = 1;
    localStorage.running = JSON.stringify(running);
    stTimer.style.display = 'none';
    psTimer.style.display = 'inline-flex';
    const toggleBtn = document.getElementById('togglePartBtn');
    if (toggleBtn) toggleBtn.disabled = true;

    //Activem també el timer de vMix
    if (ipVmix && grafismesSeleccionats[5]) {
      const moscaKey = encodeURIComponent(grafismesSeleccionats[5]);
      enviarComandesVmix([
        `http://${ipVmix}/api/?Function=StartCountdown&Input=${moscaKey}&SelectedName=Time.Text`,
        `http://${ipVmix}/api/?Function=OverlayInput1In&Input=${moscaKey}`
      ]);
    }
    // Deshabilitem els selectors d'equip per evitar canvis durant el partit
    const equipLocalSel = document.getElementById('equipLocal');
    const equipVisitantSel = document.getElementById('equipVisitant');
    if (equipLocalSel) equipLocalSel.disabled = true;
    if (equipVisitantSel) equipVisitantSel.disabled = true;

    actualitzaNomEquips();
  }
}

function pauseTimer() {
  if (!difference) {
  } else if (!paused) {
    clearInterval(tInterval);
    savedTime = difference;
    paused = 1;
    running = 0;
    localStorage.running = JSON.stringify(running);
    const toggleBtn = document.getElementById('togglePartBtn');
    if (toggleBtn) toggleBtn.disabled = false;
  } else {
    //startTimer();
  }
}
//Reset complete UI to start a new match.
function resetNouPartit() {
  resetTimer();
  partit.golsLocal = 0;
  partit.golsVisitant = 0;
  partit.accions = [];
  resumPartit = [];
  localStorage.setItem('accions', '[]');

  if (!primeraPart) togglePart();

  document.getElementById('resultat').innerHTML = '<span>0 - 0</span>';
  for (let timer of timerDisplay) {
    timer.innerHTML = '00:00';
  }

  stTimer.style.display = 'inline-flex';
  psTimer.style.display = 'none';
  const toggleBtn = document.getElementById('togglePartBtn');
  if (toggleBtn) toggleBtn.disabled = false;

  guardarPartit();
  generaGraellaResum();

  // Reactivem els selectors d'equip per al nou partit
  const equipLocalSel = document.getElementById('equipLocal');
  const equipVisitantSel = document.getElementById('equipVisitant');
  if (equipLocalSel) equipLocalSel.disabled = false;
  if (equipVisitantSel) equipVisitantSel.disabled = false;
}


function resetTimer() {
  clearInterval(tInterval);
  savedTime = 0;
  difference = 0;
  paused = 0;
  running = 0;
  localStorage.running = JSON.stringify(running);
  localStorage.setItem('savedTime', '0');

  const toggleBtn = document.getElementById('togglePartBtn');
  if (toggleBtn) toggleBtn.disabled = false;
}

function togglePart() {
  primeraPart = !primeraPart;
  let icon = document.querySelector('#togglePartBtn md-icon');
  if (icon) icon.innerText = primeraPart ? 'looks_one' : 'looks_two';
}

function getShowTime() {
  updatedTime = new Date().getTime();
  if (savedTime) {
    difference = (updatedTime - startTime) + savedTime;
  } else {
    difference = updatedTime - startTime;
  }
  var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((difference % (1000 * 60)) / 1000);
  currentTime = minutes;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  partit.temps = difference;
  guardarPartit();
  for (let timer of timerDisplay) {
    timer.innerHTML = minutes + ':' + seconds;
  }
  //Aturem el timer al minut 45
  if (primeraPart && minutes > 44) {
    pauseTimer();
    stTimer.style.display = 'inline-flex';
    psTimer.style.display = 'none';
    togglePart();
    if (ipVmix) {
      enviarComandesVmix([`http://${ipVmix}/api/?Function=OverlayInput1Out`]);
    }
  }
}




// Pagina SETUP ************************************************************************************************************
//Introducció de dades vMix, Jugadors i creacio de la graella de la base de dades d'equips.*********************************


//Obtenir el XML amb les dasdes de vMix
async function obtenirDadesVmix(ip) {
  if (!ip) {
    alert("Si us plau, introdueix una IP de vMix válida.");
    return;
  }
  ipVmix = ip; // Actualitzem la global
  const url = `http://${ipVmix}/api`;
  console.log("Intentant connectar amb vMix XML API:", url);
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Error: ${resposta.status}`);
    const textXML = await resposta.text();
    dadesVmix = new DOMParser().parseFromString(textXML, "application/xml");
  } catch (error) {
    console.error("Error vMix:", error);
    alert("No s'ha pogut connectar amb vMix a " + ipVmix);
    return;
  }
  const inputs = Array.from(dadesVmix.querySelectorAll("input"));
  llistaGrafismes = inputs.map(i => ({ key: i.getAttribute("key"), title: i.getAttribute("title") || i.getAttribute("number") }));
  afegirOpcionsGrafismes(llistaGrafismes);
}

// Helper per enviar comandes a vMix amb un petit retard per evitar saturació
async function enviarComandesVmix(urls) {
  for (const u of urls) {
    try {
      console.log("vMix API Command:", u);
      await fetch(u);
      await new Promise(r => setTimeout(r, 50)); // Retard de 50ms entre comandes
    } catch (e) {
      console.error("Error enviant comanda vMix:", u, e);
    }
  }
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
function desaDadesVmix() {
  let temporalGrafismes = {};
  temporalGrafismes['ip'] = ipVmix;
  temporalGrafismes['pathLogos'] = document.getElementById('inputPathLogos').value;
  let temp = document.querySelectorAll('#configuracioEscenes ul li md-outlined-select');
  temporalGrafismes['grafismeAlineacio'] = temp[0].value;
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
  var now = new Date();
  var todayString = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  exportVmix(`${todayString}_dadesVmix`);
}

//Jugadors i Equips:

function afegirJugador(desti) {

  let llistaJugadors = document.getElementById(desti);

  if (!llistaJugadors) {
    console.error("Formulari no trobat:", desti);
    return;
  }

  let nouElement = document.createElement('div');
  nouElement.classList.add('flex', 'row', 'introJugador');

  nouElement.innerHTML = `
    <md-outlined-text-field class="dorsal" label="Dor." placeholder="00" type="text" minlength="1" pattern="\\d+" oninput="validarDorsal(this)"></md-outlined-text-field>
    <md-outlined-text-field class="jugador" label="Jugador" placeholder="Nom Jugador" type="text" minlength="2" oninput="validarNomPropi(this)"></md-outlined-text-field>
    <md-checkbox touch-target="wrapper" class="seleccionat" onchange="limitarCheckboxes(this)"></md-checkbox>
  `;

  llistaJugadors.appendChild(nouElement);
}

function desaEquip() {
  let llistaJugadorsForm = document.querySelectorAll('#afegirEquip .introJugador');
  let llistaJugadors = {};
  let equip = {};
  let dialog = document.getElementById('afegirEquip');

  equip.nom = dialog.querySelector('#nomEquip').value;
  equip.entrenador = dialog.querySelector('#nomEntrenador').value;
  equip.abrevi = dialog.querySelector('#abreviEquip').value;

  // Generem la ruta de vMix automàticament si tenim una imatge seleccionada
  const basePath = document.getElementById('inputPathLogos').value || "";
  equip.logoPath = imatgeSeleccionadaFilename ? (basePath + imatgeSeleccionadaFilename) : "";

  // Només guardar la URL completa
  equip.logo = imatgeSeleccionada || null;

  for (let jugador of llistaJugadorsForm) {
    let dorsal = jugador.querySelector('.dorsal').value;
    let nomJugador = jugador.querySelector('.jugador').value;
    if (dorsal && nomJugador) {
      let isSelected = jugador.querySelector('.seleccionat') ? jugador.querySelector('.seleccionat').checked : false;
      llistaJugadors[dorsal] = [nomJugador, isSelected];
    }
  }

  equip.jugadors = llistaJugadors;

  // Guardem a la base de dades
  afegirEquipDB(equip);

  // Actualitzem UI
  generaGraellaEquips();
  llistaEquips();
  jugadorsAccio();

  if (dialog) dialog.close();
}

function eliminaEquip(index) {

  if (!confirm("Eliminar aquest equip?")) return;
  eliminaEquipDB(index);
  generaGraellaEquips();
  llistaEquips();

}


// Genera la graella d’equips a la pàgina de setup
function generaGraellaEquips() {
  // Recupem equips desats
  const equipsDesats = emmagatzematgeEquips;
  const graellaEquips = document.getElementById('graellaEquips');
  graellaEquips.innerHTML = "";

  equipsDesats.forEach((equip, index) => {
    const nouElement = document.createElement('div');
    nouElement.id = 'tarjaEquip_' + index;
    nouElement.classList.add('tarjaEquip');

    // HTML amb botons d’editar i eliminar
    nouElement.innerHTML = `
      <img src="${equip.logo || ''}" alt="">
      <div class="nomFitxaEquip" style="flex: 1;">
        <h4>${equip.nom}</h4>
        <p>${equip.entrenador}</p>
      </div>
      <div class="accionsHistorial">
        <md-icon-button id="editEquip${index}" aria-label="Edit">
          <md-icon>edit</md-icon>
        </md-icon-button>
        <md-icon-button id="deleteEquip${index}" aria-label="Delete">
          <md-icon>delete</md-icon>
        </md-icon-button>
      </div>
    `;

    graellaEquips.appendChild(nouElement);

    // Assignem events directament
    document.getElementById(`editEquip${index}`).onclick = () => generaDialogEquip(index);
    document.getElementById(`deleteEquip${index}`).onclick = () => eliminaEquip(index);
  });
}

// Seleccionem l’equip des del desplegable
function seleccioEquips(numInput) {
  const num = Number(numInput);
  const select = document.getElementById(num === 0 ? 'equipLocal' : 'equipVisitant');
  if (!select) return;

  const equipIndex = select.value;

  if (equipIndex === "" || equipIndex === null || !emmagatzematgeEquips[equipIndex]) {
    console.log("No valid team selected");
    return;
  }

  equipsSeleccionats[num] = emmagatzematgeEquips[equipIndex];

  // Actualitzem els jugadors seleccionats a la UI
  const items = document.querySelectorAll(`#alineacio${num} md-list-item`);
  // Netegem primer
  items.forEach(item => {
    const headline = item.querySelector('[slot="headline"]');
    const start = item.querySelector('[slot="start"]');
    if (headline) headline.innerHTML = "";
    if (start) start.innerHTML = "";
  });

  let counter = 0;
  for (const [dorsal, jugador] of Object.entries(equipsSeleccionats[num].jugadors)) {
    if (jugador[1]) {
      const line = items[counter];
      if (line) {
        const headline = line.querySelector('[slot="headline"]');
        const start = line.querySelector('[slot="start"]');
        if (headline) headline.innerHTML = jugador[0]; // Nom jugador
        if (start) start.innerHTML = dorsal;      // Dorsal
        counter++;
      }
    }
  }


  // Actualitzem l'estat dels botons i etiquetes amb seguretat
  const buttonAccio = document.getElementById('buttonAccio' + num);
  if (buttonAccio) buttonAccio.disabled = false;

  const radioAccio = document.getElementById('selectAccioEquip' + num);
  if (radioAccio && radioAccio.nextElementSibling) {
    radioAccio.nextElementSibling.innerHTML = equipsSeleccionats[num].nom;
  }

  const entrenadorElement = document.getElementById('entrenador' + num);
  if (entrenadorElement) entrenadorElement.innerHTML = equipsSeleccionats[num].entrenador;

  jugadorsAccio();

  // Guardem l’equip seleccionat al partit
  if (num === 0) {
    partit.equipLocal = equipIndex;
  } else {
    partit.equipVisitant = equipIndex;
  }

  guardarPartit();

  // Actualitzem noms i logos a la pantalla de RESUM
  const resEquip = document.getElementById(num === 0 ? 'equip1' : 'equip2');
  if (resEquip) {
    const logo = `<img src="${equipsSeleccionats[num].logo || ''}" class="logo-resum" style="width:40px; height:40px; object-fit:contain; ${num === 0 ? 'margin-right:15px;' : 'margin-left:15px;'}">`;
    const name = `<span class="alignCenter">${equipsSeleccionats[num].nom}</span>`;
    resEquip.innerHTML = num === 0 ? logo + name : name + logo;
  }

  // Actualitzem logos a la pantalla MAIN
  const logoMain = document.getElementById(num === 0 ? 'logoLocalMain' : 'logoVisitantMain');
  if (logoMain) {
    logoMain.src = equipsSeleccionats[num].logo || '';
    logoMain.style.visibility = equipsSeleccionats[num].logo ? 'visible' : 'hidden';
  }

  // Habilitar el botó d'edició del equip seleccionat
  const editFab = document.getElementById('editarEquip' + num);
  if (editFab) {
    editFab.disabled = false;
    editFab.removeAttribute('disabled');
  }
}

function obreDialogAccio(num) {
  const dialogAccio = document.getElementById('afegirAccio');
  document.getElementById('selectAccioEquip' + num).checked = true;
  filtraJugadorsAccio('llistaJugadorsEquip' + num);

  // Assegurem que el botó de submit del diàleg cridi a desaAccio
  const submitBtn = dialogAccio.querySelector('md-text-button[type="submit"]');
  if (submitBtn) {
    submitBtn.onclick = () => desaAccio();
  }

  dialogAccio.show();
}

function obreDialogEdita(numInput) {
  const num = Number(numInput);
  const selectId = num === 0 ? 'equipLocal' : 'equipVisitant';
  const select = document.getElementById(selectId);
  if (select && select.value !== "") {
    generaDialogEquip(select.value);
  } else {
    alert("Selecciona un equip primer!");
  }
}


//Modificació d'equips ja creats, enviem un argument amb el nombre de l'equip a editar:
function generaDialogEquip(num) {
  let equipsDesats = localStorage.getItem('equips') === null ? [] : JSON.parse(localStorage.getItem('equips'));
  let equip = equipsDesats[num];

  // Sincronitzem la imatge actual per evitar pèrdues al desar
  imatgeSeleccionada = equip.logo || null;

  let llistaJugadors = document.querySelector('#editarEquip #form-editar');
  let botoDesaEquip = document.querySelector('#editarEquip #accept');
  botoDesaEquip.setAttribute("onclick", "actualitzaEquip(" + num + ")");

  dialogEditarEquip.querySelector('#nomEquipEditar').value = equip.nom;
  dialogEditarEquip.querySelector('#abreviEquipEditar').value = equip.abrevi;
  dialogEditarEquip.querySelector('#nomEntrenadorEditar').value = equip.entrenador;

  // Mantenim la referència al path actual per si no es canvia la imatge
  imatgeSeleccionadaFilename = equip.logoPath ? equip.logoPath.split('/').pop().split('\\').pop() : "";

  let existingPlayers = llistaJugadors.querySelectorAll('.introJugador');
  existingPlayers.forEach(p => p.remove());

  for (let jugador in equip.jugadors) {
    let nouElement = document.createElement('div');
    nouElement.classList.add('flex', 'row', 'introJugador');
    nouElement.innerHTML = `<md-outlined-text-field class="dorsal" label="Dor." value="` + jugador + `" placeholder="00" type="text" minlength="1" pattern="\\d+" oninput="validarDorsal(this)">
    </md-outlined-text-field>
    <md-outlined-text-field class="jugador" label="Jugador" value="`+ equip.jugadors[jugador][0] + `" placeholder="Nom Jugador" type="text" minlength="1" oninput="validarNomPropi(this)">
    </md-outlined-text-field>
    <md-checkbox touch-target="wrapper" class="seleccionat" onchange="limitarCheckboxes(this)" ${equip.jugadors[jugador][1] ? 'checked' : ''}></md-checkbox>`;
    llistaJugadors.appendChild(nouElement);
  }

  let preview = dialogEditarEquip.querySelector('#previewImageEditar');
  if (equip.logo) {
    preview.src = equip.logo;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
  dialogEditarEquip.show();
}

//Actualitzar dades que s'han modificat de l'equip al dialog anterior
function actualitzaEquip(num) {
  let llistaJugadorsForm = document.querySelectorAll('#editarEquip .introJugador');
  let llistaJugadors = {};
  let equip = {};
  equip['nom'] = document.getElementById('nomEquipEditar').value;
  equip['entrenador'] = document.getElementById('nomEntrenadorEditar').value;
  equip['abrevi'] = document.getElementById('abreviEquipEditar').value;

  const basePath = document.getElementById('inputPathLogos').value || "";
  equip['logoPath'] = imatgeSeleccionadaFilename ? (basePath + imatgeSeleccionadaFilename) : "";
  equip['logo'] = imatgeSeleccionada;
  for (let [index, jugador] of Object.entries(llistaJugadorsForm)) {
    llistaJugadors[jugador.querySelector('.dorsal').value] = [jugador.querySelector('.jugador').value, jugador.querySelector('.seleccionat').checked];
  }
  equip['jugadors'] = llistaJugadors;
  actualitzaEquipDB(num, equip);
  //Desem, tanquem dialog, etegem graella i la tornem a carregar
  dialogEditarEquip.close();
  document.getElementById('graellaEquips').innerHTML = "";
  generaGraellaEquips();
  llistaEquips();
  jugadorsAccio();
}



// PAG MAIN
//LListes d'equips per als desplegables
function llistaEquips() {

  let llistaEquipLocal = document.getElementById('equipLocal');
  let llistaEquipVisitant = document.getElementById('equipVisitant');

  llistaEquipLocal.innerHTML = "";
  llistaEquipVisitant.innerHTML = "";

  for (let [index, equip] of emmagatzematgeEquips.entries()) {
    const val = String(index);
    const html = `<div slot="headline">${equip.nom}</div>`;

    const optionLocal = document.createElement('md-select-option');
    optionLocal.value = val;
    optionLocal.innerHTML = html;

    const optionVisitant = document.createElement('md-select-option');
    optionVisitant.value = val;
    optionVisitant.innerHTML = html;

    llistaEquipLocal.appendChild(optionLocal);
    llistaEquipVisitant.appendChild(optionVisitant);
  }
}

//En seleccionar l'equip, generem la llista de seleccionats per mostrar els jugadors sobre el camp













//Per als Dialogs d'accio llistem els jugadors disponibles sobre el camp i els que no hi son els desem a un altra llista per a possibles canvis
function jugadorsAccio() {
  const sel1 = document.getElementById('selectJugador1');
  const sel2 = document.getElementById('selectJugador2');
  if (!sel1 || !sel2) return;

  sel1.innerHTML = '';
  sel2.innerHTML = '';

  // Determinem quin equip està seleccionat al radio per saber què amagar
  const radio1 = document.getElementById('selectAccioEquip1');
  const equipActiu = (radio1 && radio1.checked) ? 1 : 0;

  [0, 1].forEach(num => {
    if (equipsSeleccionats[num] && equipsSeleccionats[num].jugadors) {
      for (let [index, jugador] of Object.entries(equipsSeleccionats[num].jugadors)) {
        let nouElement = document.createElement('md-select-option');
        nouElement.setAttribute('value', index);
        nouElement.innerHTML = `<div slot="headline">${index} - ${jugador[0]}</div>`;
        nouElement.classList.add(`llistaJugadorsEquip${num}`);

        // Amaguem si no és l'equip actiu
        if (num !== equipActiu) {
          nouElement.classList.add('amaga');
          nouElement.style.display = 'none'; // Per si amaga no és prou
        }

        if (jugador[1]) {
          sel1.appendChild(nouElement);
        } else {
          sel2.appendChild(nouElement);
        }
      }
    }
  });
}

//les llistes tenen els jugadors dels dos equips, mostrem només els del equip que fa l'acció
function filtraJugadorsAccio(classe) {
  const numActiu = classe === 'llistaJugadorsEquip1' ? 1 : 0;

  // Actualitzem visibilitat de totes les opcions
  const totesLesOpcions = document.querySelectorAll('md-select-option[class*="llistaJugadorsEquip"]');
  totesLesOpcions.forEach(opt => {
    if (opt.classList.contains(classe)) {
      opt.classList.remove('amaga');
      opt.style.display = 'block';
      opt.removeAttribute('disabled');
    } else {
      opt.classList.add('amaga');
      opt.style.display = 'none';
      opt.setAttribute('disabled', 'true'); // Deshabilitem per evitar seleccions fantasma
    }
  });

  // Reset del valor dels selects per evitar que quedi un jugador de l'altre equip
  document.getElementById('selectJugador1').value = "";
  document.getElementById('selectJugador2').value = "";
}

//Accions per actualitzar a vMix els noms dels equips i el resultat del partit a TOTS els grafismes alhora
function actualitzaNomEquips() {
  if (!dadesVmix || !ipVmix) return;
  const inputs = Array.from(dadesVmix.querySelectorAll("input"));
  const url = `http://${ipVmix}/api`;
  let comandes = [];

  // Filtrem grafismes que contenen Team1.Text o TeamName1.Text
  inputs.forEach(input => {
    const key = input.getAttribute("key");
    const keyEnc = encodeURIComponent(key);

    // Team1.Text (Abreviatures)
    if (input.querySelector('text[name="Team1.Text"]')) {
      comandes.push(`${url}/?Function=SetText&Input=${keyEnc}&Value=${encodeURIComponent(equipsSeleccionats[0].abrevi)}&SelectedName=Team1.Text`);
      comandes.push(`${url}/?Function=SetText&Input=${keyEnc}&Value=${encodeURIComponent(equipsSeleccionats[1].abrevi)}&SelectedName=Team2.Text`);
    }
    // TeamName1.Text (Noms complets)
    if (input.querySelector('text[name="TeamName1.Text"]')) {
      comandes.push(`${url}/?Function=SetText&Input=${keyEnc}&Value=${encodeURIComponent(equipsSeleccionats[0].nom)}&SelectedName=TeamName1.Text`);
      comandes.push(`${url}/?Function=SetText&Input=${keyEnc}&Value=${encodeURIComponent(equipsSeleccionats[1].nom)}&SelectedName=TeamName2.Text`);
    }
    // 1. Cas d'Inputs de tipus Imatge (sense SelectedName)
    const inputType = input.getAttribute("type");
    const inputTitle = (input.getAttribute("title") || "").toLowerCase();

    if (inputType === "Image") {
      let logoUrl = "";
      if (inputTitle.includes("local") || inputTitle.includes("1")) {
        logoUrl = equipsSeleccionats[0].logoPath || equipsSeleccionats[0].logo;
      } else if (inputTitle.includes("visit") || inputTitle.includes("2")) {
        logoUrl = equipsSeleccionats[1].logoPath || equipsSeleccionats[1].logo;
      }

      if (logoUrl) {
        let normalizedLogo = logoUrl;
        // Normalitzem barres per a Windows (vMix) per a qualsevol lletra d'unitat o camí de xarxa
        if (/^[a-zA-Z]:/.test(normalizedLogo) || normalizedLogo.startsWith("\\\\")) {
          normalizedLogo = normalizedLogo.replace(/\//g, "\\");
        }
        comandes.push(`${url}/?Function=SetImage&Input=${keyEnc}&Value=${encodeURIComponent(normalizedLogo)}`);
      }
    }

    // 2. Cas de Camps dins de títols GT (amb SelectedName)
    const logoFields = [
      { f1: "Logo1.Source", f2: "Logo2.Source" }, // Prioritat oficial
      { f1: "logo1.source", f2: "logo2.source" },
      { f1: "Team1Logo.Source", f2: "Team2Logo.Source" },
      { f1: "Logo 1.Source", f2: "Logo 2.Source" }
    ];

    logoFields.forEach(pair => {
      const hasField1 = input.querySelector(`image[name="${pair.f1}"]`);
      const hasField2 = input.querySelector(`image[name="${pair.f2}"]`);

      if (hasField1 || hasField2) {
        let logo0 = equipsSeleccionats[0].logoPath || equipsSeleccionats[0].logo;
        let logo1 = equipsSeleccionats[1].logoPath || equipsSeleccionats[1].logo;

        // Normalitzem barres per a Windows (vMix) per a qualsevol lletra d'unitat o camí de xarxa
        if (logo0 && (/^[a-zA-Z]:/.test(logo0) || logo0.startsWith("\\\\"))) {
          logo0 = logo0.replace(/\//g, "\\");
        }
        if (logo1 && (/^[a-zA-Z]:/.test(logo1) || logo1.startsWith("\\\\"))) {
          logo1 = logo1.replace(/\//g, "\\");
        }

        if (logo0) {
          const nameBase = pair.f1.split('.')[0];
          comandes.push(`${url}/?Function=SetImage&Input=${keyEnc}&Value=${encodeURIComponent(logo0)}&SelectedName=${encodeURIComponent(pair.f1)}`);
          comandes.push(`${url}/?Function=SetImage&Input=${keyEnc}&Value=${encodeURIComponent(logo0)}&SelectedName=${encodeURIComponent(nameBase)}`);
          comandes.push(`${url}/?Function=SetImage&Input=${keyEnc}&Value=${encodeURIComponent(logo0)}&SelectedName=${encodeURIComponent(nameBase + ".Source")}`);
        }
        if (logo1) {
          const nameBase = pair.f2.split('.')[0];
          comandes.push(`${url}/?Function=SetImage&Input=${keyEnc}&Value=${encodeURIComponent(logo1)}&SelectedName=${encodeURIComponent(pair.f2)}`);
          comandes.push(`${url}/?Function=SetImage&Input=${keyEnc}&Value=${encodeURIComponent(logo1)}&SelectedName=${encodeURIComponent(nameBase)}`);
          comandes.push(`${url}/?Function=SetImage&Input=${keyEnc}&Value=${encodeURIComponent(logo1)}&SelectedName=${encodeURIComponent(nameBase + ".Source")}`);
        }
      }
    });
  });

  enviarComandesVmix(comandes);
}

function actualitzaMarcadors(gols0, gols1) {
  if (!dadesVmix || !ipVmix) return;
  const inputs = Array.from(dadesVmix.querySelectorAll("input"));
  const url = `http://${ipVmix}/api`;
  let comandes = [];

  inputs.forEach(input => {
    const key = input.getAttribute("key");
    const keyEnc = encodeURIComponent(key);
    if (input.querySelector('text[name="Score1.Text"]') || input.querySelector('text[name="Score2.Text"]')) {
      comandes.push(`${url}/?Function=SetText&Input=${keyEnc}&Value=${gols0}&SelectedName=Score1.Text`);
      comandes.push(`${url}/?Function=SetText&Input=${keyEnc}&Value=${gols1}&SelectedName=Score2.Text`);
    }
  });

  enviarComandesVmix(comandes);
}

// ACCIONS DIALOG:

// Validació de noms propis
function validarNomPropi(input) {
  const regex = /^[A-ZÀ-Ú][a-zà-ú'.]+(\s[A-ZÀ-Ú][a-zà-ú'.]+)*$/;
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

// Limitar els md-checkbox a un màxim de 11 seleccionats (per dialog, no globalment)
function limitarCheckboxes(checkbox) {
  // Busquem el contenidor del dialog per limitar la cerca als jugadors del formulari actiu
  const dialeg = checkbox.closest('md-dialog');
  const checkboxes = dialeg
    ? dialeg.querySelectorAll('.seleccionat')
    : document.querySelectorAll('.seleccionat');
  const seleccionats = Array.from(checkboxes).filter(cb => cb.checked);
  if (seleccionats.length > 11) {
    checkbox.checked = false;
    alert('Només pots seleccionar un màxim d’11 jugadors.');
  }
}

//Accions per modificar el dialog d'afegir acció en funció de la pestanya del TAB clicada
function presetGol() {
  accio = 'gol';
  document.getElementById('selectJugador2').classList.contains('amaga') ? "" : document.getElementById('selectJugador2').classList.add('amaga');
  document.querySelectorAll('.selectTargeta').forEach(element => {
    element.classList.contains('amaga') ? "" : element.classList.add('amaga');
  });
}

function presetTargeta() {
  accio = 'targeta';
  document.getElementById('selectJugador2').classList.contains('amaga') ? "" : document.getElementById('selectJugador2').classList.add('amaga');
  document.querySelectorAll('.selectTargeta').forEach(element => {
    element.classList.contains('amaga') ? element.classList.remove('amaga') : "";
  });
  const groga = document.getElementById('selectTargetaGroga');
  if (groga) groga.checked = true;
}

function presetCanvi() {
  accio = 'canvi';
  document.getElementById('selectJugador2').classList.contains('amaga') ? document.getElementById('selectJugador2').classList.remove('amaga') : "";
  document.querySelectorAll('.selectTargeta').forEach(element => {
    element.classList.contains('amaga') ? "" : element.classList.add('amaga');
  });
}

function presetLesio() {
  accio = 'lesio';
}

//Desem les dades de l'accio per al registre, llencem grafisme i actualitzem historic del partit
function desaAccio() {
  let accioTemp = {};
  let accionsDesades = partit.accions;
  let dobleTargeta = false;
  accioTemp.timecode = currentTime;
  accioTemp.equipAccio = document.getElementById('selectAccioEquip0').checked ? '0' : '1';
  accioTemp.jugador0 = document.getElementById('selectJugador1').value;
  accionsDesades.forEach(element => {
    accio == 'targeta' && element.equipAccio == accioTemp.equipAccio && element.jugador0 == accioTemp.jugador0 ? dobleTargeta = true : "";
  });
  accio = accio == 'targeta' ? dobleTargeta ? 'vermella' : document.getElementById('selectTargetaGroga').checked ? 'groga' : 'vermella' : accio;
  accioTemp.tipus = accio;
  accioTemp.jugador1 = document.getElementById('selectJugador2').value;
  accionsDesades.push(accioTemp);
  partit.accions = accionsDesades;
  guardarPartit();
  generaGraellaResum();
  // Actualitzem la llista de jugadors seleccionables (per si canvis/expulsions han modificat la llista)
  jugadorsAccio();
  llencaGrafisme();
}

//Canvi dels estatus de seleccionat dels dos jugadors
function accioCanvi() {
  const equipIdxNum = document.getElementById('selectAccioEquip0').checked ? 0 : 1;
  let equip = equipsSeleccionats[equipIdxNum];
  let jugadorOut = document.getElementById('selectJugador1').value;
  let jugadorIn = document.getElementById('selectJugador2').value;

  if (equip.jugadors[jugadorOut] && equip.jugadors[jugadorIn]) {
    equip.jugadors[jugadorOut][1] = false;
    equip.jugadors[jugadorIn][1] = true;

    // Guardem canvis
    localStorage.setItem("equips", JSON.stringify(emmagatzematgeEquips));

    // Actualitzem la UI de la graella de jugadors (lineup)
    seleccioEquips(equipIdxNum);

    // Actualitzem els seleccionables dels dialogs
    jugadorsAccio();
  }
}

function retiraJugador(equipIdx, jugadorId) {
  let equip = equipsSeleccionats[equipIdx];
  if (equip && equip.jugadors[jugadorId]) {
    equip.jugadors[jugadorId][1] = false;
    localStorage.setItem("equips", JSON.stringify(emmagatzematgeEquips));
    seleccioEquips(equipIdx);
    jugadorsAccio();
  }
}

async function llencaGrafisme() {
  if (!ipVmix) return;
  const url = `http://${ipVmix}/api`;
  const numEquip = document.getElementById('selectAccioEquip0').checked ? 0 : 1;
  const equip = equipsSeleccionats[numEquip];
  const idJugador1 = document.getElementById('selectJugador1').value;
  const jugador1Nom = equip.jugadors[idJugador1] ? equip.jugadors[idJugador1][0] : "";

  let comandes = [];
  let inputIdx;

  const inputIdxMap = { 'gol': 1, 'groga': 2, 'vermella': 2, 'canvi': 3 };
  inputIdx = inputIdxMap[accio];

  if (inputIdx !== undefined && !grafismesSeleccionats[inputIdx]) {
    console.warn(`No s'ha seleccionat cap grafisme per a l'acció: ${accio}`);
    // Continuem per executar la lògica interna (retirar jugador, etc) però sense comandes vMix
  }

  const keyBase = (inputIdx !== undefined && grafismesSeleccionats[inputIdx]) ? encodeURIComponent(grafismesSeleccionats[inputIdx]) : null;

  switch (accio) {
    case 'gol':
      if (keyBase) {
        comandes.push(`${url}/?Function=SetText&Input=${keyBase}&Value=${encodeURIComponent(jugador1Nom)}&SelectedName=Player.Text`);
        comandes.push(`${url}/?Function=SetText&Input=${keyBase}&Value=${encodeURIComponent(equip.nom)}&SelectedName=TeamName.Text`);
        comandes.push(`${url}/?Function=OverlayInput2&Input=${keyBase}`);
      }
      break;

    case 'groga':
    case 'vermella':
      if (keyBase) {
        comandes.push(`${url}/?Function=SetText&Input=${keyBase}&Value=${encodeURIComponent(jugador1Nom)}&SelectedName=Player.Text`);
        comandes.push(`${url}/?Function=SetText&Input=${keyBase}&Value=${encodeURIComponent(equip.nom)}&SelectedName=TeamName.Text`);
        if (accio === 'groga') {
          comandes.push(`${url}/?Function=SetImageVisibleOn&Input=${keyBase}&SelectedName=Yellow.Source`);
          comandes.push(`${url}/?Function=SetImageVisibleOff&Input=${keyBase}&SelectedName=Red.Source`);
        } else {
          comandes.push(`${url}/?Function=SetImageVisibleOff&Input=${keyBase}&SelectedName=Yellow.Source`);
          comandes.push(`${url}/?Function=SetImageVisibleOn&Input=${keyBase}&SelectedName=Red.Source`);
        }
        comandes.push(`${url}/?Function=OverlayInput2&Input=${keyBase}`);
      }
      if (accio === 'vermella') retiraJugador(numEquip, idJugador1);
      break;

    case 'canvi':
      const idJugador2 = document.getElementById('selectJugador2').value;
      const jugador2Nom = equip.jugadors[idJugador2] ? equip.jugadors[idJugador2][0] : "";
      if (keyBase) {
        comandes.push(`${url}/?Function=SetText&Input=${keyBase}&Value=${encodeURIComponent(jugador2Nom)}&SelectedName=On%20Name.Text`);
        comandes.push(`${url}/?Function=SetText&Input=${keyBase}&Value=${encodeURIComponent(jugador1Nom)}&SelectedName=Off%20Name.Text`);
        comandes.push(`${url}/?Function=SetText&Input=${keyBase}&Value=${encodeURIComponent(equip.abrevi)}&SelectedName=Team.Text`);
        comandes.push(`${url}/?Function=OverlayInput2&Input=${keyBase}`);
      }
      accioCanvi();
      break;

    case 'lesio':
      retiraJugador(numEquip, idJugador1);
      return; // No hi ha grafisme específic de lesió segons el codi actual
  }

  if (comandes.length > 0) {
    await enviarComandesVmix(comandes);
    // Treure l'overlay després de 5 segons si és un grafisme d'acció
    if (inputIdx !== undefined && grafismesSeleccionats[inputIdx]) {
      setTimeout(() => {
        const key = encodeURIComponent(grafismesSeleccionats[inputIdx]);
        enviarComandesVmix([`${url}/?Function=OverlayInput2Off&Input=${key}`]);
      }, 10000);
    }
  }
  presetGol();
}

function generaIcones(accio) {
  switch (accio) {
    case 'gol':
      return '⚽'
    case 'groga':
      return '🟨'
    case 'vermella':
      return '🟥'
    case 'canvi':
      return '🔃'
    case 'lesio':
      return '🚑'
  }
}

//Actualització graella de resum d'accions
function generaGraellaResum() {
  let accionsDesades = partit.accions;
  let graellaResum = document.getElementById('graellaResum');
  graellaResum.innerHTML = "";
  //aprofitem aquesta funcio per recomptar gols i actualitzar el HTML
  let golsLocal = 0;
  let golsVisitant = 0;
  for (let index = 0; index < accionsDesades.length; index++) {
    const accions = accionsDesades[index];
    accions.tipus == 'gol' ? accions.equipAccio == 0 ? golsLocal += 1 : golsVisitant += 1 : "";
    let nouElement = document.createElement('li');
    nouElement.id = 'accio_' + index;
    let jugadorInfo = "";
    try {
      const eqIdx = accions.equipAccio;
      const equip = equipsSeleccionats[eqIdx];
      if (equip && equip.jugadors && equip.jugadors[accions.jugador0]) {
        if (accions.tipus === 'canvi' && equip.jugadors[accions.jugador1]) {
          jugadorInfo = `${equip.jugadors[accions.jugador0][0]} > ${equip.jugadors[accions.jugador1][0]}`;
        } else {
          jugadorInfo = equip.jugadors[accions.jugador0][0];
        }
      } else {
        jugadorInfo = "Jugador " + accions.jugador0;
      }
    } catch (e) {
      jugadorInfo = "Dades no disponibles";
    }

    nouElement.innerHTML = `
    <span class="timecode">${accions.timecode}'</span>
    <span class="icona">${accions.equipAccio == 0 ? generaIcones(accions.tipus) : ""}</span>
    <span class="jugador">${accions.equipAccio == 0 ? jugadorInfo : ""}</span>
    <span class="resultat">${golsLocal}-${golsVisitant}</span>
    <span class="icona">${accions.equipAccio == 1 ? generaIcones(accions.tipus) : ""}</span>
    <span class="jugador">${accions.equipAccio == 1 ? jugadorInfo : ""}</span>
    <div class="accionsHistorial">
      <md-icon-button onclick="editaAccio('${index}')"><md-icon>edit</md-icon></md-icon-button>
      <md-icon-button onclick="eliminaAccio('${index}')"><md-icon>delete</md-icon></md-icon-button>
    </div>`;
    graellaResum.appendChild(nouElement);
    //Si un jugador és expulsat el deshabilitem dels seleccionables (amb null-guard)
    if (accions.tipus == 'vermella') {
      const optExpulsat = document.querySelector('#selectJugador1 [value="' + accions.jugador0 + '"]');
      if (optExpulsat) optExpulsat.disabled = true;
    }
  }
  partit.golsLocal = golsLocal;
  partit.golsVisitant = golsVisitant;
  guardarPartit();
  let resultat = document.querySelectorAll('#resultat');
  resultat.forEach(element => {
    element.innerHTML = golsLocal + " - " + golsVisitant;
  });
  dadesVmix == undefined ? "" : actualitzaMarcadors(golsLocal, golsVisitant);
}

function editaAccio(num) {
  let accioTemp = partit.accions[num];
  let pestanya = document.getElementById('tabsAccio');
  let dialog = document.getElementById('afegirAccio');

  if (!accioTemp || !pestanya || !dialog) return;

  switch (accioTemp.tipus) {
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

  document.getElementById(accioTemp.equipAccio == 0 ? 'selectAccioEquip0' : 'selectAccioEquip1').checked = true;
  filtraJugadorsAccio(accioTemp.equipAccio == 0 ? 'llistaJugadorsEquip0' : 'llistaJugadorsEquip1');

  document.getElementById('selectJugador1').value = accioTemp.jugador0;
  if (accioTemp.tipus == 'groga') {
    document.getElementById('selectJugador2').value = accioTemp.jugador1;
    document.getElementById('selectTargetaGroga').checked = true;
  }
  if (accioTemp.tipus == 'vermella') {
    document.getElementById('selectJugador2').value = accioTemp.jugador1;
    document.getElementById('selectTargetaVermella').checked = true;
  }

  dialog.querySelector('[type=submit]').onclick = function () { corregeixAccio(num); };
  dialog.show();
}

function eliminaAccio(index) {
  if (confirm('Vols eliminar aquesta acció?')) {
    partit.accions.splice(index, 1);
    guardarPartit();
    generaGraellaResum();
  }
}

function corregeixAccio(num) {
  let accioTemp = partit.accions[num];
  if (!accioTemp) return;

  const equipAccio = document.getElementById('selectAccioEquip0').checked ? '0' : '1';
  const jugador0 = document.getElementById('selectJugador1').value;
  let dobleTargeta = false;

  // Comprovem si ja tenia una groga abans d'aquesta acció
  for (let i = 0; i < num; i++) {
    const prev = partit.accions[i];
    if (prev.equipAccio == equipAccio && prev.jugador0 == jugador0 && prev.tipus == 'groga') {
      dobleTargeta = true;
    }
  }

  let tipusFinal = accio;
  if (tipusFinal === 'targeta') {
    tipusFinal = dobleTargeta ? 'vermella' : (document.getElementById('selectTargetaGroga').checked ? 'groga' : 'vermella');
  }

  accioTemp.equipAccio = equipAccio;
  accioTemp.jugador0 = jugador0;
  accioTemp.tipus = tipusFinal;
  accioTemp.jugador1 = document.getElementById('selectJugador2').value;

  guardarPartit();
  generaGraellaResum();
}

function exportVmix(fileName) {
  /**let sortida = {};
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
  downloadLink.click();**/
  const jsonString = localStorage.vmix;
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const enllac = document.createElement("a");
  enllac.href = url; enllac.download = `${fileName}.json`; // El nom del fitxer que rebrà l'usuari
  enllac.click();
  URL.revokeObjectURL(url); // Opcional, per alliberar memòria
}




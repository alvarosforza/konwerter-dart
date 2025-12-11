//DISCLAIMER: jeśli ktokolwiek będzie tu zaglądał proszę wyjebać nazewnictwo zmiennych do kosza bo sam nie wiem co jest czym
const ligi = JSON.parse(
`[{"liga": "ekstraklasa",
"druzyny":
[{"nazwa": "sernik", "kapitan":"A", "zawodnicy":["A","B","C","D","A2","B2","C2","D2"], "lokal":"lodówka", "adres":"kuchnia", "sponsorzy":""},
{"nazwa": "roztocza" , "kapitan":"E", "zawodnicy":["E","F","G","H","E2","F2","G2","H2"], "lokal":"dywan", "adres":"podłoga", "sponsorzy":""}, 
{"nazwa": "pliki" , "kapitan":"I", "zawodnicy":["I","J","K","L","I2","J2","K2","L2"], "lokal":"folder", "adres":"dysk", "sponsorzy":""},
{"nazwa": "switche" , "kapitan":"M", "zawodnicy":["M","N","O","P","M2","N2","O2","P2"], "lokal":"klawiatura", "adres":"biurko", "sponsorzy":""}
]},
{"liga": "1 liga",
"druzyny":
[{"nazwa": "rodzynki", "kapitan":"A", "zawodnicy":["a","b","c","d","a2","b2","c2","d2"], "lokal":"na pewno nie w serniku", "adres":"kuchnia", "sponsorzy":""},
{"nazwa": "if" , "kapitan":"E", "zawodnicy":["e","f","g","h","e2","f2","g2","h2"], "lokal":"if", "adres":"script.js", "sponsorzy":""}, 
{"nazwa": "autor" , "kapitan":"I", "zawodnicy":["i","j","k","l","i2","j2","k2","l2"], "lokal":"mirage", "adres":"cs2", "sponsorzy":""},
{"nazwa": "lotka" , "kapitan":"M", "zawodnicy":["m","n","o","p","m2","n2","o2","p2"], "lokal":"tarcza", "adres":"lokal", "sponsorzy":""}]}]`
)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("formKonwerter");

  const gospodarz = document.getElementById("gospodarz");
  const gosc = document.getElementById("gosc");
  const lokalizacja = document.getElementById("lokalizacja");

  const ligaSelect = document.getElementById(`liga`)
  for (let index = 0; index < ligi.length; index++) {
    ligaSelect.innerHTML += `<option value="${index}">${ligi[index].liga}</option>`;
  }
  var ligaVal = ligaSelect.value 
  
  // disable selected team in the other select
  const syncSelects = (source, target) => {
    if (!source || !target) return;
    setOptionValues(source);
    setOptionValues(target);
    Array.from(target.options).forEach(opt => opt.disabled = false);
    const sourceValue = source.value;
    if (!sourceValue) return;
    const match = Array.from(target.options).find(o => o.value === sourceValue);
    if (!match) return;
    if (target.value === sourceValue) {
      const fallback = Array.from(target.options).find(o => o.value !== sourceValue && !o.disabled);
      if (fallback) {
        fallback.selected = true;
      } else {
        match.selected = false;
      }
    }
    match.disabled = true;
  };
    // helper: set option values from option text content
    const setOptionValues = (selectEl) => {
    if (!selectEl) return;
    Array.from(selectEl.querySelectorAll('option')).forEach(opt => {
      const text = opt.textContent.trim();
      if (!opt.hasAttribute('value') || opt.value === '') {
      opt.setAttribute('value', text);
      }
    });
    };

    // function to populate team selects based on current league
    const populateTeamSelects = () => {
    gospodarz.innerHTML = '';
    gosc.innerHTML = '';
    for (let index = 0; index < ligi[ligaVal].druzyny.length; index++) {
      gospodarz.innerHTML += `<option value="${ligi[ligaVal].druzyny[index].nazwa}">${ligi[ligaVal].druzyny[index].nazwa}</option>`;
      gosc.innerHTML += `<option value="${ligi[ligaVal].druzyny[index].nazwa}">${ligi[ligaVal].druzyny[index].nazwa}</option>`;
    }
    setOptionValues(gospodarz);
    setOptionValues(gosc);
    
    // Sync selects to disable same team selection
    syncSelects(gospodarz, gosc);
    syncSelects(gosc, gospodarz);
    
    // Update location after populating teams
    lokalizacja.value = (ligi[ligaVal].druzyny.find(d => d.nazwa === gospodarz.value) || {}).lokal || '';
    };

    // Initial population
    populateTeamSelects();

    ligaSelect.addEventListener("change", (x) => {
    x.preventDefault()
    ligaVal = ligaSelect.value 
    
    // Repopulate team selects when league changes
    populateTeamSelects();
    
    // Update teams and players after league change
    updateTeamsAndPlayers();
    }) // event listener na zmiane ligi

  var sumLegHost = 0
  var sumLegGuest = 0
  document.getElementById(`date`).valueAsDate = new Date();
  // keep references used later
  const meczeAll = document.getElementById("meczeAll");
  var skladGospodarz, skladGosc;

  // player-select helpers (hosts: h1..h4 + #hosty selects hr*, guests: g1..g4 + #goscie selects gr*)
  const getSelectsForSide = (side) => {
    const baseIds = side === 'host' ? ['h1', 'h2', 'h3', 'h4'] : ['g1', 'g2', 'g3', 'g4'];
    const base = baseIds.map(id => document.getElementById(id)).filter(Boolean);
    const container = side === 'host' ? document.getElementById('hosty') : document.getElementById('goscie');
    const dyn = container ? Array.from(container.querySelectorAll('select')) : [];
    return base.concat(dyn);
  };

  const getAllSelects = () => {
    const baseIds =  ['h1', 'h2', 'h3', 'h4', 'g1', 'g2', 'g3', 'g4'];
    const base = baseIds.map(id => document.getElementById(id)).filter(Boolean);
    const container = document.getElementById('zawodnicy') 
    const dyn = container ? Array.from(container.querySelectorAll('select')) : [];
    return base.concat(dyn);
  }

  const syncPlayerGroup = (selects) => {
    if (!selects || selects.length === 0) return;
    // enable all options first
    selects.forEach(s => Array.from(s.options).forEach(o => o.disabled = false));
    // gather chosen non-empty values
    const chosen = selects.map(s => s.value).filter(v => v !== '' && v != null);
    // disable chosen values in other selects (but keep them enabled on the select that currently has them)
    chosen.forEach(val => {
      selects.forEach(s => {
        if (s.value === val) return;
        const opt = Array.from(s.options).find(o => o.value === val);
        if (opt) opt.disabled = true;
      });
    });
  };

  // populate selects for a side with players (adds optional empty option for substitutes)
  const populatePlayerSelects = (side, players) => {
    const selects = getSelectsForSide(side);
    selects.forEach((sel, index) => {
      const prev = sel.value;
      // rebuild options
      sel.innerHTML = '';
      // allow empty only for dynamic substitute selects (ids hr*, gr*)
      const allowEmpty = /^hr\d+$/.test(sel.id) || /^gr\d+$/.test(sel.id);
      if (allowEmpty) sel.innerHTML += `<option value="">-</option>`;
      // Add players with different defaults
      const playerIndex = index < players.length ? index : 0; // Ensure we don't go out of bounds
      sel.innerHTML += `<option value="${players[playerIndex]}">${players[playerIndex]}</option>`;
      players.forEach((p, i) => {
        if (i !== playerIndex) {
          sel.innerHTML += `<option value="${p}">${p}</option>`;
        }
      });
      // try to restore previous selection if still valid
      if (prev && Array.from(sel.options).some(o => o.value === prev)) sel.value = prev;
    });
    syncPlayerGroup(selects);

    // ensure change listeners are attached (idempotent)
    selects.forEach(sel => {
      sel.removeEventListener('change', playerChangeHandler);
      sel.addEventListener('change', playerChangeHandler);
    });
  };

  function playerChangeHandler(ev) {
    const id = ev.currentTarget && ev.currentTarget.id;
    if (!id) return;
    const side = id[0] === 'h' ? 'host' : 'guest';
    const selects = getSelectsForSide(side);
    syncPlayerGroup(selects);
  }

  // observe dynamic substitute selects being added and repopulate options
  const observeSubs = (containerEl, side) => {
    if (!containerEl || typeof MutationObserver === 'undefined') return;
    const mo = new MutationObserver(() => {
      // small timeout to let innerHTML insertions finish
      setTimeout(() => {
        const players = side === 'host' ? skladGospodarz : skladGosc;
        if (players) populatePlayerSelects(side, players);
      }, 0);
    });
    mo.observe(containerEl, { childList: true, subtree: true });
  };

  // update team players and repopulate player selects
  const updateTeamsAndPlayers = () => {
    const hostTeam = ligi[ligaVal].druzyny.find(d => d.nazwa === gospodarz.value);
    const guestTeam = ligi[ligaVal].druzyny.find(d => d.nazwa === gosc.value);
    skladGospodarz = hostTeam ? hostTeam.zawodnicy.slice() : [];
    skladGosc = guestTeam ? guestTeam.zawodnicy.slice() : [];
    populatePlayerSelects('host', skladGospodarz);
    populatePlayerSelects('guest', skladGosc);
  };

  // wire team selects
  gospodarz.addEventListener('change', (event) => {
    event.preventDefault();
    syncSelects(gospodarz, gosc);
    lokalizacja.value = (ligi[ligaVal].druzyny.find(d => d.nazwa === gospodarz.value) || {}).lokal || '';
    updateTeamsAndPlayers();
  });

  gosc.addEventListener('change', () => {
    syncSelects(gosc, gospodarz);
    updateTeamsAndPlayers();
  });

  // initial sync and populate
  syncSelects(gospodarz, gosc);
  syncSelects(gosc, gospodarz);
  updateTeamsAndPlayers();

  // observe the substitute areas so new selects get populated automatically
  observeSubs(document.getElementById('hosty'), 'host');
  observeSubs(document.getElementById('goscie'), 'guest');
  
function singleSimple(meczID) {
  const mecz = document.createElement("div");
  mecz.id = `mecz${meczID}`;
  mecz.className = "row";
  mecz.innerHTML = `
  <div class="mb-3  mt-5 btn btn-mecz text-white">Pojedynek ${meczID}:<br>typ: "Singiel"
  </div>
  <div class="col-sm-4" style="margin:auto">
  Zawodnik gospodarzy:
  <select id="gracz1mecz${meczID}" class="form-select">
  </select>
  </div>
  <div class="col-sm-4" style="margin:auto">
  Zawodnik gości:
  <select id="gracz2mecz${meczID}" class="form-select">F
  </select>
  </div>
  <div></div>
  `;
  meczeAll.appendChild(mecz);

  let selectZawodnik1 = document.getElementById(`gracz1mecz${meczID}`);
  let selectZawodnik2 = document.getElementById(`gracz2mecz${meczID}`);
  const updateMatchPlayerOptions = () => {
    // get currently chosen players in host and guest player selects
    const hostChosen = getSelectsForSide('host').map(s => s.value).filter(Boolean);
    const guestChosen = getSelectsForSide('guest').map(s => s.value).filter(Boolean);

    // helper to (re)build options for a select from players array, disabling those not chosen
    const buildOptions = (selectEl, players, chosenList, defaultIndex = 0) => {
      if (!selectEl) return;
      const prev = selectEl.value;
      selectEl.innerHTML = '';
      players.forEach((p, i) => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        // disable option when player is not currently selected in the corresponding team selects
        if (!chosenList.includes(p)) opt.disabled = true;
        // set default selection based on index
        if (prev && prev === p) {
          opt.selected = true;
        } else if (!prev && i === defaultIndex && chosenList.includes(p)) {
          opt.selected = true;
        }
        selectEl.appendChild(opt);
      });
      // if nothing is selected and there is an enabled option, pick the first enabled one
      if (!selectEl.value) {
        const firstEnabled = Array.from(selectEl.options).find(o => !o.disabled);
        if (firstEnabled) selectEl.value = firstEnabled.value;
      }
    };

    // Determine default player indexes based on meczID
    let hostIndex1 = 0, guestIndex1 = 0;
    switch(meczID) {
      case 1:
        hostIndex1 = 0; // H1
        guestIndex1 = 0; // G1
        break;
      case 2:
        hostIndex1 = 1; // H2
        guestIndex1 = 1; // G2
        break;
      case 3:
        hostIndex1 = 2; // H3
        guestIndex1 = 3; // G4
        break;
      case 4:
        hostIndex1 = 3; // H4
        guestIndex1 = 2; // G3
        break;
      case 9:
        hostIndex1 = 0; // H1
        guestIndex1 = 1; // G2
        break;
      case 10:
        hostIndex1 = 1; // H2
        guestIndex1 = 0; // G1
        break;
      case 11:
        hostIndex1 = 2; // H3
        guestIndex1 = 2; // G3
        break;
      case 12:
        hostIndex1 = 3; // H4
        guestIndex1 = 3; // G4
        break;
      default:
        hostIndex1 = 0;
        guestIndex1 = 0;
    }

    buildOptions(selectZawodnik1, Array.isArray(skladGospodarz) ? skladGospodarz : [], hostChosen, hostIndex1);
    buildOptions(selectZawodnik2, Array.isArray(skladGosc) ? skladGosc : [], guestChosen, guestIndex1);
  };

  // initial build
  updateMatchPlayerOptions();

  // update when any host/guest player select changes (covers base + dynamic substitutes and team selects)
  document.addEventListener('change', (ev) => {
    const id = ev.target && ev.target.id;
    if (!id) return;
    if (/^(h|hr|g|gr)\d/.test(id) || id === 'gospodarz' || id === 'gosc') {
      updateMatchPlayerOptions();
    }
  });

  // create legs and keep their initial return values
  let leg1Val = legSimple(meczID, 1);
  let leg2Val = legSimple(meczID, 2);
  let leg3Val;

  // helper to read current values from DOM for a given leg number
  const getLegValues = (n) => {
    const wEl = document.getElementById(`winnerMecz${meczID}Leg${n}`);
    
    // Sync player options in leg selects based on selected players
    const updateLegPlayerOptions = () => {
      const hostSelects = getSelectsForSide('host');
      const guestSelects = getSelectsForSide('guest');
      const selectedHostPlayers = hostSelects.map(s => s.value).filter(v => v);
      const selectedGuestPlayers = guestSelects.map(s => s.value).filter(v => v);
      
      if (wEl) {
        Array.from(wEl.options).forEach(opt => {
          const val = opt.value;
          // If option belongs to host team, disable unless currently selected in host selects
          if (Array.isArray(skladGospodarz) && skladGospodarz.includes(val)) {
            opt.disabled = !selectedHostPlayers.includes(val);
          // If option belongs to guest team, disable unless currently selected in guest selects
          } else if (Array.isArray(skladGosc) && skladGosc.includes(val)) {
            opt.disabled = !selectedGuestPlayers.includes(val);
          } else {
            // Unknown origin (not in either team arrays) — leave enabled
            opt.disabled = false;
          }
        });
      }
    };
    
    updateLegPlayerOptions();
    return [
      wEl ? wEl.value : null,
    ];
  };

  // provide a function that always returns the current legs values (1..2 or 3 if exists)
  const getAllLegs = () => {
    const legs = [getLegValues(1), getLegValues(2)];
    if (document.getElementById(`mecz${meczID}leg3`)) {
      legs.push(getLegValues(3));
    }
    return legs;
  };

  // track match winner and update when players or winner selects change
  let matchWinner = (document.getElementById(`winnerMecz${meczID}Leg1`) || {}).value || null;
  const meczEl = document.getElementById(`mecz${meczID}`);

  const updateMatchWinner = () => {
    const w1El = document.getElementById(`winnerMecz${meczID}Leg1`);
    const w2El = document.getElementById(`winnerMecz${meczID}Leg2`);
    const w1 = w1El ? w1El.value : null;
    const w2 = w2El ? w2El.value : null;

    if (!w1 || !w2) {
      return;
    }

    if (w1 !== w2) {
      if (!document.getElementById(`mecz${meczID}leg3`)) {
        leg3Val = legSimple(meczID, 3);
      }
    } else {
      const leg3 = document.getElementById(`mecz${meczID}leg3`);
      const leg3Name = document.getElementById(`mecz${meczID}leg3Name`);
      if (document.getElementById(`winnerMecz${meczID}Leg3`)) {
        const leg3winner = document.getElementById(`winnerMecz${meczID}Leg3`).value;
        if (skladGospodarz.find(e => e==leg3winner)) sumLegHost--
        if (skladGosc.find(e => e==leg3winner)) sumLegGuest--
      }
      if (leg3) leg3.remove();
      if (leg3Name) leg3Name.remove();
      leg3Val = undefined;
      // przy usuwaniu trzeba dekrementować wybraną opcję
    }
  };

  if (meczEl) {
    meczEl.addEventListener('change', (ev) => {
      const id = ev.target && ev.target.id;
      if (!id) return;
      const relevant =
        id === `gracz1mecz${meczID}` ||
        id === `gracz2mecz${meczID}` ||
        id.startsWith(`winnerMecz${meczID}Leg`);
      if (!relevant) return;
      if (typeof getAllLegs === 'function') getAllLegs();
      updateMatchWinner();
    });
  }

  updateMatchWinner();

  // Return an API giving access to:
  // - current values of legs via getAllLegs()
  // - the initial captured-return-values from calls to leg() (could be used if you want the "initial-read")
  return {
    getLegs: getAllLegs,
    getLeg: getLegValues,
    initial: {
      leg1: leg1Val,
      leg2: leg2Val,
      leg3: leg3Val
    }
  };
}

function legSimple(meczID, numer) {
  let legDiv = document.createElement("div")
  legDiv.id=`mecz${meczID}leg${numer}`
  let legName = document.createElement("div")
  legName.id=`mecz${meczID}leg${numer}Name`
  legName.innerHTML=`Leg ${numer}:`
  legName.className=`mb-3 mt-5 btn-leg text-white`

  let selectZawodnik1 = document.getElementById(`gracz1mecz${meczID}`)
  let selectZawodnik2 = document.getElementById(`gracz2mecz${meczID}`)
  let g1 = selectZawodnik1.value
  let g2 = selectZawodnik2.value
  
  // let leg = document.getElementById(`mecz${numer}leg${numer}`);
  legDiv.innerHTML=`Kto wygrał leg? <select id="winnerMecz${meczID}Leg${numer}" class="form-select" style="width:fit-content;">
  <option value="${g1}">${g1}</option>
  <option value="${g2}">${g2}</option>
  </select><br>`
  if (numer==3) {
    legDiv.innerHTML+=`Kto zaczął leg? 
    <select id="whoStartedLeg3Mecz${meczID}" class="form-select" style="width:fit-content;">
    <option value="${g1}">${g1}</option>
    <option value="${g2}">${g2}</option>
    </select><br>`
  }
  // aktualizacje 
  selectZawodnik1.addEventListener("change", (x) => {
    x.preventDefault();
    g1 = document.getElementById(`gracz1mecz${meczID}`).value
    legDiv.innerHTML=`Kto wygrał leg? <select id="winnerMecz${meczID}Leg${numer}" class="form-select" style="width:fit-content;">
      <option value="${g1}">${g1}</option>
      <option value="${g2}">${g2}</option>
      </select><br>
      `
    if (numer==3) {
      legDiv.innerHTML+=`Kto zaczął leg? 
    <select id="whoStartedLeg3Mecz${meczID}" class="form-select" style="width:fit-content;">
    <option value="${g1}">${g1}</option>
    <option value="${g2}">${g2}</option>
    </select><br>`
    }
  })
  selectZawodnik2.addEventListener("change", (x) => {
    x.preventDefault();
    g2 = document.getElementById(`gracz2mecz${meczID}`).value
    legDiv.innerHTML=`Kto wygrał leg? <select id="winnerMecz${meczID}Leg${numer}" class="form-select" style="width:fit-content;">
      <option value="${g1}">${g1}</option>
      <option value="${g2}">${g2}</option>
      </select><br>
      `
    if (numer==3) {
      legDiv.innerHTML+=`Kto zaczął leg? 
    <select id="whoStartedLeg3Mecz${meczID}" class="form-select" style="width:fit-content;">
    <option value="${g1}">${g1}</option>
    <option value="${g2}">${g2}</option>
    </select><br>`
    }

  })

  let mecz = document.getElementById(`mecz${meczID}`)
  mecz.appendChild(legName)
  mecz.appendChild(legDiv)
  sumLegHost++
  document.getElementById(`winnerMecz${meczID}Leg${numer}`).addEventListener("change", (x) => {
    x.preventDefault()
    let winner = (document.getElementById(`winnerMecz${meczID}Leg${numer}`) || {}).value
    if (skladGospodarz.find((e) => e===winner)) { 
      sumLegHost++; 
      sumLegGuest--;
    }
    if (skladGosc.find((e) => e===winner)) {
      sumLegGuest++; 
      sumLegHost--;
    }
  })
}

function doubleSimple(meczID) {
  const mecz = document.createElement("div");
  mecz.id = `mecz${meczID}`;
  mecz.className = "row";
  mecz.innerHTML = `
  <div class="mb-3  mt-5 btn btn-mecz text-white">Pojedynek ${meczID}:<br>typ: "Pary - Liga"
  </div>
  <div class="col-sm-2" style="margin:auto">
  Gospodarz 1:
  <select id="gracz1mecz${meczID}" class="form-select">
  </select>
  </div>
  <div class="col-sm-2" style="margin:auto">
  Gospodarz 2:
  <select id="gracz2mecz${meczID}" class="form-select">
  </select>
  </div>
  <div class="col-sm-2" style="margin:auto">
  Gość 1:
  <select id="gracz3mecz${meczID}" class="form-select">
  </select>
  </div>
  <div class="col-sm-2" style="margin:auto">
  Gość 2:
  <select id="gracz4mecz${meczID}" class="form-select">
  </select>
  </div>
  <div></div>
  `;
  meczeAll.appendChild(mecz);

  let selectZawodnik1 = document.getElementById(`gracz1mecz${meczID}`);
  let selectZawodnik2 = document.getElementById(`gracz2mecz${meczID}`);
  let selectZawodnik3 = document.getElementById(`gracz3mecz${meczID}`);
  let selectZawodnik4 = document.getElementById(`gracz4mecz${meczID}`);

  const updateMatchPlayerOptions = () => {
    const hostChosen = getSelectsForSide('host').map(s => s.value).filter(Boolean);
    const guestChosen = getSelectsForSide('guest').map(s => s.value).filter(Boolean);

    const buildOptions = (selectEl, players, chosenList, selectIndex) => {
      if (!selectEl) return;
      const prev = selectEl.value;
      selectEl.innerHTML = '';
      const defaultPlayer = selectIndex < players.length ? players[selectIndex] : players[0];
      players.forEach((p, i) => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        // disable players not currently chosen in team selects
        if (!chosenList.includes(p)) opt.disabled = true;
        if (prev && prev === p) {
          opt.selected = true;
        } else if (!prev && i === selectIndex && selectIndex < players.length && chosenList.includes(p)) {
          opt.selected = true;
        }
        selectEl.appendChild(opt);
      });
      if (!selectEl.value) {
        const firstEnabled = Array.from(selectEl.options).find(o => !o.disabled);
        if (firstEnabled) selectEl.value = firstEnabled.value;
      }
    };

    // Determine default player indexes based on meczID
    let hostIndex1 = 0, hostIndex2 = 1, guestIndex1 = 0, guestIndex2 = 1;
    
    switch(meczID) {
      case 5:
        hostIndex1 = 0; // H1
        hostIndex2 = 1; // H2
        guestIndex1 = 2; // G3
        guestIndex2 = 3; // G4
        break;
      case 6:
        hostIndex1 = 2; // H3
        hostIndex2 = 3; // H4
        guestIndex1 = 0; // G1
        guestIndex2 = 1; // G2
        break;
      case 7:
        hostIndex1 = 0; // H1
        hostIndex2 = 2; // H3
        guestIndex1 = 3; // G4
        guestIndex2 = 1; // G2
        break;
      case 8:
        hostIndex1 = 1; // H2
        hostIndex2 = 3; // H4
        guestIndex1 = 2; // G3
        guestIndex2 = 0; // G1
        break;
      default:
        hostIndex1 = 0;
        hostIndex2 = 1;
        guestIndex1 = 0;
        guestIndex2 = 1;
    }

    buildOptions(selectZawodnik1, Array.isArray(skladGospodarz) ? skladGospodarz : [], hostChosen, hostIndex1);
    buildOptions(selectZawodnik2, Array.isArray(skladGospodarz) ? skladGospodarz : [], hostChosen, hostIndex2);
    buildOptions(selectZawodnik3, Array.isArray(skladGosc) ? skladGosc : [], guestChosen, guestIndex1);
    buildOptions(selectZawodnik4, Array.isArray(skladGosc) ? skladGosc : [], guestChosen, guestIndex2);

    // ensure players selected within the two selects of the same team are unique (disable duplicates)
    const syncTeamPlayers = (selects) => {
      selects.forEach(s => Array.from(s.options).forEach(o => {
        // keep disabled state from teamChosen check but re-evaluate duplicates
        o._origDisabled = o.disabled;
        o.disabled = o._origDisabled;
      }));
      const chosen = selects.map(s => s.value).filter(v => v);
      chosen.forEach(val => {
        selects.forEach(s => {
          if (s.value === val) return;
          const opt = Array.from(s.options).find(o => o.value === val);
          if (opt) opt.disabled = true;
        });
      });
    };

    syncTeamPlayers([selectZawodnik1, selectZawodnik2]);
    syncTeamPlayers([selectZawodnik3, selectZawodnik4]);

    // Update winner options to reflect currently selected match players
    const updateWinnerOptionsForMatch = () => {
      const winnerSelectors = Array.from(document.querySelectorAll(`#mecz${meczID} select[id^="winnerMecz${meczID}Leg"]`));
      const currentMatchPlayers = [
        selectZawodnik1.value,
        selectZawodnik2.value,
        selectZawodnik3.value,
        selectZawodnik4.value
      ].filter(Boolean);

      winnerSelectors.forEach(wEl => {
        const prev = wEl.value;
        // Rebuild options to match current match players
        wEl.innerHTML = '';
        currentMatchPlayers.forEach(player => {
          const opt = document.createElement('option');
          opt.value = player;
          opt.textContent = player;
          wEl.appendChild(opt);
        });
        
        // Try to restore previous selection if still valid
        if (prev && currentMatchPlayers.includes(prev)) {
          wEl.value = prev;
        } else {
          // Pick first available player
          if (currentMatchPlayers.length > 0) {
            wEl.value = currentMatchPlayers[0];
          }
        }
      });
    };
    updateWinnerOptionsForMatch();
  };

  // Add change listeners to match player selects to update winner options
  [selectZawodnik1, selectZawodnik2, selectZawodnik3, selectZawodnik4].forEach(select => {
    if (select) {
      select.addEventListener('change', updateMatchPlayerOptions);
    }
  });

  updateMatchPlayerOptions();

  document.addEventListener('change', (ev) => {
    const id = ev.target && ev.target.id;
    if (!id) return;
    if (/^(h|hr|g|gr)\d/.test(id) || id === 'gospodarz' || id === 'gosc') {
      updateMatchPlayerOptions();
    }
  });
  let leg1Val = legDoubleSimple(meczID, 1);
  let leg2Val = legDoubleSimple(meczID, 2);
  let leg3Val;

  const getLegValues = (n) => {
    const wEl = document.getElementById(`winnerMecz${meczID}Leg${n}`);
    const updateLegPlayerOptions = () => {
      const hostSelects = getSelectsForSide('host');
      const guestSelects = getSelectsForSide('guest');
      const selectedHostPlayers = hostSelects.map(s => s.value).filter(v => v);
      const selectedGuestPlayers = guestSelects.map(s => s.value).filter(v => v);

      if (wEl) {
        Array.from(wEl.options).forEach(opt => {
          const val = opt.value;
          if (Array.isArray(skladGospodarz) && skladGospodarz.includes(val)) {
            opt.disabled = !selectedHostPlayers.includes(val);
          } else if (Array.isArray(skladGosc) && skladGosc.includes(val)) {
            opt.disabled = !selectedGuestPlayers.includes(val);
          } else {
            opt.disabled = false;
          }
        });
        // if selected winner became disabled, pick first enabled
        if (wEl.selectedOptions.length && Array.from(wEl.selectedOptions).some(o => o.disabled)) {
          const firstEnabled = Array.from(wEl.options).find(o => !o.disabled);
          if (firstEnabled) wEl.value = firstEnabled.value;
        }
      }
    };

    updateLegPlayerOptions();
    return [
      wEl ? wEl.value : null,
    ];
  };

  const getAllLegs = () => {
    const legs = [getLegValues(1), getLegValues(2)];
    if (document.getElementById(`mecz${meczID}leg3`)) {
      legs.push(getLegValues(3));
    }
    return legs;
  };

  const getMatchWinner = () => {
    const legs = getAllLegs();
    if (legs.length < 2) return null;

    const leg1Winner = legs[0][0];
    const leg2Winner = legs[1][0];

    if (!leg1Winner || !leg2Winner) return null;

    const hostPlayers = skladGospodarz || [];
    const leg1IsHost = hostPlayers.includes(leg1Winner);
    const leg2IsHost = hostPlayers.includes(leg2Winner);

    if (leg1IsHost && leg2IsHost) return 'host';
    if (!leg1IsHost && !leg2IsHost) return 'guest';

    if (legs.length > 2) {
      const leg3Winner = legs[2][0];
      if (!leg3Winner) return null;
      return (hostPlayers.includes(leg3Winner)) ? 'host' : 'guest';
    }

    return null;
  };

  const meczEl = document.getElementById(`mecz${meczID}`);

  const updateMatchWinner = () => {
    const legs = getAllLegs();

    if (legs.length < 2 || !legs[0][0] || !legs[1][0]) {
      return;
    }

    const leg1Winner = legs[0][0];
    const leg2Winner = legs[1][0];
    const hostPlayers = skladGospodarz || [];

    const leg1IsHost = hostPlayers.includes(leg1Winner);
    const leg2IsHost = hostPlayers.includes(leg2Winner);

    if (leg1IsHost !== leg2IsHost) {
      if (!document.getElementById(`mecz${meczID}leg3`)) {
        leg3Val = legDoubleSimple(meczID, 3);
      }
    } else {
      const leg3 = document.getElementById(`mecz${meczID}leg3`);
      const leg3Name = document.getElementById(`mecz${meczID}leg3Name`);
      if (document.getElementById(`winnerMecz${meczID}Leg3`)) {
        const leg3winner = document.getElementById(`winnerMecz${meczID}Leg3`).value;
        if (skladGospodarz.find(e => e==leg3winner)) sumLegHost--
        if (skladGosc.find(e => e==leg3winner)) sumLegGuest--
      }
      if (leg3) leg3.remove();
      if (leg3Name) leg3Name.remove();
      leg3Val = undefined;
    }
    matchWinner = getMatchWinner();
  };
  if (meczEl) {
    meczEl.addEventListener('change', (ev) => {
      const id = ev.target && ev.target.id;
      if (!id) return;
      const relevant =
        id === `gracz1mecz${meczID}` ||
        id === `gracz2mecz${meczID}` ||
        id === `gracz3mecz${meczID}` ||
        id === `gracz4mecz${meczID}` ||
        id.startsWith(`winnerMecz${meczID}Leg`);
      if (!relevant) return;
      if (typeof getAllLegs === 'function') getAllLegs();
      updateMatchWinner();
    });
  }
  updateMatchWinner();

  return {
    getLegs: getAllLegs,
    getLeg: getLegValues,
    getMatchWinner: getMatchWinner,
    initial: {
      leg1: leg1Val,
      leg2: leg2Val,
      leg3: leg3Val
    }
  };
}

function legDoubleSimple(meczID, numer) {
  let legDiv = document.createElement("div")
  legDiv.id = `mecz${meczID}leg${numer}`
  let legName = document.createElement("div")
  legName.id = `mecz${meczID}leg${numer}Name`
  legName.innerHTML = `Leg ${numer}:`
  legName.className = `mb-3 mt-5 btn-leg text-white`

  let selectZawodnik1 = document.getElementById(`gracz1mecz${meczID}`)
  let selectZawodnik2 = document.getElementById(`gracz2mecz${meczID}`)
  let selectZawodnik3 = document.getElementById(`gracz3mecz${meczID}`)
  let selectZawodnik4 = document.getElementById(`gracz4mecz${meczID}`)
  let g1 = selectZawodnik1 ? selectZawodnik1.value : ''
  let g2 = selectZawodnik2 ? selectZawodnik2.value : ''
  let g3 = selectZawodnik3 ? selectZawodnik3.value : ''
  let g4 = selectZawodnik4 ? selectZawodnik4.value : ''

  legDiv.innerHTML = `
      Kto wygrał leg?
      <select id="winnerMecz${meczID}Leg${numer}" class="form-select" style="width:fit-content;">
        <option value="${g1}">${g1}</option>
        <option value="${g2}">${g2}</option>
        <option value="${g3}">${g3}</option>
        <option value="${g4}">${g4}</option>
      </select><br>`
  if (numer==3) {
    legDiv.innerHTML+=`
    Kto zaczął leg?
    <select id="whoStartedLeg3Mecz${meczID}" class="form-select" style="width:fit-content;">
        <option value="${g1}">${g1}</option>
        <option value="${g2}">${g2}</option>
        <option value="${g3}">${g3}</option>
        <option value="${g4}">${g4}</option>
      </select><br>
    `
  }
  legDiv.innerHTML+=`
    
    <input type="hidden" id="winnerTeammate${meczID}Leg${numer}" value="${g2}"/>
    <input type="hidden" id="loser${meczID}Leg${numer}" value="${g3}"/>
    <input type="hidden" id="loserTeammate${meczID}Leg${numer}" value="${g4}"/>
  `;

const winnerSelect = document.getElementById(`winnerMecz${meczID}Leg${numer}`)

const refreshPlayerBlocks = () => {
    g1 = selectZawodnik1 ? selectZawodnik1.value : ''
    g2 = selectZawodnik2 ? selectZawodnik2.value : ''
    g3 = selectZawodnik3 ? selectZawodnik3.value : ''
    g4 = selectZawodnik4 ? selectZawodnik4.value : ''

    if (winnerSelect) {
        const prev = winnerSelect.value
        winnerSelect.innerHTML = ''
        [g1, g2, g3, g4].forEach(name => {
            const opt = document.createElement('option')
            opt.value = name
            opt.textContent = name
            winnerSelect.appendChild(opt)
        })

        // disable winner options not currently chosen in team selects
        const hostChosen = getSelectsForSide('host').map(s => s.value).filter(Boolean);
        const guestChosen = getSelectsForSide('guest').map(s => s.value).filter(Boolean);
        Array.from(winnerSelect.options).forEach(opt => {
            const val = opt.value;
            if (skladGospodarz && skladGospodarz.includes(val)) {
                opt.disabled = !hostChosen.includes(val);
            } else if (skladGosc && skladGosc.includes(val)) {
                opt.disabled = !guestChosen.includes(val);
            } else {
                opt.disabled = false;
            }
        });

        if (prev && Array.from(winnerSelect.options).some(o => o.value === prev && !o.disabled)) {
            winnerSelect.value = prev
        } else {
            const first = Array.from(winnerSelect.options).find(o => o.value && !o.disabled)
            if (first) winnerSelect.value = first.value
        }
    }
}

const setupPerPlayerListeners = () => {
    // No longer needed since lotki and pozostale inputs don't exist
}

  const updateLegOptions = () => {
    g1 = selectZawodnik1 ? selectZawodnik1.value : ''
    g2 = selectZawodnik2 ? selectZawodnik2.value : ''
    g3 = selectZawodnik3 ? selectZawodnik3.value : ''
    g4 = selectZawodnik4 ? selectZawodnik4.value : ''
    refreshPlayerBlocks()
  }

  if (selectZawodnik1) selectZawodnik1.addEventListener('change', updateLegOptions)
  if (selectZawodnik2) selectZawodnik2.addEventListener('change', updateLegOptions)
  if (selectZawodnik3) selectZawodnik3.addEventListener('change', updateLegOptions)
  if (selectZawodnik4) selectZawodnik4.addEventListener('change', updateLegOptions)
  
  let mecz = document.getElementById(`mecz${meczID}`)
  mecz.appendChild(legName)
  mecz.appendChild(legDiv)
  setupPerPlayerListeners()
  // initial sync and enforce disabling based on current team selections
  setTimeout(() => {
    refreshPlayerBlocks()
  }, 0)

let winner = (document.getElementById(`winnerMecz${meczID}Leg${numer}`) || {}).value
function updateHiddenInputs() {
    // Get current winner from the select element
    const currentWinner = document.getElementById(`winnerMecz${meczID}Leg${numer}`)?.value || winner;
    // Get current player values from selects (they may have changed due to substitution)
    const currentG1 = selectZawodnik1 ? selectZawodnik1.value : g1;
    const currentG2 = selectZawodnik2 ? selectZawodnik2.value : g2;
    const currentG3 = selectZawodnik3 ? selectZawodnik3.value : g3;
    const currentG4 = selectZawodnik4 ? selectZawodnik4.value : g4;
    
    switch (currentWinner) {
        case currentG1:
            document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = currentG2
            document.getElementById(`loser${meczID}Leg${numer}`).value = currentG3
            document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = currentG4
            break;
        case currentG2:
            document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = currentG1
            document.getElementById(`loser${meczID}Leg${numer}`).value = currentG3
            document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = currentG4
            break;
        case currentG3:
            document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = currentG4
            document.getElementById(`loser${meczID}Leg${numer}`).value = currentG1
            document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = currentG2
            break;
        case currentG4:
            document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = currentG3
            document.getElementById(`loser${meczID}Leg${numer}`).value = currentG1
            document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = currentG2
            break;
    }
}

// Only update hidden inputs when winner changes
const winnerSelectEl = document.getElementById(`winnerMecz${meczID}Leg${numer}`);
if (winnerSelectEl) {
    winnerSelectEl.addEventListener('change', updateHiddenInputs);
}

  sumLegHost++
  document.getElementById(`winnerMecz${meczID}Leg${numer}`).addEventListener("change", (x) => {
    x.preventDefault()
    let winnerChanged = (document.getElementById(`winnerMecz${meczID}Leg${numer}`) || {}).value
    if (skladGospodarz.includes(winner) && skladGospodarz.includes(winnerChanged));
    else if (skladGosc.includes(winner) && skladGosc.includes(winnerChanged));
    else {
      if (skladGospodarz.find((e) => e==winnerChanged)) { //nie działa ale pomysł jest dobry
        sumLegHost++; 
        sumLegGuest--;
      }
      if (skladGosc.find((e) => e==winnerChanged)) {
        sumLegGuest++; 
        sumLegHost--;
      }
    }
    winner=winnerChanged
  })
  return winner
}

document.getElementById(`zatwierdzSklady`).addEventListener("click", (x) => {
  x.preventDefault()
  document.getElementById(`kolejka`).setAttribute("disabled", "")
  document.getElementById(`date`).setAttribute("disabled", "")
  document.getElementById(`liga`).setAttribute("disabled", "")
  document.getElementById(`gospodarz`).setAttribute("disabled", "")
  document.getElementById(`gosc`).setAttribute("disabled", "")
  for (let index = 1; index <= 4; index++) {
    document.getElementById(`h${index}`).setAttribute("disabled", "")
    document.getElementById(`g${index}`).setAttribute("disabled", "")
    if (document.getElementById(`hr${index}`)) document.getElementById(`hr${index}`).setAttribute("disabled", "")
    if (document.getElementById(`gr${index}`)) document.getElementById(`gr${index}`).setAttribute("disabled", "")
  }
  
  // Initialize match functions after confirmation
  singleSimple(1);
  singleSimple(2);
  singleSimple(3);
  singleSimple(4);

  doubleSimple(5);
  doubleSimple(6);
  doubleSimple(7);
  doubleSimple(8);

  singleSimple(9);
  singleSimple(10);
  singleSimple(11);
  singleSimple(12);
})

// Track player substitutions and update subsequent matches
const setupSubstitutionTracking = () => {
  // Delegate listener on meczeAll container to catch all match player select changes
  const meczeAllContainer = document.getElementById('meczeAll');
  if (!meczeAllContainer) return;

  meczeAllContainer.addEventListener('change', (event) => {
    const changedSelect = event.target;
    
    // Check if changed element is a match player select (gracz*mecz*)
    if (!changedSelect.id || !changedSelect.id.match(/^gracz\d+mecz\d+$/)) {
      return;
    }

    const oldValue = changedSelect.getAttribute('data-previous-value');
    const newValue = changedSelect.value;
    
    // Store the new value for future comparisons
    changedSelect.setAttribute('data-previous-value', newValue);
    
    // If this is the first change, just store the value
    if (!oldValue) {
      return;
    }
    
    // Don't process if value hasn't actually changed
    if (oldValue === newValue) {
      return;
    }

    // Extract match ID from changed select
    const matchIdMatch = changedSelect.id.match(/mecz(\d+)$/);
    if (!matchIdMatch) return;
    const changedMatchId = parseInt(matchIdMatch[1]);

    // Track this substitution globally
    if (!substitutedPlayers.has(oldValue)) {
      substitutedPlayers.set(oldValue, changedMatchId);
    }

    // Determine if this is a host or guest player based on team arrays
    const isHost = (skladGospodarz || []).includes(newValue);
    
    // Get all match player selects for subsequent matches only
    const allMatchSelects = [];
    for (let matchId = changedMatchId + 1; matchId <= 12; matchId++) {
      if (matchId <= 4 || matchId >= 9) {
        // Singles matches - 2 players
        const s1 = document.getElementById(`gracz1mecz${matchId}`);
        const s2 = document.getElementById(`gracz2mecz${matchId}`);
        if (s1) allMatchSelects.push({ select: s1, matchId, isHost: true });
        if (s2) allMatchSelects.push({ select: s2, matchId, isHost: false });
      } else {
        // Doubles matches - 4 players
        const s1 = document.getElementById(`gracz1mecz${matchId}`);
        const s2 = document.getElementById(`gracz2mecz${matchId}`);
        const s3 = document.getElementById(`gracz3mecz${matchId}`);
        const s4 = document.getElementById(`gracz4mecz${matchId}`);
        if (s1) allMatchSelects.push({ select: s1, matchId, isHost: true });
        if (s2) allMatchSelects.push({ select: s2, matchId, isHost: true });
        allMatchSelects.push({ select: s3, matchId, isHost: false });
          if (s4) allMatchSelects.push({ select: s4, matchId, isHost: false });
              }
            }
            
          // Update all match selects from the same team in subsequent matches
          allMatchSelects.forEach(({ select: matchSelect, matchId: targetMatchId, isHost: matchIsHost }) => {
            // Only update selects from the same team
            if (matchIsHost !== isHost) {
              return;
            }
              
            // If this select currently has the old player selected, switch to new player
            if (matchSelect.value === oldValue) {
              matchSelect.value = newValue;
              matchSelect.setAttribute('data-previous-value', newValue);
            }
          });
            
          // Disable ALL substituted players in subsequent match player selects (both teams)
          for (let mId = changedMatchId + 1; mId <= 12; mId++) {
            const selectIds = [];
            if (mId <= 4 || mId >= 9) {
              // Singles matches
              selectIds.push(`gracz1mecz${mId}`, `gracz2mecz${mId}`);
            } else {
              // Doubles matches
              selectIds.push(`gracz1mecz${mId}`, `gracz2mecz${mId}`, `gracz3mecz${mId}`, `gracz4mecz${mId}`);
            }
            
            selectIds.forEach(selectId => {
              const matchSelect = document.getElementById(selectId);
              if (!matchSelect) return;
              
              // Disable all previously substituted players
              substitutedPlayers.forEach((substMatchId, substPlayer) => {
                if (substMatchId < mId) {
                  const opt = Array.from(matchSelect.options).find(o => o.value === substPlayer);
                  if (opt) {
                    opt.disabled = true;
                    
                    // If this select has the substituted player selected, switch to first available
                    if (matchSelect.value === substPlayer) {
                      const firstEnabled = Array.from(matchSelect.options).find(o => !o.disabled && o.value);
                      if (firstEnabled) {
                        matchSelect.value = firstEnabled.value;
                        matchSelect.setAttribute('data-previous-value', firstEnabled.value);
                        matchSelect.dispatchEvent(new Event('change', { bubbles: true }));
                      }
                    }
                  }
                }
              });
            });
          }
    // Update winner options in leg selects for subsequent matches only
    for (let mId = changedMatchId + 1; mId <= 12; mId++) {
      for (let legNum = 1; legNum <= 3; legNum++) {
      const winnerSelect = document.getElementById(`winnerMecz${mId}Leg${legNum}`);
      if (!winnerSelect) continue;
      
      const currentWinner = winnerSelect.value;
      
      // Get current match players
      let matchPlayers = [];
      if (mId <= 4 || mId >= 9) {
        // Singles
        const p1 = document.getElementById(`gracz1mecz${mId}`);
        const p2 = document.getElementById(`gracz2mecz${mId}`);
        if (p1) matchPlayers.push(p1.value);
        if (p2) matchPlayers.push(p2.value);
      } else {
        // Doubles
        const p1 = document.getElementById(`gracz1mecz${mId}`);
        const p2 = document.getElementById(`gracz2mecz${mId}`);
        const p3 = document.getElementById(`gracz3mecz${mId}`);
        const p4 = document.getElementById(`gracz4mecz${mId}`);
        if (p1) matchPlayers.push(p1.value);
        if (p2) matchPlayers.push(p2.value);
        if (p3) matchPlayers.push(p3.value);
        if (p4) matchPlayers.push(p4.value);
      }
      
      matchPlayers = matchPlayers.filter(Boolean);
      
      // Rebuild winner options
      winnerSelect.innerHTML = '';
      matchPlayers.forEach(player => {
        const opt = document.createElement('option');
        opt.value = player;
        opt.textContent = player;
        
        // Disable if player not currently chosen in team selects
        const hostChosen = getSelectsForSide('host').map(s => s.value).filter(Boolean);
        const guestChosen = getSelectsForSide('guest').map(s => s.value).filter(Boolean);
        
        if (skladGospodarz && skladGospodarz.includes(player)) {
        opt.disabled = !hostChosen.includes(player);
        } else if (skladGosc && skladGosc.includes(player)) {
        opt.disabled = !guestChosen.includes(player);
        }
        
        winnerSelect.appendChild(opt);
      });
      
      // Restore previous selection if still valid, otherwise pick first enabled
      if (currentWinner && matchPlayers.includes(currentWinner)) {
        const opt = Array.from(winnerSelect.options).find(o => o.value === currentWinner);
        if (opt && !opt.disabled) {
        winnerSelect.value = currentWinner;
        } else {
        const firstEnabled = Array.from(winnerSelect.options).find(o => !o.disabled);
        if (firstEnabled) winnerSelect.value = firstEnabled.value;
        }
      } else {
        const firstEnabled = Array.from(winnerSelect.options).find(o => !o.disabled);
        if (firstEnabled) winnerSelect.value = firstEnabled.value;
      }
      }
    }
    });

  // Initialize data-previous-value for all match selects
  for (let matchId = 1; matchId <= 12; matchId++) {
    if (matchId <= 4 || matchId >= 9) {
      ['gracz1', 'gracz2'].forEach(prefix => {
        const sel = document.getElementById(`${prefix}mecz${matchId}`);
        if (sel) sel.setAttribute('data-previous-value', sel.value);
      });
    } else {
      ['gracz1', 'gracz2', 'gracz3', 'gracz4'].forEach(prefix => {
        const sel = document.getElementById(`${prefix}mecz${matchId}`);
        if (sel) sel.setAttribute('data-previous-value', sel.value);
      });
    }
  }
};

// Track all substitutions globally (player -> matchId where they were substituted out)
const substitutedPlayers = new Map();

// Call this after matches are initialized
document.getElementById('zatwierdzSklady').addEventListener('click', () => {
  // Wait for matches to be created
  setTimeout(() => {
    setupSubstitutionTracking();
  }, 100);
});

let zawodnicy = skladGospodarz.concat(skladGosc) // teraz tak po prostu nie działa

// get currently chosen players in host and guest player selects
const chosen = getAllSelects().map(s => s.value).filter(Boolean);

// helper to (re)build options for a select from players array, disabling those not chosen
const buildOptionsAll = (selectEl, players, chosenList) => {
  if (!selectEl) return;
  const prev = selectEl.value;
  selectEl.innerHTML = '';
  players.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    // disable option when player is not currently selected in the corresponding team selects
    if (!chosenList.includes(p)) opt.disabled = true;
    if (prev && prev === p) opt.selected = true;
    selectEl.appendChild(opt);
  });
  // if nothing is selected and there is an enabled option, pick the first enabled one
  if (!selectEl.value) {
    const firstEnabled = Array.from(selectEl.options).find(o => !o.disabled);
    if (firstEnabled) selectEl.value = firstEnabled.value;
  }
};
buildOptionsAll(document.getElementById(`zawodnikWynik0`), zawodnicy, chosen);
buildOptionsAll(document.getElementById(`zawodnikLotka0`), zawodnicy, chosen);
buildOptionsAll(document.getElementById(`zawodnikSkonczenie0`), zawodnicy, chosen);



//wynik
    // utility to pick a recycled id or next counter
    function getIdFromPool(pool, nextCounterRef, prefixCheckFn) {
        // try recycled ids first (LIFO)
        while (pool.length) {
            const id = pool.pop();
            // skip if still in DOM for some reason
            if (!prefixCheckFn(id)) return id;
        }
        return nextCounterRef.value++;
    }

    let nextP = { value: 1 };
    const recycledP = [];
    const pBestRes = document.getElementById("newRow");
    document.getElementById("addRow").addEventListener("click", function () {
        const id = getIdFromPool(recycledP, nextP, (id) => !!document.getElementById(`inputPlayerRow${id}`));
        const html = `
            <div class="row g-3 py-2" id="inputPlayerRow${id}">
                <div class="col-5">
                    <select id="zawodnikWynik${id}" class="form-control" placeholder="zawodnik" autocomplete="off"></select>
                </div>
                <div class="col-6">
                    <input type="text" id="wynik${id}" class="form-control" placeholder="wynik" autocomplete="off">
                </div>
                <div class="input-group-append col-1">
                    <button id="removeRRow${id}" type="button" class="btn btn-danger">&ndash;</button>
                </div>
            </div>
        `;
        pBestRes.insertAdjacentHTML('beforeend', html);
        buildOptionsAll(document.getElementById(`zawodnikWynik${id}`), zawodnicy, chosen);
        const btn = document.getElementById(`removeRRow${id}`);
        if (btn) btn.addEventListener("click", (e) => {
            const row = e.currentTarget.closest('.row');
            if (!row) return;
            const rowId = row.id || '';
            const match = rowId.match(/inputPlayerRow(\d+)$/);
            if (match) {
                const nid = Number(match[1]);
                // avoid pushing same id multiple times
                if (!recycledP.includes(nid)) recycledP.push(nid);
            }
            row.remove();
        });
    });

    //lotki
    let nextD = { value: 1 };
    const recycledD = [];
    const pBestDarts = document.getElementById("newRow1");
    document.getElementById("addRow1").addEventListener("click", function () {
        const id = getIdFromPool(recycledD, nextD, (id) => !!document.getElementById(`inputDartRow${id}`));
        const html = `
            <div class="row g-3 py-2" id="inputDartRow${id}">
                <div class="col-5">
                    <select id="zawodnikLotka${id}" class="form-control" placeholder="zawodnik" autocomplete="off"></select>
                </div>
                <div class="col-6">
                    <input type="text" id="lotka${id}" class="form-control" placeholder="lotka" autocomplete="off">
                </div>
                <div class="input-group-append col-1">                
                    <button id="removeDRow${id}" type="button" class="btn btn-danger">&ndash;</button>
                </div>
            </div>
        `;
        pBestDarts.insertAdjacentHTML('beforeend', html);
        buildOptionsAll(document.getElementById(`zawodnikLotka${id}`), zawodnicy, chosen);
        const btn = document.getElementById(`removeDRow${id}`);
        if (btn) btn.addEventListener("click", (e) => {
            const row = e.currentTarget.closest('.row');
            if (!row) return;
            const rowId = row.id || '';
            const match = rowId.match(/inputDartRow(\d+)$/);
            if (match) {
                const nid = Number(match[1]);
                if (!recycledD.includes(nid)) recycledD.push(nid);
            }
            row.remove();
        });
    });

    //skonczenia
    let nextH = { value: 1 };
    const recycledH = [];
    const pHighEnds = document.getElementById("newRow2");
    document.getElementById("addRow2").addEventListener("click", function () {
        const id = getIdFromPool(recycledH, nextH, (id) => !!document.getElementById(`inputHighRow${id}`));
        const html = `
            <div class="row g-3 py-2" id="inputHighRow${id}">
                <div class="col-5">
                    <select id="zawodnikSkonczenie${id}" name="skonczenie_zawodnik[]" class="form-control" placeholder="zawodnik" autocomplete="off"></select>
                </div>
                <div class="col-6">
                    <input type="text" id="skonczenie${id}" name="skonczenie_wynik[]" class="form-control" placeholder="skończenie" autocomplete="off">
                </div>
                <div class="input-group-append col-1">                
                    <button id="removeHRow${id}" type="button" class="btn btn-danger">&ndash;</button>
                </div>
            </div>
        `;
        pHighEnds.insertAdjacentHTML('beforeend', html);
        buildOptionsAll(document.getElementById(`zawodnikSkonczenie${id}`), zawodnicy, chosen);
        const btn = document.getElementById(`removeHRow${id}`);
        if (btn) btn.addEventListener("click", (e) => {
            const row = e.currentTarget.closest('.row');
            if (!row) return;
            const rowId = row.id || '';
            const match = rowId.match(/inputHighRow(\d+)$/);
            if (match) {
                const nid = Number(match[1]);
                if (!recycledH.includes(nid)) recycledH.push(nid);
            }
            row.remove();
        });
    });

  form.addEventListener("submit", function(event) {
    event.preventDefault();
    var zawodnicyWyniki = []
    for (let index = 0; index < zawodnicy.length; index++) {
      zawodnicyWyniki.push(
        {
          name:zawodnicy[index],
          wonSingle:0,
          lostSingle:0,
          wonDouble:0,
          lostDouble:0,
          matchesPlayed:0,
        }
      )
    }
    var wyniki = []
    var lotki = []
    var skonczenia = []
    const regexSkonczenia = /^(100|1[0-7][0-9]|180)(,\s*(100|1[0-7][0-9]|180))*$/
    const regexLotki = /^(9|[1-9][0-9]+)(,\s*(9|[1-9][0-9]+))*$/
    const regexWynik = /^(0|[1-9][0-9]?|1[0-6][0-9]|17[0-9]|180)(,\s*(0|[1-9][0-9]?|1[0-6][0-9]|17[0-9]|180))*$/;
    for (let index = 0; index < nextP.value; index++) {
      if (zawodnicy.find((e) => e == document.getElementById(`zawodnikWynik${index}`).value)) {
        if (regexWynik.test(document.getElementById(`wynik${index}`).value)) {
          let obj = {
            zawodnik: document.getElementById(`zawodnikWynik${index}`).value,
            wynik: document.getElementById(`wynik${index}`).value
          }
          wyniki.push(obj)
        } 
      }
    }
    for (let index = 0; index < nextD.value; index++) {
      if (zawodnicy.find((e) => e == document.getElementById(`zawodnikLotka${index}`).value)) {
        if (regexLotki.test(document.getElementById(`lotka${index}`).value)) {
          let obj = {
            zawodnik: document.getElementById(`zawodnikLotka${index}`).value,
            lotka: document.getElementById(`lotka${index}`).value
          }
          lotki.push(obj)
        }
      }
    }
    for (let index = 0; index < nextH.value; index++) {
      if (zawodnicy.find((e) => e == document.getElementById(`zawodnikSkonczenie${index}`).value)) {
        if (regexSkonczenia.test(document.getElementById(`skonczenie${index}`).value)) {
          let obj = {
          zawodnik: document.getElementById(`zawodnikSkonczenie${index}`).value,
          skonczenie: document.getElementById(`skonczenie${index}`).value
          }
          skonczenia.push(obj)
        }
    }}
    let hostTotalPoints = 0
    let guestTotalPoints = 0
    let raport = `
    ${document.getElementById(`kolejka`).value} Kolejka - ${document.getElementById(`date`).value}<br>
    ${document.getElementById(`gospodarz`).value} - ${document.getElementById(`gosc`).value}  ${sumLegHost} - ${sumLegGuest}<br>
    ${document.getElementById(`gospodarz`).value}:<br>
    H1: ${document.getElementById("h1").value} // <span id="wonTotal${document.getElementById("h1").value}"></span>-<span id="lostTotal${document.getElementById("h1").value}"></span> / <span id="matchesPlayed${document.getElementById("h1").value}"></span> (<span id="wonSingle${document.getElementById("h1").value}"></span>/<span id="lostSingle${document.getElementById("h1").value}"></span> single, <span id="wonDouble${document.getElementById("h1").value}"></span>/<span id="lostDouble${document.getElementById("h1").value}"></span> deble)<br>
    <span id="${document.getElementById("h1").value}"></span>
    H2: ${document.getElementById("h2").value} // <span id="wonTotal${document.getElementById("h2").value}"></span>-<span id="lostTotal${document.getElementById("h2").value}"></span> / <span id="matchesPlayed${document.getElementById("h2").value}"></span> (<span id="wonSingle${document.getElementById("h2").value}"></span>/<span id="lostSingle${document.getElementById("h2").value}"></span> single, <span id="wonDouble${document.getElementById("h2").value}"></span>/<span id="lostDouble${document.getElementById("h2").value}"></span> deble)<br>
    <span id="${document.getElementById("h2").value}"></span>
    H3: ${document.getElementById("h3").value} // <span id="wonTotal${document.getElementById("h3").value}"></span>-<span id="lostTotal${document.getElementById("h3").value}"></span> / <span id="matchesPlayed${document.getElementById("h3").value}"></span> (<span id="wonSingle${document.getElementById("h3").value}"></span>/<span id="lostSingle${document.getElementById("h3").value}"></span> single, <span id="wonDouble${document.getElementById("h3").value}"></span>/<span id="lostDouble${document.getElementById("h3").value}"></span> deble)<br>
    <span id="${document.getElementById("h3").value}"></span>
    H4: ${document.getElementById("h4").value} // <span id="wonTotal${document.getElementById("h4").value}"></span>-<span id="lostTotal${document.getElementById("h4").value}"></span> / <span id="matchesPlayed${document.getElementById("h4").value}"></span> (<span id="wonSingle${document.getElementById("h4").value}"></span>/<span id="lostSingle${document.getElementById("h4").value}"></span> single, <span id="wonDouble${document.getElementById("h4").value}"></span>/<span id="lostDouble${document.getElementById("h4").value}"></span> deble)<br>
    <span id="${document.getElementById("h4").value}"></span>`
    for (let index = 1; index <= 4; index++) {
      if (document.getElementById(`hr${index}`) && document.getElementById(`hr${index}`).value!="") {
        raport+=`HR${index}: ${document.getElementById(`hr${index}`).value} // <span id="wonTotal${document.getElementById(`hr${index}`).value}"></span>-<span id="lostTotal${document.getElementById(`hr${index}`).value}"></span> / <span id="matchesPlayed${document.getElementById(`hr${index}`).value}"></span> (<span id="wonSingle${document.getElementById(`hr${index}`).value}"></span>/<span id="lostSingle${document.getElementById(`hr${index}`).value}"></span> single, <span id="wonDouble${document.getElementById(`hr${index}`).value}"></span>/<span id="lostDouble${document.getElementById(`hr${index}`).value}"></span> deble)<br>
        <span id="${document.getElementById(`hr${index}`).value}"></span>`
      }
    }
    raport+=`
    ${document.getElementById(`gosc`).value}:<br>
    G1: ${document.getElementById("g1").value} // <span id="wonTotal${document.getElementById("g1").value}"></span>-<span id="lostTotal${document.getElementById("g1").value}"></span> / <span id="matchesPlayed${document.getElementById("g1").value}"></span> (<span id="wonSingle${document.getElementById("g1").value}"></span>/<span id="lostSingle${document.getElementById("g1").value}"></span> single, <span id="wonDouble${document.getElementById("g1").value}"></span>/<span id="lostDouble${document.getElementById("g1").value}"></span> deble)<br>
    <span id="${document.getElementById("g1").value}"></span>
    G2: ${document.getElementById("g2").value} // <span id="wonTotal${document.getElementById("g2").value}"></span>-<span id="lostTotal${document.getElementById("g2").value}"></span> / <span id="matchesPlayed${document.getElementById("g2").value}"></span> (<span id="wonSingle${document.getElementById("g2").value}"></span>/<span id="lostSingle${document.getElementById("g2").value}"></span> single, <span id="wonDouble${document.getElementById("g2").value}"></span>/<span id="lostDouble${document.getElementById("g2").value}"></span> deble)<br>
    <span id="${document.getElementById("g2").value}"></span>
    G3: ${document.getElementById("g3").value} // <span id="wonTotal${document.getElementById("g3").value}"></span>-<span id="lostTotal${document.getElementById("g3").value}"></span> / <span id="matchesPlayed${document.getElementById("g3").value}"></span> (<span id="wonSingle${document.getElementById("g3").value}"></span>/<span id="lostSingle${document.getElementById("g3").value}"></span> single, <span id="wonDouble${document.getElementById("g3").value}"></span>/<span id="lostDouble${document.getElementById("g3").value}"></span> deble)<br>
    <span id="${document.getElementById("g3").value}"></span>
    G4: ${document.getElementById("g4").value} // <span id="wonTotal${document.getElementById("g4").value}"></span>-<span id="lostTotal${document.getElementById("g4").value}"></span> / <span id="matchesPlayed${document.getElementById("g4").value}"></span> (<span id="wonSingle${document.getElementById("g4").value}"></span>/<span id="lostSingle${document.getElementById("g4").value}"></span> single, <span id="wonDouble${document.getElementById("g4").value}"></span>/<span id="lostDouble${document.getElementById("g4").value}"></span> deble)<br>
    <span id="${document.getElementById("g4").value}"></span>
    `
    for (let index = 1; index <= 4; index++) {
      if (document.getElementById(`gr${index}`) && document.getElementById(`gr${index}`).value!="") {
        raport+=`GR${index}: ${document.getElementById(`gr${index}`).value} // <span id="wonTotal${document.getElementById(`gr${index}`).value}"></span>-<span id="lostTotal${document.getElementById(`gr${index}`).value}"></span> / <span id="matchesPlayed${document.getElementById(`gr${index}`).value}"></span> (<span id="wonSingle${document.getElementById(`gr${index}`).value}"></span>/<span id="lostSingle${document.getElementById(`gr${index}`).value}"></span> single, <span id="wonDouble${document.getElementById(`gr${index}`).value}"></span>/<span id="lostDouble${document.getElementById(`gr${index}`).value}"></span> deble)<br>
        <span id="${document.getElementById(`gr${index}`).value}"></span>`
      }
    }
    raport+=`Przebieg meczu szczegóły:<br>`
    for (let index = 1; index <= 4; index++) {
      let hostPoints = 0
      let guestPoints = 0
      const winner1 = document.getElementById(`winnerMecz${index}Leg1`).value;
      const loser1 = Array.from(document.getElementById(`winnerMecz${index}Leg1`).options)
        .find(opt => opt.value !== winner1)?.value || 'unknown';
      const winner2 = document.getElementById(`winnerMecz${index}Leg2`).value;
      const loser2 = Array.from(document.getElementById(`winnerMecz${index}Leg2`).options)
        .find(opt => opt.value !== winner2)?.value || 'unknown';

      if (skladGospodarz.find((e) => e==winner1)) {
        hostTotalPoints+=1
        hostPoints+=1
      }
      if (skladGospodarz.find((e) => e==winner2)) {
        hostTotalPoints+=1
        hostPoints+=1
      }
      if (skladGosc.find((e) => e==winner1)) {
        guestTotalPoints+=1
        guestPoints+=1
      }
      if (skladGosc.find((e) => e==winner2)) {
        guestTotalPoints+=1
        guestPoints+=1
      }
     raport += `
      ${document.getElementById(`gracz1mecz${index}`).value} - ${document.getElementById(`gracz2mecz${index}`).value} (${hostPoints}:${guestPoints}) ---- ${hostTotalPoints}:${guestTotalPoints}<br>
      - Leg1: Wygrał: ${winner1} | Przegrał: ${loser1} <br>
      - Leg2: Wygrał: ${winner2} | Przegrał: ${loser2} <br>
      `
      if (document.getElementById(`mecz${index}leg3`)) {
      const winner3 = document.getElementById(`winnerMecz${index}Leg3`).value;
      const loser3 = Array.from(document.getElementById(`winnerMecz${index}Leg3`).options)
        .find(opt => opt.value !== winner3)?.value || 'unknown';
        if (skladGospodarz.find((e) => e==winner3)) {
          hostTotalPoints+=1
          hostPoints+=1
        }
        if (skladGosc.find((e) => e==winner3)) {
          guestTotalPoints+=1
          guestPoints+=1
        }
        raport += `- Leg 3: Zaczął: ${document.getElementById(`whoStartedLeg3Mecz${index}`).value} Wygrał: ${winner3} | Przegrał: ${loser3} <br>`
        for (let i = 0; i < zawodnicyWyniki.length; i++) {
          if (zawodnicyWyniki[i].name == winner3) {
            zawodnicyWyniki[i].wonSingle++; 
          }
          if (zawodnicyWyniki[i].name == loser3) {
            zawodnicyWyniki[i].lostSingle++; 
          }
        }  
      } 
      for (let i = 0; i < zawodnicyWyniki.length; i++) {
        if (zawodnicyWyniki[i].name == winner1) {
          zawodnicyWyniki[i].wonSingle++; 
          zawodnicyWyniki[i].matchesPlayed++; 
        }
        if (zawodnicyWyniki[i].name == loser1) {
          zawodnicyWyniki[i].lostSingle++; 
          zawodnicyWyniki[i].matchesPlayed++; 
        }
        if (zawodnicyWyniki[i].name == winner2) {
          zawodnicyWyniki[i].wonSingle++; 
        }
        if (zawodnicyWyniki[i].name == loser2) {
          zawodnicyWyniki[i].lostSingle++; 
        }
      }
    }
      ///////////////////////////////////////////////////////////////////////
    for (let index = 5; index <= 8; index++) {      
      let hostPoints = 0
      let guestPoints = 0
      const winner1 = document.getElementById(`winnerMecz${index}Leg1`).value;
      const winnerTeammate1 = document.getElementById(`winnerTeammate${index}Leg1`).value;
      const loser1 = document.getElementById(`loser${index}Leg1`).value
      const loserTeammate1 = document.getElementById(`loserTeammate${index}Leg1`).value
      const winner2 = document.getElementById(`winnerMecz${index}Leg2`).value;
      const winnerTeammate2 = document.getElementById(`winnerTeammate${index}Leg2`).value;
      const loser2 = document.getElementById(`loser${index}Leg2`).value
      const loserTeammate2 = document.getElementById(`loserTeammate${index}Leg2`).value
      if (skladGospodarz.find((e) => e==winner1)) {
        hostTotalPoints+=1
        hostPoints+=1
      }
      if (skladGospodarz.find((e) => e==winner2)) {
        hostTotalPoints+=1
        hostPoints+=1
      }
      if (skladGosc.find((e) => e==winner1)) {
        guestTotalPoints+=1
        guestPoints+=1
      }
      if (skladGosc.find((e) => e==winner2)) {
        guestTotalPoints+=1
        guestPoints+=1
      }
    raport += `
      ${document.getElementById(`gracz1mecz${index}`).value}, ${document.getElementById(`gracz2mecz${index}`).value} - ${document.getElementById(`gracz3mecz${index}`).value}, ${document.getElementById(`gracz4mecz${index}`).value} (${hostPoints}:${guestPoints}) ---- ${hostTotalPoints}:${guestTotalPoints}<br>
      - Leg1: Wygrał: ${winner1} | ${winnerTeammate1} <br>
      Przegrali: ${loser1} | ${loserTeammate1} <br>
      - Leg2: Wygrał: ${winner2} | ${winnerTeammate2} <br>
      Przegrali: ${loser2} | ${loserTeammate2} <br>
      `;

    if (document.getElementById(`mecz${index}leg3`)) {
      const winner3 = document.getElementById(`winnerMecz${index}Leg3`).value;
      const winnerTeammate3 = document.getElementById(`winnerTeammate${index}Leg3`).value;
      const loser3 = document.getElementById(`loser${index}Leg3`).value
      const loserTeammate3 = document.getElementById(`loserTeammate${index}Leg3`).value
      if (skladGospodarz.find((e) => e==winner3)) {
        hostTotalPoints+=1
        hostPoints+=1
      }
      if (skladGosc.find((e) => e==winner3)) {
        guestTotalPoints+=1
        guestPoints+=1
      }
      
      raport+=`
      Leg3: Rozpoczął ${document.getElementById(`whoStartedLeg3Mecz${index}`).value}<br> // 
      Wygrali: ${winner3} | ${winnerTeammate3} <br> 
      Przegrali: ${loser3} | ${loserTeammate3} <br>
      `
      for (let i = 0; i < zawodnicyWyniki.length; i++) {
          if (zawodnicyWyniki[i].name == winner3) {
            zawodnicyWyniki[i].wonDouble++; 
          }
          if (zawodnicyWyniki[i].name == loser3) {
            zawodnicyWyniki[i].lostDouble++; 
          }
          if (zawodnicyWyniki[i].name == winnerTeammate3) {
            zawodnicyWyniki[i].wonDouble++; 
          }
          if (zawodnicyWyniki[i].name == loserTeammate3) {
            zawodnicyWyniki[i].lostDouble++; 
          }
      }
    } 
    for (let i = 0; i < zawodnicyWyniki.length; i++) {
        if (zawodnicyWyniki[i].name == winner1) {
          zawodnicyWyniki[i].wonDouble++; 
          zawodnicyWyniki[i].matchesPlayed++
        }
        if (zawodnicyWyniki[i].name == loser1) {
          zawodnicyWyniki[i].lostDouble++; 
          zawodnicyWyniki[i].matchesPlayed++
        }
        if (zawodnicyWyniki[i].name == winnerTeammate1) {
          zawodnicyWyniki[i].wonDouble++; 
          zawodnicyWyniki[i].matchesPlayed++
        }
        if (zawodnicyWyniki[i].name == loserTeammate1) {
          zawodnicyWyniki[i].lostDouble++; 
          zawodnicyWyniki[i].matchesPlayed++
        }

        if (zawodnicyWyniki[i].name == winner2) {
          zawodnicyWyniki[i].wonDouble++; 
        }
        if (zawodnicyWyniki[i].name == loser2) {
          zawodnicyWyniki[i].lostDouble++; 
        }
        if (zawodnicyWyniki[i].name == winnerTeammate2) {
          zawodnicyWyniki[i].wonDouble++; 
        }
        if (zawodnicyWyniki[i].name == loserTeammate2) {
          zawodnicyWyniki[i].lostDouble++; 
        }
      }
    }
      ///////////////////////////////////////////////////////////////////////
    for (let index = 9; index <= 12; index++) {
      let hostPoints = 0
      let guestPoints = 0
      const winner1 = document.getElementById(`winnerMecz${index}Leg1`).value;
      const loser1 = Array.from(document.getElementById(`winnerMecz${index}Leg1`).options)
        .find(opt => opt.value !== winner1)?.value || 'unknown';
      const winner2 = document.getElementById(`winnerMecz${index}Leg2`).value;
      const loser2 = Array.from(document.getElementById(`winnerMecz${index}Leg2`).options)
        .find(opt => opt.value !== winner2)?.value || 'unknown';
      if (skladGospodarz.find((e) => e==winner1)) {
        hostTotalPoints+=1
        hostPoints+=1
      }
      if (skladGospodarz.find((e) => e==winner2)) {
        hostTotalPoints+=1
        hostPoints+=1
      }
      if (skladGosc.find((e) => e==winner1)) {
        guestTotalPoints+=1
        guestPoints+=1
      }
      if (skladGosc.find((e) => e==winner2)) {
        guestTotalPoints+=1
        guestPoints+=1
      }
      
      raport += `
      ${document.getElementById(`gracz1mecz${index}`).value} - ${document.getElementById(`gracz2mecz${index}`).value} (${hostPoints}:${guestPoints}) ---- ${hostTotalPoints}:${guestTotalPoints}<br>
      - Leg1: Wygrał: ${winner1} | Przegrał: ${loser1} <br>
      - Leg2: Wygrał: ${winner2} | Przegrał: ${loser2} <br>
      `
      if (document.getElementById(`mecz${index}leg3`)) {
        const winner3 = document.getElementById(`winnerMecz${index}Leg3`).value;
        const loser3 = Array.from(document.getElementById(`winnerMecz${index}Leg3`).options)
          .find(opt => opt.value !== winner3)?.value || 'unknown';
        if (skladGospodarz.find((e) => e==winner3)) {
          hostTotalPoints+=1
          hostPoints+=1
        }
        if (skladGosc.find((e) => e==winner3)) {
          guestTotalPoints+=1
          guestPoints+=1
        }
     
        raport += `- Leg 3: Zaczął: ${document.getElementById(`whoStartedLeg3Mecz${index}`).value} Wygrał: ${winner3} | Przegrał: ${loser3} <br>`
        for (let i = 0; i < zawodnicyWyniki.length; i++) {
          if (zawodnicyWyniki[i].name == winner3) {
            zawodnicyWyniki[i].wonSingle++; 
          }
          if (zawodnicyWyniki[i].name == loser3) {
            zawodnicyWyniki[i].lostSingle++; 
          }
        }  

      }
      for (let i = 0; i < zawodnicyWyniki.length; i++) {
        if (zawodnicyWyniki[i].name == winner1) {
          zawodnicyWyniki[i].wonSingle++; 
          zawodnicyWyniki[i].matchesPlayed++; 
        }
        if (zawodnicyWyniki[i].name == loser1) {
          zawodnicyWyniki[i].lostSingle++; 
          zawodnicyWyniki[i].matchesPlayed++; 
        }
        if (zawodnicyWyniki[i].name == winner2) {
          zawodnicyWyniki[i].wonSingle++; 
        }
        if (zawodnicyWyniki[i].name == loser2) {
          zawodnicyWyniki[i].lostSingle++; 
        }
      }
    } 
    raport+=document.getElementById(`adnotacje`).value
    document.body.innerHTML=raport
    // Process wyniki (best results)
    const wynikElements = new Set();
    for (let index = 0; index < wyniki.length; index++) {
      if (zawodnicy.find((e) => e == wyniki[index].zawodnik)) {
      let el = wyniki[index].zawodnik;
      wynikElements.add(el);
      if (!document.getElementById(`${el}`).innerHTML.includes('Najlepszy wynik:')) {
        document.getElementById(`${el}`).innerHTML += `Najlepszy wynik: `;
      }
      document.getElementById(`${el}`).innerHTML += `${wyniki[index].wynik}, `;
      }
    }
    // Add <br> after wyniki section for each player
    wynikElements.forEach(el => {
      document.getElementById(`${el}`).innerHTML += `<br>`;
    });

    // Process lotki (best darts)
    const lotkiElements = new Set();
    for (let index = 0; index < lotki.length; index++) {
      if (zawodnicy.find((e) => e == lotki[index].zawodnik)) {
      let el = lotki[index].zawodnik;
      lotkiElements.add(el);
      if (!document.getElementById(`${el}`).innerHTML.includes('Najlepsza lotka:')) {
        document.getElementById(`${el}`).innerHTML += `Najlepsza lotka: `;
      }
      document.getElementById(`${el}`).innerHTML += `${lotki[index].lotka}, `;
      }
    }
    // Add <br> after lotki section for each player
    lotkiElements.forEach(el => {
      document.getElementById(`${el}`).innerHTML += `<br>`;
    });

    // Process skonczenia (high finishes)
    const skonczeniaElements = new Set();
    for (let index = 0; index < skonczenia.length; index++) {
      if (zawodnicy.find((e) => e == skonczenia[index].zawodnik)) {
      let el = skonczenia[index].zawodnik;
      skonczeniaElements.add(el);
      if (!document.getElementById(`${el}`).innerHTML.includes('Najwyższe skończenie:')) {
        document.getElementById(`${el}`).innerHTML += `Najwyższe skończenie: `;
      }
      document.getElementById(`${el}`).innerHTML += `${skonczenia[index].skonczenie}, `;
      }
    }
    // Add <br> after skonczenia section for each player
    skonczeniaElements.forEach(el => {
      document.getElementById(`${el}`).innerHTML += `<br>`;
    });
    for (let index = 0; index < zawodnicyWyniki.length; index++) {
      if (document.getElementById(`wonTotal${zawodnicyWyniki[index].name}`)) document.getElementById(`wonTotal${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].wonSingle+zawodnicyWyniki[index].wonDouble
      if (document.getElementById(`lostTotal${zawodnicyWyniki[index].name}`)) document.getElementById(`lostTotal${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].lostSingle+zawodnicyWyniki[index].lostDouble
      if (document.getElementById(`wonSingle${zawodnicyWyniki[index].name}`)) document.getElementById(`wonSingle${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].wonSingle
      if (document.getElementById(`lostSingle${zawodnicyWyniki[index].name}`)) document.getElementById(`lostSingle${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].lostSingle
      if (document.getElementById(`wonDouble${zawodnicyWyniki[index].name}`)) document.getElementById(`wonDouble${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].wonDouble
      if (document.getElementById(`lostDouble${zawodnicyWyniki[index].name}`)) document.getElementById(`lostDouble${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].lostDouble
      if (document.getElementById(`matchesPlayed${zawodnicyWyniki[index].name}`)) document.getElementById(`matchesPlayed${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].matchesPlayed
    }
    console.log(zawodnicyWyniki)
});
}
);

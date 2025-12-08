//DISCLAIMER: jeśli ktokolwiek będzie tu zaglądał proszę wyjebać nazewnictwo zmiennych do kosza bo sam nie wiem co jest czym
const ligi = JSON.parse(`[{"liga": "ekstraklasa",
"druzyny":
[{"nazwa": "sernik", "kapitan":"A", "zawodnicy":["A","B","C","D","A2","B2","C2","D2"], "lokal":"lodówka", "adres":"kuchnia", "sponsorzy":""},
{"nazwa": "roztocza" , "kapitan":"E", "zawodnicy":["E","F","G","H","E2","F2","G2","H2"], "lokal":"dywan", "adres":"podłoga", "sponsorzy":""}, 
{"nazwa": "pliki" , "kapitan":"I", "zawodnicy":["I","J","K","L","I2","J2","K2","L2"], "lokal":"folder", "adres":"dysk", "sponsorzy":""},
{"nazwa": "switche" , "kapitan":"M", "zawodnicy":["M","N","O","P","M2","N2","O2","P2"], "lokal":"klawiatura", "adres":"biurko", "sponsorzy":""}
]},
{"liga": "1 liga",
"druzyny":
[{"nazwa": "SERNIK", "kapitan":"A", "zawodnicy":["A","B","C","D","A2","B2","C2","D2"], "lokal":"lodówka", "adres":"kuchnia", "sponsorzy":""},
{"nazwa": "roztocza" , "kapitan":"E", "zawodnicy":["E","F","G","H","E2","F2","G2","H2"], "lokal":"dywan", "adres":"podłoga", "sponsorzy":""}, 
{"nazwa": "pliki" , "kapitan":"I", "zawodnicy":["I","J","K","L","I2","J2","K2","L2"], "lokal":"folder", "adres":"dysk", "sponsorzy":""},
{"nazwa": "switche" , "kapitan":"M", "zawodnicy":["M","N","O","P","M2","N2","O2","P2"], "lokal":"klawiatura", "adres":"biurko", "sponsorzy":""}]}]`)

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
  ligaSelect.addEventListener("change", (x) => {
    x.preventDefault()
    ligaVal = ligaSelect.value 
    
  }) // event listener na zmiane ligi

  var sumLegHost = 0
  var sumLegGuest = 0
  document.getElementById(`date`).valueAsDate = new Date();
  document.getElementById(`zatwierdzSklady`).addEventListener("click", (x) => {
    x.preventDefault()
    document.getElementById(`kolejka`).setAttribute("disabled", "")
    document.getElementById(`date`).setAttribute("disabled", "")
    document.getElementById(`liga`).setAttribute("disabled", "")
    document.getElementById(`gospodarz`).setAttribute("disabled", "")
    document.getElementById(`gosc`).setAttribute("disabled", "")
    document.getElementById(`dodajHostRezerwowy`).disabled=true;
    document.getElementById(`dodajGoscRezerwowy`).disabled=true;
    for (let index = 1; index <= 4; index++) {
      document.getElementById(`h${index}`).setAttribute("disabled", "")
      document.getElementById(`g${index}`).setAttribute("disabled", "")
      if (document.getElementById(`hr${index}`)) document.getElementById(`hr${index}`).setAttribute("disabled", "")
      if (document.getElementById(`gr${index}`)) document.getElementById(`gr${index}`).setAttribute("disabled", "")
    }
  })

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

  // populate team selects
  for (let index = 0; index < ligi[ligaVal].druzyny.length; index++) {
    gospodarz.innerHTML += `<option value="${ligi[ligaVal].druzyny[index].nazwa}">${ligi[ligaVal].druzyny[index].nazwa}</option>`;
    gosc.innerHTML += `<option value="${ligi[ligaVal].druzyny[index].nazwa}">${ligi[ligaVal].druzyny[index].nazwa}</option>`;
  }
  setOptionValues(gospodarz);
  setOptionValues(gosc);

  // keep references used later
  const meczeAll = document.getElementById("meczeAll");
  var skladGospodarz, skladGosc;

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

  /////////////////////// jeszcze nie działa przy zmianie zawodnika w składzie, kiedy ten jest w meczu
function single(meczID) {
  const mecz = document.createElement("div");
  mecz.id = `mecz${meczID}`;
  mecz.className = "row";
  mecz.innerHTML = `
  <div class="mb-3  mt-5 btn btn-mecz text-white">Pojedynek ${meczID}:<br>typ: "Singiel"
  </div>
  <div class="col-sm-4" style="margin:auto">
  Zawodnik 1:
  <select id="gracz1mecz${meczID}" class="form-select">
  </select>
  </div>
  <div class="col-sm-4" style="margin:auto">
  Zawodnik 2:
  <select id="gracz2mecz${meczID}" class="form-select">
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
    const buildOptions = (selectEl, players, chosenList) => {
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

    buildOptions(selectZawodnik1, Array.isArray(skladGospodarz) ? skladGospodarz : [], hostChosen);
    buildOptions(selectZawodnik2, Array.isArray(skladGosc) ? skladGosc : [], guestChosen);
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
  let leg1Val = leg(meczID, 1);
  let leg2Val = leg(meczID, 2);
  let leg3Val;

  // helper to read current values from DOM for a given leg number
  const getLegValues = (n) => {
    const wEl = document.getElementById(`winnerMecz${meczID}Leg${n}`);
    const lEl = document.getElementById(`lotkaMecz${meczID}Leg${n}`);
    const pEl = document.getElementById(`pozostaleMecz${meczID}Leg${n}`);
    
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
      lEl ? lEl.value : null,
      pEl ? pEl.value : null
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
        leg3Val = leg(meczID, 3);
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

function leg(meczID, numer) {
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
    legDiv.innerHTML+=`Kto zaczął lega? 
    <select id="whoStartedLeg3Mecz${meczID}" class="form-select" style="width:fit-content;">
    <option value="${g1}">${g1}</option>
    <option value="${g2}">${g2}</option>
    </select><br>`
  }
  legDiv.innerHTML+=`
  Którą lotką wygrano lega?
  <input type="number" id="lotkaMecz${meczID}Leg${numer}" class="form-control" value="9" min="9" step="1" required><br>
  Ile lotek rzucił przegrany?
  <input type="number" id="lotkaPrzegranyMecz${meczID}Leg${numer}" class="form-control" value="9" min="9" step="1" required><br>
  Ile pozostało punktów przegranemu?
  <input type="number" id="pozostaleMecz${meczID}Leg${numer}" class="form-control" value="501" min="2" max="501" step="1" required>
  <br>`;
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
      legDiv.innerHTML+=`Kto zaczął lega? 
    <select id="whoStartedLeg3Mecz${meczID}" class="form-select" style="width:fit-content;">
    <option value="${g1}">${g1}</option>
    <option value="${g2}">${g2}</option>
    </select><br>`
    }
    legDiv.innerHTML+=`Którą lotką wygrano lega?
      <input type="number" id="lotkaMecz${meczID}Leg${numer}" class="form-control" value="9" min="9" step="1" required><br>
      Ile lotek rzucił przegrany?
      <input type="number" id="lotkaPrzegranyMecz${meczID}Leg${numer}" class="form-control" value="9" min="1" step="1" required><br>
      Ile pozostało punktów przeciwnikowi?
      <input type="number" id="pozostaleMecz${meczID}Leg${numer}" class="form-control" value="501" min="2" max="501" step="1" required>
      <br>`
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
      legDiv.innerHTML+=`Kto zaczął lega? 
    <select id="whoStartedLeg3Mecz${meczID}" class="form-select" style="width:fit-content;">
    <option value="${g1}">${g1}</option>
    <option value="${g2}">${g2}</option>
    </select><br>`
    }
    legDiv.innerHTML+=`Którą lotką wygrano lega?
      <input type="number" id="lotkaMecz${meczID}Leg${numer}" min="9" step="1" required><br>
      Ile lotek rzucił przegrany?
      <input type="number" id="lotkaPrzegranyMecz${meczID}Leg${numer}" min="9" step="1" required><br>
      Ile pozostało punktów przeciwnikowi?
      <input type="number" id="pozostaleMecz${meczID}Leg${numer}" min="2" max="501" step="1" required>
      <br>`
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

function double(meczID) {
  const mecz = document.createElement("div");
  mecz.id = `mecz${meczID}`;
  mecz.className = "row";
  mecz.innerHTML = `
  <div class="mb-3  mt-5 btn btn-mecz text-white">Pojedynek ${meczID}:<br>typ: "Pary - Liga"
  </div>
  <div class="col-sm-2" style="margin:auto">
  Zawodnik 1:
  <select id="gracz1mecz${meczID}" class="form-select">
  </select>
  </div>
  <div class="col-sm-2" style="margin:auto">
  Zawodnik 2:
  <select id="gracz2mecz${meczID}" class="form-select">
  </select>
  </div>
  <div class="col-sm-2" style="margin:auto">
  Zawodnik 3:
  <select id="gracz3mecz${meczID}" class="form-select">
  </select>
  </div>
  <div class="col-sm-2" style="margin:auto">
  Zawodnik 4:
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

    buildOptions(selectZawodnik1, Array.isArray(skladGospodarz) ? skladGospodarz : [], hostChosen, 0);
    buildOptions(selectZawodnik2, Array.isArray(skladGospodarz) ? skladGospodarz : [], hostChosen, 1);
    buildOptions(selectZawodnik3, Array.isArray(skladGosc) ? skladGosc : [], guestChosen, 0);
    buildOptions(selectZawodnik4, Array.isArray(skladGosc) ? skladGosc : [], guestChosen, 1);

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

    // also update any winner selects built for legs so they reflect currently chosen players
    // disable winner options that are no longer selected in team selects
    const updateWinnerOptionsForMatch = () => {
      const winnerSelectors = Array.from(document.querySelectorAll(`#mecz${meczID} select[id^="winnerMecz${meczID}Leg"]`));
      winnerSelectors.forEach(wEl => {
        const prev = wEl.value;
        Array.from(wEl.options).forEach(opt => {
          const val = opt.value;
          if (skladGospodarz && skladGospodarz.includes(val)) {
            opt.disabled = !hostChosen.includes(val);
          } else if (skladGosc && skladGosc.includes(val)) {
            opt.disabled = !guestChosen.includes(val);
          } else {
            opt.disabled = false;
          }
        });
        if (wEl.options.length && wEl.selectedOptions.length === 0) {
          const firstEnabled = Array.from(wEl.options).find(o => !o.disabled);
          if (firstEnabled) wEl.value = firstEnabled.value;
        }
        // if previously selected option became disabled, pick another
        if (prev && Array.from(wEl.options).every(o => o.value !== prev || o.disabled)) {
          const firstEnabled = Array.from(wEl.options).find(o => !o.disabled);
          if (firstEnabled) wEl.value = firstEnabled.value;
        }
      });
    };
    updateWinnerOptionsForMatch();
  };

  updateMatchPlayerOptions();

  document.addEventListener('change', (ev) => {
    const id = ev.target && ev.target.id;
    if (!id) return;
    if (/^(h|hr|g|gr)\d/.test(id) || id === 'gospodarz' || id === 'gosc') {
      updateMatchPlayerOptions();
    }
  });
  let leg1Val = legDouble(meczID, 1);
  let leg2Val = legDouble(meczID, 2);
  let leg3Val;

  const getLegValues = (n) => {
    const wEl = document.getElementById(`winnerMecz${meczID}Leg${n}`);
    const lEl = document.getElementById(`lotkaMecz${meczID}Leg${n}`);
    const pEl = document.getElementById(`pozostaleMecz${meczID}Leg${n}`);
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
      lEl ? lEl.value : null,
      pEl ? pEl.value : null
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
        leg3Val = legDouble(meczID, 3);
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

function legDouble(meczID, numer) {
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
      <select id="winnerMecz${meczID}Leg${numer}" class="form-select">
        <option value="${g1}">${g1}</option>
        <option value="${g2}">${g2}</option>
        <option value="${g3}">${g3}</option>
        <option value="${g4}">${g4}</option>
      </select><br>`
  if (numer==3) {
    legDiv.innerHTML+=`
    Kto zaczął lega?
    <select id="whoStartedLeg3Mecz${meczID}" class="form-select">
        <option value="${g1}">${g1}</option>
        <option value="${g2}">${g2}</option>
        <option value="${g3}">${g3}</option>
        <option value="${g4}">${g4}</option>
      </select><br>
    `
  }
  legDiv.innerHTML+=`
    <div id="playerInputsMecz${meczID}Leg${numer}">
      <div class="player-block" data-idx="1">
        <label>${g1}</label>
        rzucone lotki: <input type="number" value="9" min="1" id="lotkaMecz${meczID}Leg${numer}P1" class="form-control player-lotka" required/>
        Pozostało punktów: <input type="number" value="0" min="0" max="501" id="pozostaleMecz${meczID}Leg${numer}P1" class="form-control player-pozostale" disabled/>
      </div>
      <div class="player-block" data-idx="2">
        <label>${g2}</label>
        rzucone lotki: <input type="number" value="9" min="1" id="lotkaMecz${meczID}Leg${numer}P2" class="form-control player-lotka" required/>
        Pozostało punktów: <input type="number" value="501" min="0" max="501" id="pozostaleMecz${meczID}Leg${numer}P2" class="form-control player-pozostale" required/>
      </div>
      <div class="player-block" data-idx="3">
        <label>${g3}</label>
        rzucone lotki: <input type="number" value="9" min="1" id="lotkaMecz${meczID}Leg${numer}P3" class="form-control player-lotka" required/>
        Pozostało punktów: <input type="number" value="501" min="0" max="501" id="pozostaleMecz${meczID}Leg${numer}P3" class="form-control player-pozostale" required/>
      </div>
      <div class="player-block" data-idx="4">
        <label>${g4}</label>
        rzucone lotki: <input type="number" value="9" min="1" id="lotkaMecz${meczID}Leg${numer}P4" class="form-control player-lotka" required/>
        Pozostało punktów: <input type="number" value="501" min="0" max="501" id="pozostaleMecz${meczID}Leg${numer}P4" class="form-control player-pozostale" required/>
      </div>
    </div>
    <input type="hidden" id="winnerLotka${meczID}Leg${numer}" value="0">
    <input type="hidden" id="winnerPozostale${meczID}Leg${numer}" value="501">

    <input type="hidden" id="winnerTeammate${meczID}Leg${numer}" value="${g2}"/>
    <input type="hidden" id="winnerTeammateLotka${meczID}Leg${numer}" value="0">
    <input type="hidden" id="winnerTeammatePozostale${meczID}Leg${numer}" value="501">

    <input type="hidden" id="loser${meczID}Leg${numer}" value="${g3}"/>
    <input type="hidden" id="loserLotka${meczID}Leg${numer}" value="0">
    <input type="hidden" id="loserPozostale${meczID}Leg${numer}" value="501">

    <input type="hidden" id="loserTeammate${meczID}Leg${numer}" value="${g4}"/>
    <input type="hidden" id="loserTeammateLotka${meczID}Leg${numer}" value="0">
    <input type="hidden" id="loserTeammatePozostale${meczID}Leg${numer}" value="501">
  `; // nie zczytuje na bieżąco danych kiedy nie ma zmiany
  const getPlayerInputs = (idx) => {
    return {
      lotka: document.getElementById(`lotkaMecz${meczID}Leg${numer}P${idx}`),
      pozostale: document.getElementById(`pozostaleMecz${meczID}Leg${numer}P${idx}`)
    }
  }
  const globalLotka = document.getElementById(`lotkaMecz${meczID}Leg${numer}`)
  const globalPozostale = document.getElementById(`pozostaleMecz${meczID}Leg${numer}`)
  const winnerSelect = document.getElementById(`winnerMecz${meczID}Leg${numer}`)

  const refreshPlayerBlocks = () => {
    g1 = selectZawodnik1 ? selectZawodnik1.value : ''
    g2 = selectZawodnik2 ? selectZawodnik2.value : ''
    g3 = selectZawodnik3 ? selectZawodnik3.value : ''
    g4 = selectZawodnik4 ? selectZawodnik4.value : ''
    const container = document.getElementById(`playerInputsMecz${meczID}Leg${numer}`)
    if (!container) return
    const blocks = container.querySelectorAll('.player-block')
    blocks.forEach(block => {
      const idx = block.getAttribute('data-idx')
      const lbl = block.querySelector('label')
      if (idx === '1') lbl.textContent = g1
      if (idx === '2') lbl.textContent = g2
      if (idx === '3') lbl.textContent = g3
      if (idx === '4') lbl.textContent = g4
    })

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
    syncGlobalWithWinner()
  }

  const syncGlobalWithWinner = () => {
    if (!winnerSelect) return
    const winner = winnerSelect.value
    const players = [g1, g2, g3, g4]
    const idx = players.indexOf(winner) + 1
    if (idx >= 1 && idx <= 4) {
      const p = getPlayerInputs(idx)
      if (p.lotka && p.pozostale) {
        globalLotka.value = p.lotka.value || ''
        globalPozostale.value = p.pozostale.value || ''
      } else {
        globalLotka.value = ''
        globalPozostale.value = ''
      }
    } else {
      globalLotka.value = ''
      globalPozostale.value = ''
    }
  }

  if (winnerSelect) {
    winnerSelect.addEventListener('change', (e) => {
      syncGlobalWithWinner()
    })
  }

  const setupPerPlayerListeners = () => {
    for (let i = 1; i <= 4; i++) {
      const p = getPlayerInputs(i)
      if (!p.lotka || !p.pozostale) continue
      const handler = () => {
        const currentWinner = winnerSelect ? winnerSelect.value : null
        const players = [g1, g2, g3, g4]
        const name = players[i - 1]
        if (name && currentWinner === name) {
          globalLotka.value = p.lotka.value || ''
          globalPozostale.value = p.pozostale.value || ''
        }
      }
      p.lotka.addEventListener('input', handler)
      p.pozostale.addEventListener('input', handler)
    }
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
    syncGlobalWithWinner()
  }, 0)

  let winner = (document.getElementById(`winnerMecz${meczID}Leg${numer}`) || {}).value
  function updateLotki() {
    switch (winner) {
      case g1:
        document.getElementById(`winnerLotka${meczID}Leg${numer}`).value = document.getElementById(`lotkaMecz${meczID}Leg${numer}P1`).value
        document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = g2
        document.getElementById(`winnerTeammateLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P2`).value
        document.getElementById(`loser${meczID}Leg${numer}`).value = g3
        document.getElementById(`loserLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P3`).value
        document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = g4
        document.getElementById(`loserTeammateLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P4`).value
        break;
      case g2:
        document.getElementById(`winnerLotka${meczID}Leg${numer}`).value = document.getElementById(`lotkaMecz${meczID}Leg${numer}P2`).value
        document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = g1
        document.getElementById(`winnerTeammateLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P1`).value
        document.getElementById(`loser${meczID}Leg${numer}`).value = g3
        document.getElementById(`loserLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P3`).value
        document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = g4
        document.getElementById(`loserTeammateLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P4`).value
        break;
      case g3:
        document.getElementById(`winnerLotka${meczID}Leg${numer}`).value = document.getElementById(`lotkaMecz${meczID}Leg${numer}P3`).value
        document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = g4
        document.getElementById(`winnerTeammateLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P4`).value
        document.getElementById(`loser${meczID}Leg${numer}`).value = g1
        document.getElementById(`loserLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P1`).value
        document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = g2
        document.getElementById(`loserTeammateLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P2`).value
        break;
      case g4:
        document.getElementById(`winnerLotka${meczID}Leg${numer}`).value = document.getElementById(`lotkaMecz${meczID}Leg${numer}P4`).value
        document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = g3
        document.getElementById(`winnerTeammateLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P3`).value
        document.getElementById(`loser${meczID}Leg${numer}`).value = g1
        document.getElementById(`loserLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P1`).value
        document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = g2
        document.getElementById(`loserTeammateLotka${meczID}Leg${numer}`).value=document.getElementById(`lotkaMecz${meczID}Leg${numer}P2`).value
        break;
    }
  }

  function updatePozostale() {
    switch (winner) {
      case g1:
        document.getElementById(`winnerPozostale${meczID}Leg${numer}`).value = document.getElementById(`pozostaleMecz${meczID}Leg${numer}P1`).value
        document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = g2
        document.getElementById(`winnerTeammatePozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P2`).value
        document.getElementById(`loser${meczID}Leg${numer}`).value = g3
        document.getElementById(`loserPozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P3`).value
        document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = g4
        document.getElementById(`loserTeammatePozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P4`).value
        break;
      case g2:
        document.getElementById(`winnerPozostale${meczID}Leg${numer}`).value = document.getElementById(`pozostaleMecz${meczID}Leg${numer}P2`).value
        document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = g1
        document.getElementById(`winnerTeammatePozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P1`).value
        document.getElementById(`loser${meczID}Leg${numer}`).value = g3
        document.getElementById(`loserPozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P3`).value
        document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = g4
        document.getElementById(`loserTeammatePozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P4`).value
        break;
      case g3:
        document.getElementById(`winnerPozostale${meczID}Leg${numer}`).value = document.getElementById(`pozostaleMecz${meczID}Leg${numer}P3`).value
        document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = g4
        document.getElementById(`winnerTeammatePozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P4`).value
        document.getElementById(`loser${meczID}Leg${numer}`).value = g1
        document.getElementById(`loserPozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P1`).value
        document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = g2
        document.getElementById(`loserTeammatePozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P2`).value
        break;
      case g4:
        document.getElementById(`winnerPozostale${meczID}Leg${numer}`).value = document.getElementById(`pozostaleMecz${meczID}Leg${numer}P4`).value
        document.getElementById(`winnerTeammate${meczID}Leg${numer}`).value = g3
        document.getElementById(`winnerTeammatePozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P3`).value
        document.getElementById(`loser${meczID}Leg${numer}`).value = g1
        document.getElementById(`loserPozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P1`).value
        document.getElementById(`loserTeammate${meczID}Leg${numer}`).value = g2
        document.getElementById(`loserTeammatePozostale${meczID}Leg${numer}`).value=document.getElementById(`pozostaleMecz${meczID}Leg${numer}P2`).value
        break;
    }
  }
  document.getElementById(`lotkaMecz${meczID}Leg${numer}P1`).addEventListener("change", updateLotki)
  document.getElementById(`lotkaMecz${meczID}Leg${numer}P2`).addEventListener("change", updateLotki)
  document.getElementById(`lotkaMecz${meczID}Leg${numer}P3`).addEventListener("change", updateLotki)
  document.getElementById(`lotkaMecz${meczID}Leg${numer}P4`).addEventListener("change", updateLotki)

  document.getElementById(`pozostaleMecz${meczID}Leg${numer}P1`).addEventListener("change", updatePozostale)
  document.getElementById(`pozostaleMecz${meczID}Leg${numer}P2`).addEventListener("change", updatePozostale)
  document.getElementById(`pozostaleMecz${meczID}Leg${numer}P3`).addEventListener("change", updatePozostale)
  document.getElementById(`pozostaleMecz${meczID}Leg${numer}P4`).addEventListener("change", updatePozostale)

  sumLegHost++
  document.getElementById(`winnerMecz${meczID}Leg${numer}`).addEventListener("change", (x) => {
    x.preventDefault()
    let winnerChanged = (document.getElementById(`winnerMecz${meczID}Leg${numer}`) || {}).value
    let p1 = document.getElementById(`pozostaleMecz${meczID}Leg${numer}P1`)
    let p2 = document.getElementById(`pozostaleMecz${meczID}Leg${numer}P2`)
    let p3 = document.getElementById(`pozostaleMecz${meczID}Leg${numer}P3`)
    let p4 = document.getElementById(`pozostaleMecz${meczID}Leg${numer}P4`)
    switch (winnerChanged) {
      case g1:
        p1.setAttribute("disabled", "")
        p1.setAttribute("value", "0")
        p2.removeAttribute("disabled")
        p2.setAttribute("required", "")
        p2.setAttribute("value", "501")
        p3.removeAttribute("disabled")
        p3.setAttribute("required", "")
        p3.setAttribute("value", "501")
        p4.removeAttribute("disabled")
        p4.setAttribute("required", "")
        p4.setAttribute("value", "501")
        break;
      case g2:
        p1.removeAttribute("disabled")
        p1.setAttribute("required", "")
        p1.setAttribute("value", "501")
        p2.setAttribute("disabled", "")
        p2.setAttribute("value", "0")
        p3.removeAttribute("disabled")
        p3.setAttribute("required", "")
        p3.setAttribute("value", "501")
        p4.removeAttribute("disabled")
        p4.setAttribute("required", "")
        p4.setAttribute("value", "501")
        break;
      case g3:
        p1.removeAttribute("disabled")
        p1.setAttribute("required", "")
        p1.setAttribute("value", "501")
        p2.removeAttribute("disabled")
        p2.setAttribute("required", "")
        p2.setAttribute("value", "501")
        p3.setAttribute("disabled", "")
        p3.setAttribute("value", "0")
        p4.removeAttribute("disabled")
        p4.setAttribute("required", "")
        p4.setAttribute("value", "501")
        break;
      case g4:
        p1.removeAttribute("disabled")
        p1.setAttribute("required", "")
        p1.setAttribute("value", "501")
        p2.removeAttribute("disabled")
        p2.setAttribute("required", "")
        p2.setAttribute("value", "501")
        p3.removeAttribute("disabled")
        p3.setAttribute("required", "")
        p3.setAttribute("value", "501")
        p4.setAttribute("disabled", "")
        p4.setAttribute("value", "0")
        break;
    }
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
  let lotka = (document.getElementById(`lotkaMecz${meczID}Leg${numer}`) || {}).value
  let pozostale = (document.getElementById(`pozostaleMecz${meczID}Leg${numer}`) || {}).value
  return [winner, lotka, pozostale]
}

single(1);
single(2);
single(3);
single(4);

double(5);
double(6);
double(7);
double(8);

single(9);
single(10);
single(11);
single(12);



let h = 1
document.getElementById("dodajHostRezerwowy").addEventListener("click", function() {
  let divHost = document.getElementById("hosty")
  if (h <= 4) {
    // create the select element instead of using innerHTML to avoid destroying existing listeners
    const sel = document.createElement("select")
    sel.type = "text"
    sel.className = "form-control"
    sel.id = `hr${h}`
    sel.name = `hr${h}`
    sel.required = true

    const opt = document.createElement("option")
    opt.value = `Host rezerwowy ${h}`
    opt.selected = true
    opt.textContent = `hr${h}`
    sel.appendChild(opt)

    divHost.appendChild(sel)
    // add a non-breaking space separator like original markup
    divHost.appendChild(document.createTextNode('\u00A0'))

    // populate options and attach change handlers for new select(s)
    populatePlayerSelects('host', skladGospodarz || [])

    h++
  }
  return false
})
let g = 1
document.getElementById("dodajGoscRezerwowy").addEventListener("click", function() {
  let divGosc = document.getElementById("goscie")
  if (g <= 4) {
    // create the select element instead of using innerHTML to avoid destroying existing listeners
    const sel = document.createElement("select")
    sel.type = "text"
    sel.className = "form-control"
    sel.id = `gr${g}`
    sel.name = `gr${g}`
    sel.required = true

    const opt = document.createElement("option")
    opt.value = `Gość rezerwowy ${g}`
    opt.selected = true
    opt.textContent = `gr${g}`
    sel.appendChild(opt)

    divGosc.appendChild(sel)
    // add a non-breaking space separator like original markup
    divGosc.appendChild(document.createTextNode('\u00A0'))

    // populate options and attach change handlers for new select(s)
    populatePlayerSelects('guest', skladGosc || [])

    g++
  }
  return false
})


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
    function srednia(valInt) {
      if (valInt<=0) return 0
    return (501/valInt).toFixed(2)
    }
    function sredniaRemain(remainInt, valInt) {
      if (valInt<=0) return 0
    return ((501-remainInt)/valInt).toFixed(2)
    }
    var zawodnicyWyniki = []
    for (let index = 0; index < zawodnicy.length; index++) {
      zawodnicyWyniki.push(
        {
          name:zawodnicy[index],
          wonSingle:0,
          lostSingle:0,
          wonDouble:0,
          lostDouble:0,
          matchesPlayed:0
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
      if (document.getElementById(`hr${index}`)) {
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
      if (document.getElementById(`gr${index}`)) {
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
      if (parseInt(document.getElementById(`lotkaMecz${index}Leg1`).value) < 9) document.getElementById(`lotkaMecz${index}Leg1`).value = 0
      if (parseInt(document.getElementById(`lotkaMecz${index}Leg2`).value) < 9) document.getElementById(`lotkaMecz${index}Leg2`).value = 0
      if (parseInt(document.getElementById(`pozostaleMecz${index}Leg1`).value) < 2 || document.getElementById(`pozostaleMecz${index}Leg1`).value > 501) document.getElementById(`pozostaleMecz${index}Leg1`).value = 501
      if (parseInt(document.getElementById(`pozostaleMecz${index}Leg2`).value) < 2 || document.getElementById(`pozostaleMecz${index}Leg2`).value > 501) document.getElementById(`pozostaleMecz${index}Leg2`).value = 501 
        if (parseInt(document.getElementById(`lotkaPrzegranyMecz${index}Leg1`).value) < 2) document.getElementById(`lotkaPrzegranyMecz${index}Leg1`).value = 0
        if (parseInt(document.getElementById(`lotkaPrzegranyMecz${index}Leg2`).value) < 2) document.getElementById(`lotkaPrzegranyMecz${index}Leg2`).value = 0
      raport += `
      ${document.getElementById(`gracz1mecz${index}`).value} - ${document.getElementById(`gracz2mecz${index}`).value} (${hostPoints}:${guestPoints}) ---- ${hostTotalPoints}:${guestTotalPoints}<br>
      - Leg1: Wygrał: ${winner1} (${document.getElementById(`lotkaMecz${index}Leg1`).value} lotka) średnia (${srednia(document.getElementById(`lotkaMecz${index}Leg1`).value)}) | Przegrał: ${loser1} (pozostało punktów ${document.getElementById(`pozostaleMecz${index}Leg1`).value}) średnia (${sredniaRemain(document.getElementById(`pozostaleMecz${index}Leg1`).value, document.getElementById(`lotkaPrzegranyMecz${index}Leg1`).value)}) <br>
      - Leg2: Wygrał: ${winner2} (${document.getElementById(`lotkaMecz${index}Leg2`).value} lotka) średnia (${srednia(document.getElementById(`lotkaMecz${index}Leg2`).value)}) | Przegrał: ${loser2} (pozostało punktów ${document.getElementById(`pozostaleMecz${index}Leg2`).value}) średnia (${sredniaRemain(document.getElementById(`pozostaleMecz${index}Leg2`).value, document.getElementById(`lotkaPrzegranyMecz${index}Leg2`).value)})<br>
      `
      if (parseInt(document.getElementById(`lotkaMecz${index}Leg1`).value) >= 9 && parseInt(document.getElementById(`lotkaMecz${index}Leg1`).value) <= 18) {
        let obj = {
          zawodnik: winner1,
          lotka: parseInt(document.getElementById(`lotkaMecz${index}Leg1`).value)
        }
        lotki.push(obj)
      }
      if (parseInt(document.getElementById(`lotkaMecz${index}Leg2`).value) >= 9 && parseInt(document.getElementById(`lotkaMecz${index}Leg2`).value) <= 18) {
        let obj = {
          zawodnik: winner2,
          lotka: parseInt(document.getElementById(`lotkaMecz${index}Leg2`).value)
        }
        lotki.push(obj)
      }
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
          
        if (parseInt(document.getElementById(`lotkaMecz${index}Leg3`).value) < 9) document.getElementById(`lotkaMecz${index}Leg3`).value = 0;
        if (parseInt(document.getElementById(`lotkaPrzegranyMecz${index}Leg3`).value) < 0) document.getElementById(`lotkaPrzegranyMecz${index}Leg3`).value = 0;
        if (parseInt(document.getElementById(`pozostaleMecz${index}Leg3`).value) < 2 || document.getElementById(`pozostaleMecz${index}Leg3`).value > 501) document.getElementById(`pozostaleMecz${index}Leg3`).value = 501

        raport += `- Leg 3: Zaczął: ${document.getElementById(`whoStartedLeg3Mecz${index}`).value} Wygrał: ${winner3} (${document.getElementById(`lotkaMecz${index}Leg3`).value}) średnia (${srednia(document.getElementById(`lotkaMecz${index}Leg3`).value)}) | Przegrał: ${loser3} (pozostało punktów ${document.getElementById(`pozostaleMecz${index}Leg3`).value}) średnia (${sredniaRemain(document.getElementById(`pozostaleMecz${index}Leg3`).value, document.getElementById(`lotkaPrzegranyMecz${index}Leg3`).value)}) <br>`
        for (let index = 0; index < zawodnicyWyniki.length; index++) {
          if (zawodnicyWyniki[index].name == winner3) zawodnicyWyniki[index].wonSingle++; 
          if (zawodnicyWyniki[index].name == loser3) zawodnicyWyniki[index].lostSingle++; 
        }  
        if (parseInt(document.getElementById(`lotkaMecz${index}Leg3`).value) >= 9 && parseInt(document.getElementById(`lotkaMecz${index}Leg3`).value) <= 18) {
        let obj = {
          zawodnik: winner3,
          lotka: parseInt(document.getElementById(`lotkaMecz${index}Leg3`).value)
        }
        lotki.push(obj)
        }
      } 
      for (let index = 0; index < zawodnicyWyniki.length; index++) {
        if (zawodnicyWyniki[index].name == winner1) {zawodnicyWyniki[index].wonSingle++; zawodnicyWyniki[index].matchesPlayed++}
        if (zawodnicyWyniki[index].name == loser1) {zawodnicyWyniki[index].lostSingle++; zawodnicyWyniki[index].matchesPlayed++}
        if (zawodnicyWyniki[index].name == winner2) zawodnicyWyniki[index].wonSingle++; 
        if (zawodnicyWyniki[index].name == loser2) zawodnicyWyniki[index].lostSingle++; 
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
      /// do poprawienia
        if (parseInt(document.getElementById(`winnerLotka${index}Leg1`).value) < 9) document.getElementById(`winnerLotka${index}Leg1`).value = 0;
        if (parseInt(document.getElementById(`winnerLotka${index}Leg2`).value) < 9) document.getElementById(`winnerLotka${index}Leg2`).value = 0;
        if (parseInt(document.getElementById(`winnerTeammateLotka${index}Leg1`).value) < 9) document.getElementById(`winnerTeammateLotka${index}Leg1`).value = 0;
        if (parseInt(document.getElementById(`winnerTeammateLotka${index}Leg2`).value) < 9) document.getElementById(`winnerTeammateLotka${index}Leg2`).value = 0;
        if (parseInt(document.getElementById(`loserLotka${index}Leg1`).value) < 9) document.getElementById(`loserLotka${index}Leg1`).value = 0;
        if (parseInt(document.getElementById(`loserLotka${index}Leg2`).value) < 9) document.getElementById(`loserLotka${index}Leg2`).value = 0;
        if (parseInt(document.getElementById(`loserTeammateLotka${index}Leg1`).value) < 9) document.getElementById(`loserTeammateLotka${index}Leg1`).value = 0;
        if (parseInt(document.getElementById(`loserTeammateLotka${index}Leg2`).value) < 9) document.getElementById(`loserTeammateLotka${index}Leg2`).value = 0;
        if (parseInt(document.getElementById(`winnerTeammatePozostale${index}Leg1`).value) < 0 || document.getElementById(`winnerTeammatePozostale${index}Leg1`).value < 501) document.getElementById(`winnerTeammatePozostale${index}Leg1`).value = 501
        if (parseInt(document.getElementById(`winnerTeammatePozostale${index}Leg1`).value) < 0 || document.getElementById(`winnerTeammatePozostale${index}Leg1`).value < 501) document.getElementById(`winnerTeammatePozostale${index}Leg1`).value = 501
        if (parseInt(document.getElementById(`loserPozostale${index}Leg1`).value) < 0 || document.getElementById(`loserPozostale${index}Leg1`).value > 501) document.getElementById(`loserPozostale${index}Leg1`).value = 501
        if (parseInt(document.getElementById(`loserPozostale${index}Leg2`).value) < 0 || document.getElementById(`loserPozostale${index}Leg2`).value > 501) document.getElementById(`loserPozostale${index}Leg2`).value = 501
        if (parseInt(document.getElementById(`loserTeammatePozostale${index}Leg1`).value) < 0 || document.getElementById(`loserTeammatePozostale${index}Leg1`).value > 501) document.getElementById(`loserTeammatePozostale${index}Leg1`).value = 501
        if (parseInt(document.getElementById(`loserTeammatePozostale${index}Leg2`).value) < 0 || document.getElementById(`loserTeammatePozostale${index}Leg2`).value > 501) document.getElementById(`loserTeammatePozostale${index}Leg2`).value = 501
      raport += `
      ${document.getElementById(`gracz1mecz${index}`).value}, ${document.getElementById(`gracz2mecz${index}`).value} - ${document.getElementById(`gracz3mecz${index}`).value}, ${document.getElementById(`gracz4mecz${index}`).value} (${hostPoints}:${guestPoints}) ---- ${hostTotalPoints}:${guestTotalPoints}<br>
      - Leg1: Wygrał: ${winner1} (${document.getElementById(`winnerLotka${index}Leg1`).value} lotka) średnia (${srednia(document.getElementById(`winnerLotka${index}Leg1`).value)}) | ${winnerTeammate1} (pozostało punktów ${document.getElementById(`winnerTeammatePozostale${index}Leg1`).value}) średnia (${sredniaRemain(parseInt(document.getElementById(`winnerTeammatePozostale${index}Leg1`).value), parseInt(document.getElementById(`winnerTeammateLotka${index}Leg1`).value))})<br>
      Przegrali: ${loser1} (pozostało punktów ${document.getElementById(`loserPozostale${index}Leg1`).value}) średnia (${sredniaRemain(parseInt(document.getElementById(`loserPozostale${index}Leg1`).value), parseInt(document.getElementById(`loserLotka${index}Leg1`).value))}) | ${loserTeammate1} (pozostało punktów ${document.getElementById(`loserTeammatePozostale${index}Leg1`).value}) średnia (${sredniaRemain(parseInt(document.getElementById(`loserTeammatePozostale${index}Leg1`).value), parseInt(document.getElementById(`loserTeammateLotka${index}Leg1`).value))})<br>
      - Leg2: Wygrał: ${winner2} (${document.getElementById(`winnerLotka${index}Leg2`).value} lotka) średnia (${srednia(document.getElementById(`winnerLotka${index}Leg2`).value)}) | ${winnerTeammate2} (pozostało punktów ${document.getElementById(`winnerTeammatePozostale${index}Leg2`).value}) średnia (${sredniaRemain(parseInt(document.getElementById(`winnerTeammatePozostale${index}Leg2`).value), parseInt(document.getElementById(`winnerTeammateLotka${index}Leg2`).value))}) <br>
      Przegrali: ${loser2} (pozostało punktów ${document.getElementById(`loserPozostale${index}Leg2`).value}) średnia (${sredniaRemain(parseInt(document.getElementById(`loserPozostale${index}Leg2`).value), parseInt(document.getElementById(`loserLotka${index}Leg2`).value))}) | ${loserTeammate2} (pozostało punktów ${document.getElementById(`loserTeammatePozostale${index}Leg2`).value}) średnia (${sredniaRemain(parseInt(document.getElementById(`loserTeammatePozostale${index}Leg2`).value), parseInt(document.getElementById(`loserTeammateLotka${index}Leg2`).value))})<br>
      `;
      if (parseInt(document.getElementById(`winnerLotka${index}Leg1`).value) >= 9 && parseInt(document.getElementById(`winnerLotka${index}Leg1`).value) <= 18) {
        let obj = {
          zawodnik: winner1,
          lotka: parseInt(document.getElementById(`winnerLotka${index}Leg1`).value)
        }
        lotki.push(obj)
      }
      if (parseInt(document.getElementById(`winnerLotka${index}Leg2`).value) >= 9 && parseInt(document.getElementById(`winnerLotka${index}Leg2`).value) <= 18) {
        let obj = {
          zawodnik: winner2,
          lotka: parseInt(document.getElementById(`winnerLotka${index}Leg2`).value)
        }
        lotki.push(obj)
      }
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
      Wygrali: ${winner3} (${document.getElementById(`winnerLotka${index}Leg3`).value} lotka) średnia (${srednia(document.getElementById(`winnerLotka${index}Leg3`).value)}) | ${winnerTeammate3} (pozostało punktów ${document.getElementById(`winnerTeammatePozostale${index}Leg3`).value}) średnia (${sredniaRemain(parseInt(document.getElementById(`winnerTeammatePozostale${index}Leg3`).value), parseInt(document.getElementById(`winnerTeammateLotka${index}Leg3`).value))})<br> 
      Przegrali: ${loser3} (pozostało punktów ${document.getElementById(`loserPozostale${index}Leg3`).value}) średnia (${sredniaRemain(parseInt(document.getElementById(`loserPozostale${index}Leg3`).value), parseInt(document.getElementById(`loserLotka${index}Leg3`).value))}) | ${loserTeammate3} (pozostało punktów ${document.getElementById(`loserTeammatePozostale${index}Leg3`).value}) średnia (${sredniaRemain(parseInt(document.getElementById(`loserTeammatePozostale${index}Leg3`).value), parseInt(document.getElementById(`loserTeammateLotka${index}Leg3`).value))})<br>
      `
      if (parseInt(document.getElementById(`winnerLotka${index}Leg3`).value) >= 9 && parseInt(document.getElementById(`winnerLotka${index}Leg3`).value) <= 18) {
        let obj = {
          zawodnik: winner3,
          lotka: parseInt(document.getElementById(`winnerLotka${index}Leg3`).value)
        }
        lotki.push(obj)
      }
      for (let index = 0; index < zawodnicyWyniki.length; index++) {
          if (zawodnicyWyniki[index].name == winner3) zawodnicyWyniki[index].wonDouble++; 
          if (zawodnicyWyniki[index].name == loser3) zawodnicyWyniki[index].lostDouble++; 
          if (zawodnicyWyniki[index].name == winnerTeammate3) zawodnicyWyniki[index].wonDouble++; 
          if (zawodnicyWyniki[index].name == loserTeammate3) zawodnicyWyniki[index].lostDouble++; 
      }
    } 
    for (let index = 0; index < zawodnicyWyniki.length; index++) {
        if (zawodnicyWyniki[index].name == winner1) {zawodnicyWyniki[index].wonDouble++; zawodnicyWyniki[index].matchesPlayed++}
        if (zawodnicyWyniki[index].name == loser1) {zawodnicyWyniki[index].lostDouble++; zawodnicyWyniki[index].matchesPlayed++}
        if (zawodnicyWyniki[index].name == winnerTeammate1) {zawodnicyWyniki[index].wonDouble++; zawodnicyWyniki[index].matchesPlayed++}
        if (zawodnicyWyniki[index].name == loserTeammate1) {zawodnicyWyniki[index].lostDouble++; zawodnicyWyniki[index].matchesPlayed++}

        if (zawodnicyWyniki[index].name == winner2) zawodnicyWyniki[index].wonDouble++; 
        if (zawodnicyWyniki[index].name == loser2) zawodnicyWyniki[index].lostDouble++; 
        if (zawodnicyWyniki[index].name == winnerTeammate2) zawodnicyWyniki[index].wonDouble++; 
        if (zawodnicyWyniki[index].name == loserTeammate2) zawodnicyWyniki[index].lostDouble++; 
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
      
        if (document.getElementById(`lotkaMecz${index}Leg1`).value < 9) document.getElementById(`lotkaMecz${index}Leg1`).value = 0
        if (document.getElementById(`lotkaMecz${index}Leg2`).value < 9) document.getElementById(`lotkaMecz${index}Leg2`).value = 0
        if (document.getElementById(`pozostaleMecz${index}Leg1`).value < 2 || document.getElementById(`pozostaleMecz${index}Leg1`).value > 501) document.getElementById(`pozostaleMecz${index}Leg1`).value = 501
        if (document.getElementById(`pozostaleMecz${index}Leg2`).value < 2 || document.getElementById(`pozostaleMecz${index}Leg2`).value > 501) document.getElementById(`pozostaleMecz${index}Leg2`).value = 501
        if (document.getElementById(`lotkaPrzegranyMecz${index}Leg1`).value < 0) document.getElementById(`lotkaPrzegranyMecz${index}Leg1`).value = 0
        if (document.getElementById(`lotkaPrzegranyMecz${index}Leg2`).value < 0) document.getElementById(`lotkaPrzegranyMecz${index}Leg2`).value = 0
      raport += `
      ${document.getElementById(`gracz1mecz${index}`).value} - ${document.getElementById(`gracz2mecz${index}`).value} (${hostPoints}:${guestPoints}) ---- ${hostTotalPoints}:${guestTotalPoints}<br>
      - Leg1: Wygrał: ${winner1} (${document.getElementById(`lotkaMecz${index}Leg1`).value} lotka) średnia (${srednia(document.getElementById(`lotkaMecz${index}Leg1`).value)}) | Przegrał: ${loser1} (pozostało punktów ${document.getElementById(`pozostaleMecz${index}Leg1`).value}) średnia (${sredniaRemain(document.getElementById(`pozostaleMecz${index}Leg1`).value, document.getElementById(`lotkaPrzegranyMecz${index}Leg1`).value)}) <br>
      - Leg2: Wygrał: ${winner2} (${document.getElementById(`lotkaMecz${index}Leg2`).value} lotka) średnia (${srednia(document.getElementById(`lotkaMecz${index}Leg2`).value)}) | Przegrał: ${loser2} (pozostało punktów ${document.getElementById(`pozostaleMecz${index}Leg2`).value}) średnia (${sredniaRemain(document.getElementById(`pozostaleMecz${index}Leg2`).value, document.getElementById(`lotkaPrzegranyMecz${index}Leg2`).value)})<br>
      `
      if (parseInt(document.getElementById(`lotkaMecz${index}Leg1`).value) >= 9 && parseInt(document.getElementById(`lotkaMecz${index}Leg1`).value) <= 18) {
        let obj = {
          zawodnik: winner1,
          lotka: parseInt(document.getElementById(`lotkaMecz${index}Leg1`).value)
        }
        lotki.push(obj)
      }
      if (parseInt(document.getElementById(`lotkaMecz${index}Leg2`).value) >= 9 && parseInt(document.getElementById(`lotkaMecz${index}Leg2`).value) <= 18) {
        let obj = {
          zawodnik: winner2,
          lotka: parseInt(document.getElementById(`lotkaMecz${index}Leg2`).value)
        }
        lotki.push(obj)
      }
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
        
        if (document.getElementById(`lotkaMecz${index}Leg3`).value < 9) document.getElementById(`lotkaMecz${index}Leg3`).value = 0
        if (document.getElementById(`lotkaPrzegranyMecz${index}Leg3`).value < 0) document.getElementById(`lotkaPrzegranyMecz${index}Leg3`).value = 0
        if (document.getElementById(`pozostaleMecz${index}Leg3`).value < 2 || document.getElementById(`pozostaleMecz${index}Leg3`).value > 501) document.getElementById(`pozostaleMecz${index}Leg3`).value = 501

        raport += `- Leg 3: Zaczął: ${document.getElementById(`whoStartedLeg3Mecz${index}`).value} Wygrał: ${winner3} (${document.getElementById(`lotkaMecz${index}Leg3`).value}) średnia (${srednia(document.getElementById(`lotkaMecz${index}Leg3`).value)}) | Przegrał: ${loser3} (pozostało punktów ${document.getElementById(`pozostaleMecz${index}Leg3`).value}) średnia (${sredniaRemain(document.getElementById(`pozostaleMecz${index}Leg3`).value, document.getElementById(`lotkaPrzegranyMecz${index}Leg3`).value)}) <br>`
        for (let index = 0; index < zawodnicyWyniki.length; index++) {
          if (zawodnicyWyniki[index].name == winner3) zawodnicyWyniki[index].wonSingle++; 
          if (zawodnicyWyniki[index].name == loser3) zawodnicyWyniki[index].lostSingle++; 
        }  
        if (parseInt(document.getElementById(`lotkaMecz${index}Leg3`).value) >= 9 && parseInt(document.getElementById(`lotkaMecz${index}Leg3`).value) <= 18) {
        let obj = {
          zawodnik: winner3,
          lotka: parseInt(document.getElementById(`lotkaMecz${index}Leg3`).value)
        }
        lotki.push(obj)
        }
      }
      for (let index = 0; index < zawodnicyWyniki.length; index++) {
        if (zawodnicyWyniki[index].name == winner1) {zawodnicyWyniki[index].wonSingle++; zawodnicyWyniki[index].matchesPlayed++}
        if (zawodnicyWyniki[index].name == loser1) {zawodnicyWyniki[index].lostSingle++; zawodnicyWyniki[index].matchesPlayed++}
        if (zawodnicyWyniki[index].name == winner2) zawodnicyWyniki[index].wonSingle++; 
        if (zawodnicyWyniki[index].name == loser2) zawodnicyWyniki[index].lostSingle++; 
      }
    } 
    raport+=document.getElementById(`adnotacje`).value
    document.body.innerHTML=raport
    for (let index = 0; index < wyniki.length; index++) {
      if (zawodnicy.find((e) => e == wyniki[index].zawodnik)) {
        let el = wyniki[index].zawodnik
        document.getElementById(`${el}`).innerHTML+=`Najwyższe wyniki: ${wyniki[index].wynik}<br>`
    }}
    for (let index = 0; index < lotki.length; index++) {
      if (zawodnicy.find((e) => e == lotki[index].zawodnik)) {
        let el = lotki[index].zawodnik
        document.getElementById(`${el}`).innerHTML+=`Najszybsze lotki: ${lotki[index].lotka}<br>`
    }}
    for (let index = 0; index < skonczenia.length; index++) {
      if (zawodnicy.find((e) => e == skonczenia[index].zawodnik)) {
        let el = skonczenia[index].zawodnik
        document.getElementById(`${el}`).innerHTML+=`Najwyższe skończenia: ${skonczenia[index].skonczenie}<br>`
    }}
    for (let index = 0; index < zawodnicyWyniki.length; index++) {
      if (document.getElementById(`wonTotal${zawodnicyWyniki[index].name}`)) document.getElementById(`wonTotal${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].wonSingle+zawodnicyWyniki[index].wonDouble
      if (document.getElementById(`lostTotal${zawodnicyWyniki[index].name}`)) document.getElementById(`lostTotal${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].lostSingle+zawodnicyWyniki[index].lostDouble
      if (document.getElementById(`wonSingle${zawodnicyWyniki[index].name}`)) document.getElementById(`wonSingle${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].wonSingle
      if (document.getElementById(`lostSingle${zawodnicyWyniki[index].name}`)) document.getElementById(`lostSingle${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].lostSingle
      if (document.getElementById(`wonDouble${zawodnicyWyniki[index].name}`)) document.getElementById(`wonDouble${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].wonDouble
      if (document.getElementById(`lostDouble${zawodnicyWyniki[index].name}`)) document.getElementById(`lostDouble${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].lostDouble
      if (document.getElementById(`matchesPlayed${zawodnicyWyniki[index].name}`)) document.getElementById(`matchesPlayed${zawodnicyWyniki[index].name}`).innerHTML=zawodnicyWyniki[index].matchesPlayed
    }

  });
}
);

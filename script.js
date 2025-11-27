const druzyny = [{nazwa: "sernik", zawodnicy:["A","B","C","D","A2","B2","C2","D2"], lokal:"lodówka"},
   {nazwa: "roztocza" , zawodnicy:["E","F","G","H","E2","F2","G2","H2"], lokal:"dywan"}, 
   {nazwa: "pliki" , zawodnicy:["I","J","K","L"], lokal:"folder"},
   {nazwa: "switche" , zawodnicy:["M","N","O","P"], lokal:"klawiatura"}
  ];


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("formKonwerter");

  const gospodarz = document.getElementById("gospodarz");
  const gosc = document.getElementById("gosc");
  const lokalizacja = document.getElementById("lokalizacja");
  

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
  for (let index = 0; index < druzyny.length; index++) {
    gospodarz.innerHTML += `<option value="${druzyny[index].nazwa}">${druzyny[index].nazwa}</option>`;
    gosc.innerHTML += `<option value="${druzyny[index].nazwa}">${druzyny[index].nazwa}</option>`;
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
    const hostTeam = druzyny.find(d => d.nazwa === gospodarz.value);
    const guestTeam = druzyny.find(d => d.nazwa === gosc.value);
    skladGospodarz = hostTeam ? hostTeam.zawodnicy.slice() : [];
    skladGosc = guestTeam ? guestTeam.zawodnicy.slice() : [];
    populatePlayerSelects('host', skladGospodarz);
    populatePlayerSelects('guest', skladGosc);
  };

  // wire team selects
  gospodarz.addEventListener('change', (event) => {
    event.preventDefault();
    syncSelects(gospodarz, gosc);
    lokalizacja.value = (druzyny.find(d => d.nazwa === gospodarz.value) || {}).lokal || '';
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

  // keep old variables for compatibility with existing code
  const selectH1 = document.getElementById("h1");
  const selectH2 = document.getElementById("h2");
  const selectH3 = document.getElementById("h3");
  const selectH4 = document.getElementById("h4");

  const selectG1 = document.getElementById("g1");
  const selectG2 = document.getElementById("g2");
  const selectG3 = document.getElementById("g3");
  const selectG4 = document.getElementById("g4");

  /////////////////////// jeszcze nie działa przy zmianie zawodnika w składzie, kiedy ten jest w meczu
function single(meczID) {
  const mecz = document.createElement("div");
  mecz.id = `mecz${meczID}`;
  mecz.className = "row";
  mecz.innerHTML = `
  <div class="mb-3  mt-5 btn btn-mecz text-white">Mecz ${meczID}:
  </div>
  <div class="col-sm-6">
  Zawodnik 1:
  <select id="gracz1mecz${meczID}" class="form-select">
  </select>
  </div>
  <div class="col-sm-6">
  Zawodnik 2:
  <select id="gracz2mecz${meczID}" class="form-select">
  </select>
  </div>
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
      if (leg3) leg3.remove();
      if (leg3Name) leg3Name.remove();
      leg3Val = undefined;
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
  legDiv.innerHTML=`Kto wygrał leg? <select id="winnerMecz${meczID}Leg${numer}" class="form-select">
  <option value="${g1}">${g1}</option>
  <option value="${g2}">${g2}</option>
  </select><br>Którą lotką wygrano lega?
  <input type="number" id="lotkaMecz${meczID}Leg${numer}" min="9" step="1" required><br>
  Ile pozostało punktów przeciwnikowi?
  <input type="number" id="pozostaleMecz${meczID}Leg${numer}" min="2" max="501" step="1" required>
  <br>
  `;
  // aktualizacje 
  selectZawodnik1.addEventListener("change", (x) => {
    x.preventDefault();
    g1 = document.getElementById(`gracz1mecz${meczID}`).value
    legDiv.innerHTML=`Kto wygrał leg? <select id="winnerMecz${meczID}Leg${numer}" class="form-select">
      <option value="${g1}">${g1}</option>
      <option value="${g2}">${g2}</option>
      </select><br>Którą lotką wygrano lega?
      <input type="number" id="lotkaMecz${meczID}Leg${numer}" min="9" step="1" required><br>
      Ile pozostało punktów przeciwnikowi?
      <input type="number" id="pozostaleMecz${meczID}Leg${numer}" min="2" max="501" step="1" required>
      <br>
      `
  })
  selectZawodnik2.addEventListener("change", (x) => {
    x.preventDefault();
    g2 = document.getElementById(`gracz2mecz${meczID}`).value
    legDiv.innerHTML=`Kto wygrał leg? <select id="winnerMecz${meczID}Leg${numer}" class="form-select">
      <option value="${g1}">${g1}</option>
      <option value="${g2}">${g2}</option>
      </select><br>Którą lotką wygrano lega?
      <input type="number" id="lotkaMecz${meczID}Leg${numer}" min="9" step="1" required><br>
      Ile pozostało punktów przeciwnikowi?
      <input type="number" id="pozostaleMecz${meczID}Leg${numer}" min="2" max="501" step="1" required>
      <br>
      `
  })

  let mecz = document.getElementById(`mecz${meczID}`)
  mecz.appendChild(legName)
  mecz.appendChild(legDiv)
  let winner = document.getElementById(`winnerMecz${meczID}Leg${numer}`).value
  let lotka = document.getElementById(`lotkaMecz${meczID}Leg${numer}`).value
  let pozostale = document.getElementById(`pozostaleMecz${meczID}Leg${numer}`).value
  return [winner, lotka, pozostale]
}

single(1);
single(2);
single(3);
single(4);





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
if ( form ) {
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    
  });
}


});

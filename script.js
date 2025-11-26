const druzyny = [{nazwa: "sernik", zawodnicy:["A","B","C","D"], lokal:"lodówka"},
   {nazwa: "roztocza" , zawodnicy:["E","F","G","H"], lokal:"dywan"}, 
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
  for (let index = 0; index < druzyny.length; index++) {
    gospodarz.innerHTML+= `<option value="${druzyny[index].nazwa}">${druzyny[index].nazwa}</option>`;
    gosc.innerHTML+= `<option value="${druzyny[index].nazwa}">${druzyny[index].nazwa}</option>`;
  }
  

  // assign values based on visible option text for initial lists
  setOptionValues(gospodarz);
  setOptionValues(gosc);
  // sync function: disable the option selected in "source" from "target"
  const syncSelects = (source, target) => {
    if (!source || !target) return;
    setOptionValues(source);
    setOptionValues(target);

    // enable all options first
    Array.from(target.options).forEach(opt => opt.disabled = false);

    const sourceValue = source.value;
    if (!sourceValue) return;

    const match = Array.from(target.options).find(o => o.value === sourceValue);
    if (!match) return;

    // If the target currently has the same value, pick a different one
    if (target.value === sourceValue) {
      const fallback = Array.from(target.options).find(o => o.value !== sourceValue && !o.disabled);
      if (fallback) {
        fallback.selected = true;
      } else {
        // if no fallback available, keep match disabled but deselect it
        match.selected = false;
      }
    }

    // finally disable the matching option
    match.disabled = true;
  };

  // on-change listeners for both selects
  gospodarz.addEventListener('change', () => {
    syncSelects(gospodarz, gosc);
  });

  gosc.addEventListener('change', () => {
    syncSelects(gosc, gospodarz);
  });

  // Observe DOM changes (e.g., when liga changes innerHTML) and re-sync
  const observeOptions = (selectEl) => {
    if (!selectEl || typeof MutationObserver === 'undefined') return;
    const obs = new MutationObserver(() => {
      // debounce to ensure innerHTML replacement finished
      setTimeout(() => {
        setOptionValues(selectEl);
        syncSelects(gospodarz, gosc);
        syncSelects(gosc, gospodarz);
      }, 0);
    });
    obs.observe(selectEl, { childList: true, subtree: true });
  };

  observeOptions(gospodarz);
  observeOptions(gosc);

  // initial sync for already-populated selects
  syncSelects(gospodarz, gosc);
  syncSelects(gosc, gospodarz);

  gospodarz.addEventListener('change', (event)=>{
    event.preventDefault();
    lokalizacja.value=(druzyny.find(d => d.nazwa === gospodarz.value)).lokal;
  })
const meczeAll = document.getElementById("meczeAll");
var skladGospodarz = (druzyny.find(d => d.nazwa === gospodarz.value)).zawodnicy;
var skladGosc = (druzyny.find(d => d.nazwa === gosc.value)).zawodnicy;


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
  for (let index = 0; index < skladGospodarz.length; index++) { // dodanie opcji kto grał mecz
    selectZawodnik1.innerHTML += `<option value="${skladGospodarz[index]}">${skladGospodarz[index]}</option>`;
    selectZawodnik2.innerHTML += `<option value="${skladGosc[index]}">${skladGosc[index]}</option>`;
  }

  // create legs and keep their initial return values
  let leg1Val = leg(meczID, 1); // initial captured values
  let leg2Val = leg(meczID, 2);
  let leg3Val; // created on demand

  // helper to read current values from DOM for a given leg number
  const getLegValues = (n) => {
    const wEl = document.getElementById(`winnerMecz${meczID}Leg${n}`);
    const lEl = document.getElementById(`lotkaMecz${meczID}Leg${n}`);
    const pEl = document.getElementById(`pozostaleMecz${meczID}Leg${n}`);
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
      // can't decide yet
      return;
    }

    // if legs 1 and 2 differ, ensure leg3 exists; otherwise remove it
    if (w1 !== w2) {
      if (!document.getElementById(`mecz${meczID}leg3`)) {
        leg3Val = leg(meczID, 3); // capture new initial values and store into leg3Val
      }
    } else {
      const leg3 = document.getElementById(`mecz${meczID}leg3`);
      const leg3Name = document.getElementById(`mecz${meczID}leg3Name`);
      if (leg3) leg3.remove();
      if (leg3Name) leg3Name.remove();
      leg3Val = undefined;
    }

    const w3El = document.getElementById(`winnerMecz${meczID}Leg3`);
    matchWinner = w3El ? w3El.value : w1;
    console.log('matchWinner', matchWinner);
  };

  // event delegation on the match element: watch player selects and winner selects
  if (meczEl) {
    meczEl.addEventListener('change', (ev) => {
      const id = ev.target && ev.target.id;
      if (!id) return;
      const relevant =
        id === `gracz1mecz${meczID}` ||
        id === `gracz2mecz${meczID}` ||
        id.startsWith(`winnerMecz${meczID}Leg`);
      if (!relevant) return;
      // If a player select changed, leg() has already replaced innerHTML for winners,
      // so updateMatchWinner will handle creating/removing leg3 and recomputing matchWinner.
      updateMatchWinner();
    });
  }

  // initial check
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
  let divHost=document.getElementById("hosty")
  if (h<=4) {
  divHost.innerHTML +=`
  <select type="text" class="form-control" id="hr${h}" name="hr${h}" required="">
		<option value="Host rezerwowy ${h}" selected>hr${h}</option>
	</select>&nbsp;
  `
  h++
  }
  return false
})
let g = 1
document.getElementById("dodajGoscRezerwowy").addEventListener("click", function() {
  let divGosc=document.getElementById("goscie")
  if (g<=4) {
  divGosc.innerHTML +=`
  <select type="text" class="form-control" id="gr${g}" name="gr${g}" required="">
		<option value="Gość rezerwowy ${g}" selected>gr${g}</option>
	</select>&nbsp;
  `
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

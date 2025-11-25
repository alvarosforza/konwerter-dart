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
    console.log((druzyny.find(d => d.nazwa === gospodarz.value)).lokal)
    lokalizacja.value=(druzyny.find(d => d.nazwa === gospodarz.value)).lokal;
  })
const meczeAll = document.getElementById("meczeAll");
var skladGospodarz = (druzyny.find(d => d.nazwa === gospodarz.value)).zawodnicy;
var skladGosc = (druzyny.find(d => d.nazwa === gosc.value)).zawodnicy;


function single(numer) {
  const mecz = document.createElement("div");
  mecz.id=`mecz${numer}`;
  mecz.className="row"
  mecz.innerHTML=`
  
  <div class="col-sm-6">
  Mecz ${numer}:<br>
  Zawodnik 1:
  <select id="gracz1mecz${numer}" class="form-select">
  </select>
  </div>
  <div class="col-sm-6"><br>
  Zawodnik 2:
  <select id="gracz2mecz${numer}" class="form-select">
  </select>
  <div id="mecz${numer}leg${numer}" class="col-12">
  </div>
  </div>
  `;
  meczeAll.appendChild(mecz)
  for (let index = 0; index < skladGospodarz.length; index++) { // dodanie opcji kto grał mecz
    console.log(skladGospodarz[index])
    document.getElementById(`gracz1mecz${numer}`).innerHTML+= `<option value="${skladGospodarz[index]}">${skladGospodarz[index]}</option>`;
    document.getElementById(`gracz2mecz${numer}`).innerHTML+= `<option value="${skladGosc[index]}">${skladGosc[index]}</option>`;
  }
  let gracz1 = document.getElementById(`gracz1mecz${numer}`).value
  let gracz2 = document.getElementById(`gracz2mecz${numer}`).value
  // stworzenie lega
  let leg = document.getElementById(`mecz${numer}leg${numer}`);
  leg.innerHTML=`Leg ${numer}:<br>Kto wygrał leg? <select id="winnerMecz${numer}leg${numer}" class="form-select">
  <option value="winner${gracz1}">${gracz1}</option>
  <option value="winner${gracz2}">${gracz2}</option>
  </select>
  `;
  // aktualizacje 
  document.getElementById(`gracz1mecz${numer}`).addEventListener("change", (x) => {
    x.preventDefault();
    gracz1 = document.getElementById(`gracz1mecz${numer}`).value
    leg.innerHTML=`Leg ${numer}:<br>Kto wygrał leg? <select id="winnerMecz${numer}leg${numer}" class="form-select">
  <option value="winner${gracz1}">${gracz1}</option>
  <option value="winner${gracz2}">${gracz2}</option>
  </select>
  `
  })
  document.getElementById(`gracz2mecz${numer}`).addEventListener("change", (x) => {
    x.preventDefault();
    gracz2 = document.getElementById(`gracz2mecz${numer}`).value
    leg.innerHTML=`Leg${numer}:<br>Kto wygrał leg? <select id="winnerMecz${numer}leg${numer}" class="form-select">
  <option value="winner${gracz1}">${gracz1}</option>
  <option value="winner${gracz2}">${gracz2}</option>
  </select>
  `
  })
  
  leg.innerHTML+=`<br>Którą lotką wygrano lega?
  <input type="number" id="lotkaMecz${numer}Leg${numer}" min="9" step="1" required><br>
  Ile pozostało punktów przeciwnikowi?
  <input type="number" id="pozostaleMecz${numer}Leg${numer}" min="2" max="501" step="1" required>
  `
  let winner = document.getElementById(`mecz${numer}leg${numer}`).value
  let lotka = document.getElementById(`lotkaMecz${numer}Leg${numer}`).value
  let pozostale = document.getElementById(`pozostaleMecz${numer}Leg${numer}`).value
  
  meczeAll.appendChild(leg);

}
single(1);

// function leg(numer) {

// }


form.addEventListener("submit", function(event) { // na podsumowanie
event.preventDefault();

});
  if ( form ) {
    console.log("Form found");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      
    });
  }

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
});


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("formKonwerter");

  const gospodarz = document.getElementById("gospodarz");
  const gosc = document.getElementById("gosc");
  const liga = document.getElementById("liga");

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

  gospodarz.innerHTML = `<option selected>Happy Angels Toruń</option>
          <option>Point Dart Team</option>
          <option>Bad Boys Merlin</option>
          <option>Przepompownia 3</option>
          <option>Kaper Bullies</option>
          <option>Bad Company London Pub</option>
          <option>NekroMafia Parnasik</option>
          <option>Kaper</option>
          <option>Bull's Eye Inowrocław</option>
          `;
  gosc.innerHTML = `<option>Happy Angels Toruń</option>
  <option selected>Point Dart Team</option>
  <option>Bad Boys Merlin</option>
  <option>Przepompownia 3</option>
  <option>Kaper Bullies</option>
  <option>Bad Company London Pub</option>
  <option>NekroMafia Parnasik</option>
  <option>Kaper</option>
  <option>Bull's Eye Inowrocław</option>`;

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
  
  if (liga) {
    liga.addEventListener('change', (event) => {
      const value = event.target ? event.target.value : liga.value;
      switch (value) {
        case 'Ekstraklasa':  
          gospodarz.innerHTML = `<option selected>Happy Angels Toruń</option>
          <option>Point Dart Team</option>
          <option>Bad Boys Merlin</option>
          <option>Przepompownia 3</option>
          <option>Kaper Bullies</option>
          <option>Bad Company London Pub</option>
          <option>NekroMafia Parnasik</option>
          <option>Kaper</option>
          <option>Bull's Eye Inowrocław</option>
          `;
          gosc.innerHTML = `<option>Happy Angels Toruń</option>
          <option selected>Point Dart Team</option>
          <option>Bad Boys Merlin</option>
          <option>Przepompownia 3</option>
          <option>Kaper Bullies</option>
          <option>Bad Company London Pub</option>
          <option>NekroMafia Parnasik</option>
          <option>Kaper</option>
          <option>Bull's Eye Inowrocław</option>`;

          // ensure values are set after replacing innerHTML
          setOptionValues(gospodarz);
          setOptionValues(gosc);
          break;
          break;
        case '1liga':  
          gospodarz.innerHTML = `
          <option selected>9Darters</option>
          <option>London 2.1</option>
          <option>Falcons Dart Team</option>
          <option>Top Gun Botanic</option>
          <option>Omega EPA</option>
          <option>Squad</option>
          <option>Hell's Merls</option>
          <option>Titanic Botanic</option>
          <option>Klub Piwnica Dart</option>
          <option>Wariaty Antena</option>
          <option>Point G</option>
          <option>Capra</option>
          <option>Crazy Irish</option>
          `
          gosc.innerHTML = `
          <option>9Darters</option>
          <option selected>London 2.1</option>
          <option>Falcons Dart Team</option>
          <option>Top Gun Botanic</option>
          <option>Omega EPA</option>
          <option>Squad</option>
          <option>Hell's Merls</option>
          <option>Titanic Botanic</option>
          <option>Klub Piwnica Dart</option>
          <option>Wariaty Antena</option>
          <option>Point G</option>
          <option>Capra</option>
          <option>Crazy Irish</option>
          `
          break;
        case '2liga':
          gospodarz.innerHTML = `
          <option selected>Lion Darts Unisław - Bydgoszcz</option>
          <option>Pałuki Fajrant Pub</option>
          <option>PrzyStań Murowaniec</option>
          <option>Kaper Dart Team</option>
          <option>Dart Max Toruń</option>
          <option>Crew 26 Botanic</option>
          <option>Sami Swoi</option>
          <option>Dart Song</option>
          <option>Egzotic Botanic</option>
          <option>Osowa</option>
          <option>Ananasy</option>
          <option>180 Dream Team</option>
          <option>Merlin Stars</option>
          <option>Żnin Fajrant Pub</option>
          <option>Pigeons Dart Team</option>
          <option>Feniks London</option>
          <option>Don't Push The Horses</option>
          <option>Piękni i Bestie</option>
          <option>Botanic Poza Zasięgiem</option>
          `
          gosc.innerHTML = `
          <option>Lion Darts Unisław - Bydgoszcz</option>
          <option selected>Pałuki Fajrant Pub</option>
          <option>PrzyStań Murowaniec</option>
          <option>Kaper Dart Team</option>
          <option>Dart Max Toruń</option>
          <option>Crew 26 Botanic</option>
          <option>Sami Swoi</option>
          <option>Dart Song</option>
          <option>Egzotic Botanic</option>
          <option>Osowa</option>
          <option>Ananasy</option>
          <option>180 Dream Team</option>
          <option>Merlin Stars</option>
          <option>Żnin Fajrant Pub</option>
          <option>Pigeons Dart Team</option>
          <option>Feniks London</option>
          <option>Don't Push The Horses</option>
          <option>Piękni i Bestie</option>
          <option>Botanic Poza Zasięgięm</option>
          `
          break;
      };
    });
  }

  if ( form ) {
    console.log("Form found");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      
    });
  }
});
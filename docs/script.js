// TalentLink - Institut Teccart - JavaScript Functions

// Affiche la date courante au format JJ/MM/AAAA
function initializeDate() {
  const dateEl = document.getElementById('current-date');
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  dateEl.textContent = dd + '/' + mm + '/' + yyyy;
}

// Thème sombre / clair (persisté via localStorage)
function initializeTheme() {
  const btn = document.getElementById('toggle-theme');
  
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      btn.textContent = '☀️ Mode clair';
    } else {
      document.documentElement.removeAttribute('data-theme');
      btn.textContent = '🌙 Mode sombre';
    }
  }

  // Lire préférence sauvegardée
  const saved = localStorage.getItem('talentlink_theme') || 'light';
  applyTheme(saved);

  // Écouter le clic sur le bouton
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('talentlink_theme', next);
  });
}

// Bouton vers les diagrammes
function initializeDiagramButton() {
  const btnDiagrammes = document.getElementById('btn-diagrammes');
  
  if (btnDiagrammes) {
    btnDiagrammes.addEventListener('click', () => {
      // Remplacez par le vrai nom de votre page de diagrammes
      window.location.href = "diagrammes.html";
    });
  }
}

//
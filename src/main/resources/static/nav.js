(function () {
  const ROUTES = [
    { href: "/info.html", key: "info", label: "comprendre le diabète / Konprann dyabèt", icon: "ℹ" },
    { href: "/profil.html", key: "profil", label: "Profil / Pwofil", icon: "⚙" },
    { href: "/glycemie.html", key: "glycemie", label: "Glycemie / Glisemi", icon: "◆" },
    { href: "/tendances.html", key: "tendances", label: "Tendances / Tandans", icon: "◇" },
    { href: "/alertes.html", key: "alertes", label: "Alertes / Alet", icon: "!" },
    { href: "/repas.html", key: "repas", label: "Repas / Manje", icon: "◎" },
    { href: "/activite.html", key: "activite", label: "Activite / Aktivite", icon: "↗" },
    { href: "/traitements.html", key: "traitements", label: "Traitements / Tretman", icon: "✚" },
    { href: "/medecins.html", key: "medecins", label: "Medecins / Dokte", icon: "⚕" }
  ];

  function renderNav(activeKey) {
    const mount = document.getElementById("dz-sidebar");
    if (!mount) return;

    const user = window.DZ.state.user;
    const name = user && user.fullName ? window.DZ.escapeHtml(user.fullName) : "Utilisateur / Itilizate";

    const links = ROUTES.map(
      (r) => `
      <a href="${r.href}" class="sidebar__link${r.key === activeKey ? " sidebar__link--active" : ""}" data-key="${r.key}">
        <span class="sidebar__icon" aria-hidden="true">${r.icon}</span>
        <span>${r.label}</span>
      </a>`
    ).join("");

    mount.innerHTML = `
      <div class="sidebar__brand">
        <a href="/glycemie.html" class="sidebar__logo-link" title="Accueil app / Akey app">
          <svg class="sidebar__logo" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="sbDropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#99f6e4"/>
                <stop offset="100%" stop-color="#f43f5e"/>
              </linearGradient>
            </defs>
            <path fill="url(#sbDropGrad)" d="M50 8 C50 8 12 48 12 74 C12 94 29 112 50 112 C71 112 88 94 88 74 C88 48 50 8 50 8 Z"/>
          </svg>
          <span class="sidebar__title">Diabete<span>Zen</span></span>
        </a>
      </div>
      <p class="sidebar__user">${name}</p>
      <nav class="sidebar__nav" aria-label="Sections">${links}</nav>
      <div class="sidebar__footer">
        <a href="/index.html" class="sidebar__muted-link">Site public / Sit piblik</a>
        <button type="button" class="btn btn--ghost" id="dzLogoutBtn">Deconnexion / Dekonekte</button>
      </div>
    `;

    document.getElementById("dzLogoutBtn").addEventListener("click", () => window.DZ.logout());
    if (window.DZ.startBrowserReminders) window.DZ.startBrowserReminders();
  }

  window.DZ.renderNav = renderNav;
})();

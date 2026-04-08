(function () {
  if (!window.DZ.requireAuth()) return;
  window.DZ.renderNav("medecins");

  const { request, escapeHtml, showMessage, exportHistoryPdf, pdfDateStamp } = window.DZ;

  let lastDoctors = [];
  const grid = document.getElementById("doctorsGrid");
  const empty = document.getElementById("doctorsEmpty");

  async function loadDoctors() {
    // Annuaire en lecture publique (pas de JWT requis) — évite 401 si token expiré ou absent
    const data = await request("/api/doctors", { method: "GET" }, false);
    if (!data) return;
    lastDoctors = data;
    grid.innerHTML = "";
    if (!data.length) {
      grid.classList.add("hidden");
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    grid.classList.remove("hidden");
    data.forEach((d) => {
      const card = document.createElement("article");
      card.className = "doctor-card";
      const phone = d.phone
        ? `<a class="doctor-card__link" href="tel:${String(d.phone).replace(/\s/g, "")}">${escapeHtml(d.phone)}</a>`
        : "—";
      const mail = d.email
        ? `<a class="doctor-card__link" href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a>`
        : "—";
      const inst = d.institution ? escapeHtml(d.institution) : "—";
      card.innerHTML = `
        <h3 class="doctor-card__name">${escapeHtml(d.fullName)}</h3>
        <p class="doctor-card__spec">${escapeHtml(d.specialty)}</p>
        <dl class="doctor-card__dl">
          <div><dt>Ville / Vil</dt><dd>${escapeHtml(d.city)}</dd></div>
          <div><dt>Structure / Estrikti</dt><dd>${inst}</dd></div>
          <div><dt>Telephone / Telefòn</dt><dd>${phone}</dd></div>
          <div><dt>Email / Imèl</dt><dd>${mail}</dd></div>
        </dl>`;
      grid.appendChild(card);
    });
  }

  document.getElementById("refreshDoctorsBtn").addEventListener("click", loadDoctors);

  document.getElementById("exportDoctorsPdfBtn").addEventListener("click", () => {
    if (!lastDoctors.length) {
      showMessage("Aucune fiche a exporter. / Pa gen fich pou ekspo.");
      return;
    }
    const head = [["Nom / Non", "Specialite / Espesyalite", "Ville / Vil", "Structure / Estrikti", "Telephone / Telefon", "Email / Imel"]];
    const body = lastDoctors.map((d) => [
      String(d.fullName || "-"),
      String(d.specialty || "-"),
      String(d.city || "-"),
      d.institution ? String(d.institution).slice(0, 100) : "-",
      d.phone ? String(d.phone) : "-",
      d.email ? String(d.email) : "-"
    ]);
    exportHistoryPdf({
      title: "DiabeteZen — Medecins / Dokte",
      subtitle: `Annuaire public · ${pdfDateStamp()}`,
      filename: `DiabeteZen-medecins-${pdfDateStamp()}.pdf`,
      head,
      body,
      orientation: "landscape"
    });
  });

  loadDoctors();
})();

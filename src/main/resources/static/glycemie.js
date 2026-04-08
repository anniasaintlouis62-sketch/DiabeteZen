(function () {
  if (!window.DZ.requireAuth()) return;
  window.DZ.renderNav("glycemie");
  window.DZ.setDefaultDateTimeInputs(["glucoseMeasuredAt"]);

  const { state, request, showMessage, toDateTimeLocal, toLocalDateTimePayload, formatDateTime, escapeHtml, exportHistoryPdf, pdfDateStamp } =
    window.DZ;

  let lastReadings = [];

  const CTX_LABELS = {
    fasting: "A jeun / Jèn",
    before_meal: "Avant repas / Anvan manje",
    after_meal_2h: "2 h apres repas / 2 è apre manje",
    bedtime: "Coucher / Kouche",
    wakeup: "Reveil / Leve",
    random: "Aleatoire / O aza"
  };

  function ctxLabel(c) {
    if (!c) return "-";
    return CTX_LABELS[c] || escapeHtml(c);
  }

  function ctxPlainForPdf(c) {
    if (!c) return "-";
    return CTX_LABELS[c] || String(c);
  }

  async function fetchReadings() {
    if (!state.user) return;
    const data = await request(`/api/glucose?userId=${encodeURIComponent(state.user.id)}`, { method: "GET" }, true);
    if (!data) return;
    lastReadings = data;
    const readingsBody = document.getElementById("readingsBody");
    const readingsTable = document.getElementById("readingsTable");
    const readingsEmpty = document.getElementById("readingsEmpty");
    readingsBody.innerHTML = "";
    if (!data.length) {
      readingsTable.classList.add("hidden");
      readingsEmpty.classList.remove("hidden");
      return;
    }
    readingsEmpty.classList.add("hidden");
    readingsTable.classList.remove("hidden");
    data.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDateTime(r.measuredAt)}</td>
        <td>${r.value}</td>
        <td>${ctxLabel(r.context)}</td>
        <td>${r.note ? escapeHtml(r.note) : "-"}</td>`;
      readingsBody.appendChild(tr);
    });
  }

  document.getElementById("glucoseForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!state.user) return;
    const payload = {
      userId: state.user.id,
      measuredAt: toLocalDateTimePayload(document.getElementById("glucoseMeasuredAt").value),
      value: Number(document.getElementById("glucoseValue").value),
      context: document.getElementById("glucoseContext").value,
      note: document.getElementById("glucoseNote").value.trim() || null
    };
    const data = await request("/api/glucose", { method: "POST", body: JSON.stringify(payload) }, true);
    if (!data) return;
    showMessage("Mesure enregistree. / Mezi anrejistre.");
    document.getElementById("glucoseForm").reset();
    document.getElementById("glucoseMeasuredAt").value = toDateTimeLocal(new Date());
    fetchReadings();
  });

  document.getElementById("refreshReadingsBtn").addEventListener("click", fetchReadings);

  document.getElementById("exportReadingsPdfBtn").addEventListener("click", () => {
    if (!lastReadings.length) {
      showMessage("Aucune mesure a exporter. / Pa gen mezi pou ekspo.");
      return;
    }
    const head = [["Date / Dat", "Valeur (mg/dL)", "Contexte / Konteks", "Note / Not"]];
    const body = lastReadings.map((r) => [
      formatDateTime(r.measuredAt),
      String(r.value),
      ctxPlainForPdf(r.context),
      r.note ? String(r.note).slice(0, 800) : "-"
    ]);
    exportHistoryPdf({
      title: "DiabeteZen — Glycemie / Glisemi",
      filename: `DiabeteZen-glycemie-${pdfDateStamp()}.pdf`,
      head,
      body
    });
  });

  fetchReadings();
})();

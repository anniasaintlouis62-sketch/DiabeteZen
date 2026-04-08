(function () {
  if (!window.DZ.requireAuth()) return;
  window.DZ.renderNav("activite");
  window.DZ.setDefaultDateTimeInputs(["activityStartedAt"]);
  const dur = document.getElementById("activityDuration");
  if (dur && !dur.value) dur.value = "30";

  const { state, request, showMessage, toDateTimeLocal, toLocalDateTimePayload, formatDateTime, escapeHtml, exportHistoryPdf, pdfDateStamp } =
    window.DZ;

  let lastActivities = [];

  const INTENSITY_LABELS = {
    low: "Legere / Lèjè",
    moderate: "Moderee / Modere",
    high: "Intense / Entans"
  };

  function intensityLabel(v) {
    return INTENSITY_LABELS[v] || escapeHtml(v);
  }

  async function fetchActivities() {
    if (!state.user) return;
    const data = await request("/api/activities", { method: "GET" }, true);
    if (!data) return;
    lastActivities = data;
    const activitiesBody = document.getElementById("activitiesBody");
    const activitiesTable = document.getElementById("activitiesTable");
    const activitiesEmpty = document.getElementById("activitiesEmpty");
    activitiesBody.innerHTML = "";
    if (!data.length) {
      activitiesTable.classList.add("hidden");
      activitiesEmpty.classList.remove("hidden");
      return;
    }
    activitiesEmpty.classList.add("hidden");
    activitiesTable.classList.remove("hidden");
    data.forEach((a) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDateTime(a.startedAt)}</td>
        <td>${a.durationMin} min</td>
        <td>${escapeHtml(a.activityType)}</td>
        <td>${intensityLabel(a.intensity)}</td>`;
      activitiesBody.appendChild(tr);
    });
  }

  document.getElementById("activityForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      startedAt: toLocalDateTimePayload(document.getElementById("activityStartedAt").value),
      durationMin: Number(document.getElementById("activityDuration").value),
      activityType: document.getElementById("activityType").value.trim(),
      intensity: document.getElementById("activityIntensity").value,
      note: document.getElementById("activityNote").value.trim() || null
    };
    const data = await request("/api/activities", { method: "POST", body: JSON.stringify(payload) }, true);
    if (!data) return;
    showMessage("Activite enregistree. / Aktivite anrejistre.");
    document.getElementById("activityForm").reset();
    document.getElementById("activityStartedAt").value = toDateTimeLocal(new Date());
    document.getElementById("activityDuration").value = "30";
    fetchActivities();
  });

  document.getElementById("refreshActivitiesBtn").addEventListener("click", fetchActivities);

  document.getElementById("exportActivitiesPdfBtn").addEventListener("click", () => {
    if (!lastActivities.length) {
      showMessage("Aucune activite a exporter. / Pa gen aktivite pou ekspo.");
      return;
    }
    const head = [["Debut / Kòmansman", "Duree (min)", "Type / Kalite", "Intensite / Entansite", "Not"]];
    const body = lastActivities.map((a) => [
      formatDateTime(a.startedAt),
      String(a.durationMin),
      a.activityType ? String(a.activityType).slice(0, 120) : "-",
      intensityLabel(a.intensity),
      a.note ? String(a.note).slice(0, 400) : "-"
    ]);
    exportHistoryPdf({
      title: "DiabeteZen — Activite / Aktivite",
      filename: `DiabeteZen-activite-${pdfDateStamp()}.pdf`,
      head,
      body,
      orientation: "landscape"
    });
  });

  fetchActivities();
})();

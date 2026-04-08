(function () {
  if (!window.DZ.requireAuth()) return;
  window.DZ.renderNav("traitements");
  window.DZ.setDefaultDateTimeInputs(["medLogTakenAt"]);

  const { state, request, showMessage, toDateTimeLocal, toLocalDateTimePayload, formatDateTime, escapeHtml, exportHistoryPdf, pdfDateStamp } =
    window.DZ;

  let lastMedications = [];
  let lastMedLogs = [];

  const FORM_LABELS = {
    tablet: "Comprime / Konprime",
    injection: "Injection / Enjeksyon",
    insulin: "Insuline / Ensilin",
    other: "Autre / Lòt"
  };

  const STATUS_LABELS = {
    taken: "Pris / Pran",
    missed: "Oublie / Bliye",
    partial: "Partiel / Pasyèl"
  };

  function formLabel(v) {
    return FORM_LABELS[v] || escapeHtml(v);
  }

  function statusLabel(v) {
    return STATUS_LABELS[v] || escapeHtml(v);
  }

  function formPlainPdf(v) {
    return FORM_LABELS[v] || String(v || "-");
  }

  function statusPlainPdf(v) {
    return STATUS_LABELS[v] || String(v || "-");
  }

  async function fetchMedications() {
    if (!state.user) return;
    const data = await request("/api/medications", { method: "GET" }, true);
    if (!data) return;
    lastMedications = data;

    const medicationsBody = document.getElementById("medicationsBody");
    const medicationsTable = document.getElementById("medicationsTable");
    const medicationsEmpty = document.getElementById("medicationsEmpty");
    const medLogMedicationId = document.getElementById("medLogMedicationId");

    medicationsBody.innerHTML = "";
    medLogMedicationId.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Choisir / Chwazi…";
    medLogMedicationId.appendChild(opt0);

    if (!data.length) {
      medicationsTable.classList.add("hidden");
      medicationsEmpty.classList.remove("hidden");
      return;
    }
    medicationsEmpty.classList.add("hidden");
    medicationsTable.classList.remove("hidden");
    data.forEach((m) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(m.name)}</td>
        <td>${formLabel(m.form)}</td>
        <td>${escapeHtml(m.dosage)}</td>`;
      medicationsBody.appendChild(tr);
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = m.name;
      medLogMedicationId.appendChild(opt);
    });
  }

  async function fetchMedicationLogs() {
    if (!state.user) return;
    const data = await request("/api/medications/logs/history", { method: "GET" }, true);
    if (!data) return;
    lastMedLogs = data;
    const medLogsBody = document.getElementById("medLogsBody");
    const medLogsTable = document.getElementById("medLogsTable");
    const medLogsEmpty = document.getElementById("medLogsEmpty");
    medLogsBody.innerHTML = "";
    if (!data.length) {
      medLogsTable.classList.add("hidden");
      medLogsEmpty.classList.remove("hidden");
      return;
    }
    medLogsEmpty.classList.add("hidden");
    medLogsTable.classList.remove("hidden");
    data.forEach((l) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDateTime(l.takenAt)}</td>
        <td>${escapeHtml(l.medicationName)}</td>
        <td>${l.doseTaken ? escapeHtml(l.doseTaken) : "-"}</td>
        <td>${statusLabel(l.status)}</td>`;
      medLogsBody.appendChild(tr);
    });
  }

  async function refreshAll() {
    await fetchMedications();
    await fetchMedicationLogs();
  }

  document.getElementById("medicationForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    let schedule;
    try {
      schedule = JSON.parse(document.getElementById("medSchedule").value || "{}");
      if (schedule === null || typeof schedule !== "object" || Array.isArray(schedule)) {
        showMessage("Le planning doit etre un objet JSON (ex. {\"times\":[\"08:00\"]}). / Planifikasyon an dwe yon objè JSON.");
        return;
      }
    } catch {
      showMessage("JSON du planning invalide. / JSON planifikasyon an pa bon.");
      return;
    }
    const payload = {
      name: document.getElementById("medName").value.trim(),
      form: document.getElementById("medForm").value,
      dosage: document.getElementById("medDosage").value.trim(),
      schedule
    };
    const data = await request("/api/medications", { method: "POST", body: JSON.stringify(payload) }, true);
    if (!data) return;
    showMessage("Traitement ajoute. / Tretman ajoute.");
    document.getElementById("medicationForm").reset();
    document.getElementById("medSchedule").value = "{}";
    refreshAll();
  });

  document.getElementById("medLogForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const medId = document.getElementById("medLogMedicationId").value;
    if (!medId) {
      showMessage("Choisis un traitement. / Chwazi yon tretman.");
      return;
    }
    const payload = {
      takenAt: toLocalDateTimePayload(document.getElementById("medLogTakenAt").value),
      doseTaken: document.getElementById("medLogDose").value.trim() || null,
      status: document.getElementById("medLogStatus").value,
      note: document.getElementById("medLogNote").value.trim() || null
    };
    const data = await request(
      `/api/medications/${encodeURIComponent(medId)}/logs`,
      { method: "POST", body: JSON.stringify(payload) },
      true
    );
    if (!data) return;
    showMessage("Prise enregistree. / Pran anrejistre.");
    document.getElementById("medLogTakenAt").value = toDateTimeLocal(new Date());
    document.getElementById("medLogDose").value = "";
    document.getElementById("medLogNote").value = "";
    fetchMedicationLogs();
  });

  document.getElementById("refreshMedicationsBtn").addEventListener("click", refreshAll);

  document.getElementById("exportMedicationsPdfBtn").addEventListener("click", () => {
    if (!lastMedications.length) {
      showMessage("Aucun traitement a exporter. / Pa gen tretman pou ekspo.");
      return;
    }
    const head = [["Nom / Non", "Forme / Fòm", "Dosage / Doz", "Actif / Aktif"]];
    const body = lastMedications.map((m) => [
      String(m.name || "-"),
      formPlainPdf(m.form),
      String(m.dosage || "-"),
      m.active ? "Oui / Wi" : "Non / Non"
    ]);
    exportHistoryPdf({
      title: "DiabeteZen — Traitements / Tretman",
      filename: `DiabeteZen-traitements-${pdfDateStamp()}.pdf`,
      head,
      body
    });
  });

  document.getElementById("exportMedLogsPdfBtn").addEventListener("click", () => {
    if (!lastMedLogs.length) {
      showMessage("Aucune prise a exporter. / Pa gen pran pou ekspo.");
      return;
    }
    const head = [["Date / Dat", "Traitement / Tretman", "Dose / Doz", "Statut / Estati", "Not"]];
    const body = lastMedLogs.map((l) => [
      formatDateTime(l.takenAt),
      String(l.medicationName || "-"),
      l.doseTaken ? String(l.doseTaken) : "-",
      statusPlainPdf(l.status),
      l.note ? String(l.note).slice(0, 400) : "-"
    ]);
    exportHistoryPdf({
      title: "DiabeteZen — Journal des prises / Jounal pran",
      filename: `DiabeteZen-prises-${pdfDateStamp()}.pdf`,
      head,
      body,
      orientation: "landscape"
    });
  });

  refreshAll();
})();

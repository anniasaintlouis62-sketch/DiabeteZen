(function () {
  if (!window.DZ.requireAuth()) return;
  window.DZ.renderNav("alertes");

  const { request, formatDateTime, escapeHtml, showMessage, exportHistoryPdf, pdfDateStamp } = window.DZ;

  let lastAlerts = [];
  const alertsEmpty = document.getElementById("alertsEmpty");
  const alertsList = document.getElementById("alertsList");

  function setVisibility(hasRows) {
    alertsEmpty.classList.toggle("hidden", hasRows);
    alertsList.classList.toggle("hidden", !hasRows);
  }

  async function fetchAlerts() {
    const data = await request("/api/alerts", { method: "GET" }, true);
    if (!data) return;
    lastAlerts = data;
    alertsList.innerHTML = "";
    if (!data.length) {
      setVisibility(false);
      return;
    }
    setVisibility(true);
    data.forEach((a) => {
      const li = document.createElement("li");
      li.className = "alert-item" + (a.read ? " alert-item--read" : "");
      li.innerHTML = `
        <p class="alert-item__text">${escapeHtml(a.message)}</p>
        <div class="alert-item__meta">${formatDateTime(a.createdAt)} · ${escapeHtml(a.alertType)}</div>`;
      if (!a.read) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn--secondary small-btn";
        btn.textContent = "Marquer lu / Make kon li";
        btn.addEventListener("click", async () => {
          const ok = await request(`/api/alerts/${encodeURIComponent(a.id)}/read`, { method: "PATCH", body: "{}" }, true);
          if (ok) fetchAlerts();
        });
        li.appendChild(btn);
      }
      alertsList.appendChild(li);
    });
  }

  document.getElementById("refreshAlertsBtn").addEventListener("click", fetchAlerts);

  document.getElementById("exportAlertsPdfBtn").addEventListener("click", () => {
    if (!lastAlerts.length) {
      showMessage("Aucune alerte a exporter. / Pa gen alet pou ekspo.");
      return;
    }
    const head = [["Date / Dat", "Type / Kalite", "Lu / Li", "Message"]];
    const body = lastAlerts.map((a) => {
      const msg = a.message ? String(a.message).replace(/\s+/g, " ").trim() : "";
      const short = msg.length > 320 ? `${msg.slice(0, 317)}...` : msg;
      return [
        formatDateTime(a.createdAt),
        String(a.alertType || "-"),
        a.read ? "Oui / Wi" : "Non / Non",
        short || "-"
      ];
    });
    exportHistoryPdf({
      title: "DiabeteZen — Alertes / Alet",
      filename: `DiabeteZen-alertes-${pdfDateStamp()}.pdf`,
      head,
      body,
      orientation: "landscape"
    });
  });

  fetchAlerts();
})();

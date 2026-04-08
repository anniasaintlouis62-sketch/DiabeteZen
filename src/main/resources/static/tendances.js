(function () {
  if (!window.DZ.requireAuth()) return;
  window.DZ.renderNav("tendances");

  const { state, request, drawTrendsChart, showMessage, formatDateTime, exportChartHistoryPdf, pdfDateStamp } = window.DZ;

  let lastTrendPoints = [];
  let lastTrendDays = 7;
  const trendsDays = document.getElementById("trendsDays");
  const trendsChart = document.getElementById("trendsChart");
  const trendsEmpty = document.getElementById("trendsEmpty");

  async function fetchTrends() {
    if (!state.user) return;
    const days = trendsDays ? Number(trendsDays.value) || 7 : 7;
    const data = await request(
      `/api/glucose/trends?userId=${encodeURIComponent(state.user.id)}&days=${days}`,
      { method: "GET" },
      true
    );
    if (!data) return;
    lastTrendPoints = data;
    lastTrendDays = days;
    drawTrendsChart(data, trendsChart, trendsEmpty);
  }

  document.getElementById("exportTrendsPdfBtn").addEventListener("click", () => {
    if (!lastTrendPoints.length) {
      showMessage("Pas assez de donnees pour exporter le PDF. / Pa gen ase done pou ekspo PDF.");
      return;
    }
    const tableHead = [["Date / Dat", "Valeur (mg/dL)"]];
    const tableBody = lastTrendPoints.map((p) => [formatDateTime(p.measuredAt), String(p.value != null ? p.value : "-")]);
    const email = state.user && state.user.email ? String(state.user.email) : "";
    exportChartHistoryPdf({
      title: "DiabeteZen — Tendances / Tandans",
      subtitle: `Periode: ${lastTrendDays} j · ${email}`,
      filename: `DiabeteZen-tendances-${pdfDateStamp()}.pdf`,
      canvas: trendsChart,
      tableHead,
      tableBody
    });
  });

  document.getElementById("refreshTrendsBtn").addEventListener("click", fetchTrends);
  if (trendsDays) trendsDays.addEventListener("change", fetchTrends);
  window.addEventListener("resize", () => {
    if (trendsChart && !trendsChart.classList.contains("hidden")) fetchTrends();
  });
  fetchTrends();
})();

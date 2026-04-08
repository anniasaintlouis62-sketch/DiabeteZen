(function () {
  if (!window.DZ.requireAuth()) return;
  window.DZ.renderNav("repas");
  window.DZ.setDefaultDateTimeInputs(["mealEatenAt"]);

  const { state, request, showMessage, toDateTimeLocal, toLocalDateTimePayload, formatDateTime, escapeHtml, exportHistoryPdf, pdfDateStamp } =
    window.DZ;

  let lastMeals = [];

  const MEAL_TYPE_LABELS = {
    breakfast: "Petit-dejeuner / Deje a maten",
    lunch: "Dejeuner / Manje midi",
    dinner: "Diner / Manje swa",
    snack: "Collation / Ti goute"
  };

  function mealTypeLabel(v) {
    return MEAL_TYPE_LABELS[v] || escapeHtml(v);
  }

  async function fetchMeals() {
    if (!state.user) return;
    const data = await request("/api/meals", { method: "GET" }, true);
    if (!data) return;
    lastMeals = data;
    const mealsBody = document.getElementById("mealsBody");
    const mealsTable = document.getElementById("mealsTable");
    const mealsEmpty = document.getElementById("mealsEmpty");
    mealsBody.innerHTML = "";
    if (!data.length) {
      mealsTable.classList.add("hidden");
      mealsEmpty.classList.remove("hidden");
      return;
    }
    mealsEmpty.classList.add("hidden");
    mealsTable.classList.remove("hidden");
    data.forEach((m) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDateTime(m.eatenAt)}</td>
        <td>${mealTypeLabel(m.mealType)}</td>
        <td>${escapeHtml(m.title)}</td>
        <td>${m.carbsGrams != null ? m.carbsGrams : "-"}</td>`;
      mealsBody.appendChild(tr);
    });
  }

  document.getElementById("mealForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const carbs = document.getElementById("mealCarbs").value;
    const gl = document.getElementById("mealGl").value;
    const payload = {
      eatenAt: toLocalDateTimePayload(document.getElementById("mealEatenAt").value),
      mealType: document.getElementById("mealType").value,
      title: document.getElementById("mealTitle").value.trim(),
      carbsGrams: carbs === "" ? null : Number(carbs),
      glycemicLoad: gl === "" ? null : Number(gl),
      note: document.getElementById("mealNote").value.trim() || null
    };
    const data = await request("/api/meals", { method: "POST", body: JSON.stringify(payload) }, true);
    if (!data) return;
    showMessage("Repas enregistre. / Manje anrejistre.");
    document.getElementById("mealForm").reset();
    document.getElementById("mealEatenAt").value = toDateTimeLocal(new Date());
    fetchMeals();
  });

  document.getElementById("refreshMealsBtn").addEventListener("click", fetchMeals);

  document.getElementById("exportMealsPdfBtn").addEventListener("click", () => {
    if (!lastMeals.length) {
      showMessage("Aucun repas a exporter. / Pa gen manje pou ekspo.");
      return;
    }
    const head = [["Date / Dat", "Type / Kalite", "Description", "Glikid (g)", "Chaj GL", "Not"]];
    const body = lastMeals.map((m) => [
      formatDateTime(m.eatenAt),
      mealTypeLabel(m.mealType),
      m.title ? String(m.title).slice(0, 200) : "-",
      m.carbsGrams != null ? String(m.carbsGrams) : "-",
      m.glycemicLoad != null ? String(m.glycemicLoad) : "-",
      m.note ? String(m.note).slice(0, 400) : "-"
    ]);
    exportHistoryPdf({
      title: "DiabeteZen — Repas / Manje",
      filename: `DiabeteZen-repas-${pdfDateStamp()}.pdf`,
      head,
      body,
      orientation: "landscape"
    });
  });

  fetchMeals();
})();

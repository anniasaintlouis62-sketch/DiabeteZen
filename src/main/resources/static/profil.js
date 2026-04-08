(function () {
  if (!window.DZ.requireAuth()) return;
  window.DZ.renderNav("profil");

  const { state, request, showMessage, authenticate, startBrowserReminders, downloadDataZip } = window.DZ;

  function parseTimesInput(str) {
    return String(str || "")
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function fillForm(u) {
    document.getElementById("profilName").value = u.fullName || "";
    document.getElementById("profilEmail").value = u.email || "";
    document.getElementById("profilHypo").value = u.hypoThreshold != null ? u.hypoThreshold : "";
    document.getElementById("profilHyper").value = u.hyperThreshold != null ? u.hyperThreshold : "";
    const s = u.reminderSettings || {};
    document.getElementById("profilBrowserNotify").checked = Boolean(s.browserNotify);
    document.getElementById("profilGlucoseTimes").value = Array.isArray(s.glucoseTimes) ? s.glucoseTimes.join(", ") : "";
    document.getElementById("profilMealTimes").value = Array.isArray(s.mealTimes) ? s.mealTimes.join(", ") : "";
    document.getElementById("profilMedTimes").value = Array.isArray(s.medicationTimes) ? s.medicationTimes.join(", ") : "";
  }

  function reminderPayload() {
    return {
      browserNotify: document.getElementById("profilBrowserNotify").checked,
      glucoseTimes: parseTimesInput(document.getElementById("profilGlucoseTimes").value),
      mealTimes: parseTimesInput(document.getElementById("profilMealTimes").value),
      medicationTimes: parseTimesInput(document.getElementById("profilMedTimes").value)
    };
  }

  async function loadProfile() {
    const u = await request("/api/profile/me", { method: "GET" }, true);
    if (!u) return;
    state.user = u;
    localStorage.setItem("dz_user", JSON.stringify(u));
    fillForm(u);
    startBrowserReminders();
  }

  document.getElementById("profilForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      fullName: document.getElementById("profilName").value.trim(),
      hypoThreshold: Number(document.getElementById("profilHypo").value),
      hyperThreshold: Number(document.getElementById("profilHyper").value),
      reminderSettings: reminderPayload()
    };
    const u = await request("/api/profile/me", { method: "PATCH", body: JSON.stringify(payload) }, true);
    if (!u) return;
    state.user = u;
    localStorage.setItem("dz_user", JSON.stringify(u));
    authenticate({ accessToken: state.token, tokenType: "Bearer", user: u });
    showMessage("Profil enregistre. / Pwofil anrejistre.");
    startBrowserReminders();
  });

  document.getElementById("profilSaveRemindersBtn").addEventListener("click", async () => {
    const payload = {
      hypoThreshold: Number(document.getElementById("profilHypo").value),
      hyperThreshold: Number(document.getElementById("profilHyper").value),
      fullName: document.getElementById("profilName").value.trim(),
      reminderSettings: reminderPayload()
    };
    const u = await request("/api/profile/me", { method: "PATCH", body: JSON.stringify(payload) }, true);
    if (!u) return;
    state.user = u;
    localStorage.setItem("dz_user", JSON.stringify(u));
    authenticate({ accessToken: state.token, tokenType: "Bearer", user: u });
    showMessage("Rappels enregistres. / Rapèl anrejistre.");
    startBrowserReminders();
  });

  document.getElementById("profilRequestNotifyBtn").addEventListener("click", async () => {
    if (!("Notification" in window)) {
      showMessage("Notifications non supportees sur ce navigateur. / Pa gen notifikasyon.");
      return;
    }
    const p = await Notification.requestPermission();
    if (p === "granted") {
      showMessage("Permission accordee. / Pèmisyon bay.");
    } else {
      showMessage("Permission refusee ou bloquee. / Pèmisyon refize.");
    }
  });

  document.getElementById("profilExportZipBtn").addEventListener("click", () => downloadDataZip());

  loadProfile();
})();

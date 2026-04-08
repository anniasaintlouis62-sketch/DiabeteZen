/**
 * DiabeteZen — utilitaires partagés (auth, API, rendu).
 */
(function () {
  function t(value) {
    return value;
  }
  const STORAGE_TOKEN = "dz_token";
  const STORAGE_USER = "dz_user";

  function readStoredToken() {
    const raw = localStorage.getItem(STORAGE_TOKEN);
    return raw ? raw.trim() : null;
  }

  function readStoredUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER) || "null");
    } catch {
      return null;
    }
  }

  const state = {
    token: readStoredToken(),
    user: readStoredUser()
  };

  function reloadStateFromStorage() {
    state.token = readStoredToken();
    state.user = readStoredUser();
  }

  function getMessageBox() {
    return document.getElementById("messageBox");
  }

  function showMessage(message) {
    const el = getMessageBox();
    if (!el) return;
    el.textContent = message;
    el.classList.remove("hidden");
  }

  function hideMessage() {
    const el = getMessageBox();
    if (el) el.classList.add("hidden");
  }

  async function request(url, options = {}, authenticated = false) {
    hideMessage();
    if (authenticated) {
      reloadStateFromStorage();
    }
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    if (authenticated && state.token) {
      headers.Authorization = `Bearer ${state.token}`;
    }
    try {
      const response = await fetch(url, { ...options, headers });
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await response.json() : null;
      if (response.status === 401 && authenticated) {
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USER);
        reloadStateFromStorage();
        showMessage((data && data.message) || "Session expiree / Sesyon ekspire.");
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.setTimeout(() => {
          window.location.href = `/login.html?next=${next}`;
        }, 1600);
        return null;
      }
      if (!response.ok) {
        showMessage((data && data.message) || "Erreur serveur / Ere seve.");
        return null;
      }
      return data;
    } catch {
      showMessage("Impossible de contacter le serveur / Pa ka kontakte seve a.");
      return null;
    }
  }

  function authenticate(authResponse) {
    const t = authResponse.accessToken ? String(authResponse.accessToken).trim() : null;
    state.token = t;
    state.user = authResponse.user;
    if (t) localStorage.setItem(STORAGE_TOKEN, t);
    localStorage.setItem(STORAGE_USER, JSON.stringify(state.user));
  }

  let reminderTimer = null;

  function stopBrowserReminders() {
    if (reminderTimer) {
      window.clearInterval(reminderTimer);
      reminderTimer = null;
    }
  }

  function coerceReminderTimes(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
    return [];
  }

  function reminderTick() {
    reloadStateFromStorage();
    const u = state.user;
    if (!u || !u.reminderSettings) return;
    const s = u.reminderSettings;
    if (!s.browserNotify) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const now = new Date();
    const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const day = now.toISOString().slice(0, 10);

    function fire(kind, times, title, body) {
      const list = coerceReminderTimes(times);
      for (const slot of list) {
        if (slot !== hm) continue;
        const key = `dzrm_${kind}_${day}_${slot}`;
        if (window.sessionStorage.getItem(key)) continue;
        window.sessionStorage.setItem(key, "1");
        try {
          new Notification(title, { body });
        } catch (_) {
          /* ignore */
        }
      }
    }

    fire("glucose", s.glucoseTimes, "Rappel glycemie / Glisemi", "Pensez a enregistrer une mesure. / Sonje anrejistre yon mezi.");
    fire("meal", s.mealTimes, "Rappel repas / Manje", "Pensez a noter votre repas. / Sonje make manje w.");
    fire("med", s.medicationTimes, "Rappel medicament / Medikaman", "Pensez a votre traitement. / Sonje tretman w.");
  }

  function startBrowserReminders() {
    stopBrowserReminders();
    reminderTick();
    reminderTimer = window.setInterval(reminderTick, 45000);
  }

  async function refreshProfileAndRestartReminders() {
    reloadStateFromStorage();
    if (!state.token) return;
    const u = await request("/api/profile/me", { method: "GET" }, true);
    if (!u) return;
    state.user = u;
    localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    startBrowserReminders();
  }

  async function downloadDataZip() {
    reloadStateFromStorage();
    hideMessage();
    if (!state.token) return;
    try {
      const res = await fetch("/api/export/data.zip", {
        headers: { Authorization: `Bearer ${state.token}` }
      });
      if (res.status === 401) {
        showMessage("Session expiree / Sesyon ekspire.");
        return;
      }
      if (!res.ok) {
        showMessage("Export impossible / Ekspo pa marche.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DiabeteZen-export-${new Date().toISOString().slice(0, 10)}.zip`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      showMessage("Export impossible / Ekspo pa marche.");
    }
  }

  function logout() {
    stopBrowserReminders();
    state.token = null;
    state.user = null;
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    window.location.href = "/index.html";
  }

  function requireAuth() {
    reloadStateFromStorage();
    if (!state.token || !state.user) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login.html?next=${next}`;
      return false;
    }
    return true;
  }

  function redirectIfAuthed(defaultTarget) {
    if (state.token && state.user) {
      window.location.href = defaultTarget || "/glycemie.html";
      return true;
    }
    return false;
  }

  function toDateTimeLocal(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function toLocalDateTimePayload(value) {
    if (!value) return null;
    const v = value.trim();
    return v.length === 16 ? `${v}:00` : v;
  }

  function formatDateTime(value) {
    if (value == null) return "-";
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
      return value.replace("T", " ").slice(0, 16);
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("fr-FR");
  }

  function escapeHtml(s) {
    if (s == null) return "";
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function setDefaultDateTimeInputs(ids) {
    const now = toDateTimeLocal(new Date());
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.value) el.value = now;
    });
  }

  function drawTrendsChart(points, canvas, emptyEl) {
    if (!canvas || !emptyEl) return;
    if (!points.length) {
      canvas.classList.add("hidden");
      emptyEl.classList.remove("hidden");
      return;
    }
    emptyEl.classList.add("hidden");
    canvas.classList.remove("hidden");

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(rect.width, 320);
    const cssH = 220;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = cssW;
    const h = cssH;
    const padL = 44;
    const padR = 12;
    const padT = 12;
    const padB = 28;

    ctx.fillStyle = "#f0fdfa";
    ctx.fillRect(0, 0, w, h);

    const vals = points.map((p) => Number(p.value));
    let minV = Math.min(...vals);
    let maxV = Math.max(...vals);
    if (minV === maxV) {
      minV -= 10;
      maxV += 10;
    }
    const span = maxV - minV || 1;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;

    ctx.strokeStyle = "#99f6e4";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, h - padB);
    ctx.lineTo(w - padR, h - padB);
    ctx.stroke();

    ctx.fillStyle = "#5b6b7a";
    ctx.font = "11px system-ui,sans-serif";
    ctx.fillText(String(Math.round(maxV)), 4, padT + 10);
    ctx.fillText(String(Math.round(minV)), 4, h - padB);

    const n = points.length;
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = padT + innerH - ((Number(p.value) - minV) / span) * innerH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = "#e11d48";
    points.forEach((p, i) => {
      const x = padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = padT + innerH - ((Number(p.value) - minV) / span) * innerH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  window.DZ = {
    state,
    request,
    authenticate,
    logout,
    requireAuth,
    redirectIfAuthed,
    showMessage,
    hideMessage,
    toDateTimeLocal,
    toLocalDateTimePayload,
    formatDateTime,
    escapeHtml,
    setDefaultDateTimeInputs,
    drawTrendsChart,
    startBrowserReminders,
    stopBrowserReminders,
    refreshProfileAndRestartReminders,
    downloadDataZip,
    t
  };
})();

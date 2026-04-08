(function () {
  if (window.DZ.redirectIfAuthed("/glycemie.html")) return;

  document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      fullName: document.getElementById("registerName").value.trim(),
      email: document.getElementById("registerEmail").value.trim(),
      password: document.getElementById("registerPassword").value,
      diabetesType: document.getElementById("registerDiabetesType").value
    };
    const data = await window.DZ.request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
    if (!data) return;
    window.DZ.authenticate(data);
    window.location.href = "/glycemie.html";
  });
})();

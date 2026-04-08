(function () {
  if (window.DZ.redirectIfAuthed("/glycemie.html")) return;

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value
    };
    const data = await window.DZ.request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
    if (!data) return;
    window.DZ.authenticate(data);
    const params = new URLSearchParams(window.location.search);
    let next = params.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      window.location.href = next;
    } else {
      window.location.href = "/glycemie.html";
    }
  });
})();

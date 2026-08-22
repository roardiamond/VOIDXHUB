// Page script for register.html (sign-up form).

renderNav("");
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const alertEl = document.getElementById("alert");
  alertEl.innerHTML = "";
  try {
    const res = await VX.post("/api/auth/register", {
      username: fd.get("username"), email: fd.get("email"),
      phone: fd.get("phone"), password: fd.get("password"),
    });
    VX.setSession(res.token, res.user);
    window.location.href = "/dashboard.html";
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  }
});

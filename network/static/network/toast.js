function showToast(message, title = null) {
  const toastEl = document.getElementById("PostToast");
  if (!toastEl || !window.bootstrap) return;

  // Content for toast
  const bodyEl = toastEl.querySelector(".toast-body");
  if (bodyEl) bodyEl.textContent = message;

  // Show toast
  bootstrap.Toast.getOrCreateInstance(toastEl).show();
}
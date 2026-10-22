(() => {
  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  const key = "people-theme";
  let saved;
  try {
    saved = localStorage.getItem(key);
  } catch {}
  let explicit = saved === "light" || saved === "dark" ? saved : null;
  const apply = () => {
    const theme = explicit ?? (preference.matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    const button = document.querySelector("[data-theme-toggle]");
    if (button)
      button.setAttribute(
        "aria-label",
        `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
      );
  };
  apply();
  document.addEventListener("DOMContentLoaded", apply);
  document.addEventListener("click", (event) => {
    if (
      !(event.target instanceof Element) ||
      !event.target.closest("[data-theme-toggle]")
    )
      return;
    explicit =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(key, explicit);
    } catch {}
    apply();
  });
  preference.addEventListener("change", () => {
    if (!explicit) apply();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== key && event.key !== null) return;
    explicit =
      event.newValue === "light" || event.newValue === "dark"
        ? event.newValue
        : null;
    apply();
  });
})();

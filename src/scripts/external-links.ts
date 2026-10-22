// Cover Markdown links and links added by hydrated components too.
const updateExternalLinks = () => {
  for (const link of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    if (!/^(https?:)?\/\//i.test(link.getAttribute("href") ?? "")) continue;
    if (link.origin === window.location.origin) continue;
    link.target = "_blank";
    link.relList.add("noopener", "noreferrer");
  }
};
updateExternalLinks();
new MutationObserver(updateExternalLinks).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["href"],
});

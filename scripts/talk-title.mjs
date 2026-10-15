// Keep imported schedules intact; remove speaker credits for display only.
const normalize = (text) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .toLowerCase();
const nameVariants = {
  "Budhaditya Bhattacharya": "Budha Bhattacharya",
  "Matthew Mahoney": "Matt Mahoney",
};

export function talkTitle(title, speakers = []) {
  const names = speakers
    .flatMap(({ name }) =>
      name ? [name, ...(nameVariants[name] ? [nameVariants[name]] : [])] : [],
    )
    .map(normalize);
  // Only cut at a separator immediately followed by a known speaker's name.
  for (const match of title.matchAll(/\s+[-–—]\s+/g)) {
    const suffix = normalize(title.slice(match.index + match[0].length));
    if (
      names.some(
        (name) =>
          suffix.startsWith(name) &&
          /^(?:\s|,|;|&|$)/.test(suffix.slice(name.length)),
      )
    )
      return title.slice(0, match.index).trim();
  }
  if (title.startsWith("Sponsored Keynote: ")) {
    const suffix = normalize(title.slice("Sponsored Keynote: ".length));
    if (names.some((name) => suffix.startsWith(`${name},`)))
      return "Sponsored Keynote";
  }
  return title;
}

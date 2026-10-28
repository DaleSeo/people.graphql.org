import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Compose each year's Stars cards into a single image for social previews.
const root = path.resolve(import.meta.dirname, "..");
const width = 1200;
const rows = 4;

const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  );

const years = (await readdir(path.join(root, "src/content/stars"))).filter(
  (x) => /^\d{4}$/.test(x),
);
for (const year of years) {
  const dir = path.join(root, `src/content/stars/${year}`);
  const stars = [];
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".json"))) {
    const star = JSON.parse(await readFile(path.join(dir, file), "utf8"));
    const card = path.join(
      root,
      `public/stars/${year}/${star.github?.toLowerCase()}.png`,
    );
    if (star.github && (await exists(card))) stars.push({ ...star, card });
  }
  if (stars.length === 0) continue;
  stars.sort((a, b) => a.name.localeCompare(b.name));

  const cols = Math.ceil(stars.length / rows);
  const cardWidth = Math.floor(width / cols);
  const { width: w, height: h } = await sharp(stars[0].card).metadata();
  const cardHeight = Math.round((cardWidth * h) / w);
  const tiles = await Promise.all(
    stars.map(async (star, i) => ({
      input: await sharp(star.card)
        .resize(cardWidth, cardHeight)
        .png()
        .toBuffer(),
      left: (i % cols) * cardWidth,
      top: Math.floor(i / cols) * cardHeight,
    })),
  );
  const out = path.join(root, `public/stars/${year}/montage.png`);
  await sharp({
    create: {
      width: cardWidth * cols,
      height: cardHeight * rows,
      channels: 3,
      background: "#2a0b2e",
    },
  })
    .composite(tiles)
    .png({ compressionLevel: 9, palette: true })
    .toFile(out);
  console.log(
    `stars/${year}/montage.png: ${stars.length} cards, ${cardWidth * cols}x${cardHeight * rows}`,
  );
}

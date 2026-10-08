# Local contributor avatars

The Stars gallery, stories archive, and homepage use locally hosted PNGs from this directory.
Each GitHub username has one `240 × 240` image, shared across every class year:

```text
public/avatars/ab-pm.png
```

The corresponding Stars JSON field is `"avatar": "/avatars/ab-pm.png"`.
These are current portrait snapshots, not historical portraits for each year.
Visitors make no requests to GitHub to load these images.

## Refresh all portraits

After adding the new year's Stars entries, run from the project root:

```sh
npm install
npm run avatars:refresh
npm run build
```

The refresh script reads every year in `src/content/stars/`, downloads each unique
username from `https://github.com/<username>.png?size=240`, and converts the result
to a real PNG using Sharp. GitHub sometimes returns JPEG or WebP bytes even from
a `.png` URL, so the images are decoded and converted rather than just renamed.
They are resized to 240 × 240 pixels for the gallery and homepage.

All downloads are staged and validated before existing images or data are updated.
If a download fails after retries, fix the reported username/network issue and run
again; the existing images and JSON entries are preserved on download failure.
A successful run replaces all downloaded portraits, updates each year's local
`avatar` path, and removes superseded `.jpg`/`.jpeg` copies for those usernames.
Review and commit the images, data, and `manifest.json` together.

`manifest.json` records the last successful refresh time and included usernames.
Refreshes require network access; normal builds do not download avatars.
Portrait rights remain with their respective owners.

Directory portraits use the canonical `avatarUrl` in `src/content/people/<slug>.json`. Missing portraits temporarily use `jemgillam.png`. Layout and appearance are shared in `src/components/PeopleDirectory.tsx` and its CSS Module.

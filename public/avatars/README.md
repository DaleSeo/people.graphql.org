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

Directory portraits use the canonical `avatarUrl` in `src/content/people/<slug>.json`. When a portrait is missing, omit `avatarUrl`. The shared `Avatar.tsx` component displays the person’s initials in bold Host Grotesk, including when a photo fails to load. This applies to directories and profiles. Layout and appearance are shared in `src/components/PeopleDirectory.tsx` and its CSS Module.

## Refresh working-group portraits

Run `npm run avatars:refresh:wgs` to download avatars for attendees in
`src/content/wgs/`. The script resolves source aliases to canonical people,
downloads each GitHub username once, validates and converts portraits to
240 × 240 PNGs, and updates the matching person records' `avatarUrl` fields.
Existing references are preserved for failed downloads. Other profile fields
and portraits belonging only to other categories are left alone.

`wg-manifest.json` records successful usernames, the refresh time, and any
failures. After refreshing, run `npm run people:sync` and `npm run build` to
update the directory and site. No network requests are needed by site visitors.

## Fill missing conference portraits

Run `node scripts/download-speaker-avatars.mjs 2026` to fill missing portraits
for GraphQLConf 2026 speakers using the Sched photo URLs already stored in
`src/content/talks/graphqlconf/speakers.json`. The script keeps existing
portraits, resolves conference identity aliases, and saves validated 240 × 240
PNGs under the person's profile slug. It updates their `avatarUrl` and records
photo source URLs in `speakers-2026-manifest.json`.

Run `npm run people:sync` and rebuild afterward. Another imported conference
year can be supplied instead of `2026`.

# People of GraphQL

An Astro publication for personal interviews and an annual GraphQL Stars gallery.

## Run locally

Use Node.js 22.19 or newer (required by a transitive dependency). The initial build was also verified on Node.js 22.14, which reports an engine warning.

```sh
npm install
npm run dev
```

Open http://localhost:4321.  
Run `npm run check` for Astro/TypeScript validation  
Run `npm run build` to generate the static site in `dist/`.  
`npm run preview` serves that build locally.

## Clear the local cache

If you make changes but they aren't reflected on a server restart, clear the cache:

```sh
npm run dev --force
```

or while running the server:

```sh
npx astro sync --force
```

## Pages

- `/`: editorial homepage with a featured story and Stars introduction.
- `/stories/`: interview archive.
- `/stories/[id]/`: individual Markdown stories.
- `/stars/`: default Stars destination, opening the 2026 gallery with year selection, search, and expandable contributor profiles.
- `/stars/about/`: background on GraphQL Stars and the official GraphQLConf 2024 launch keynote. Linked from the gallery without replacing it as the main Stars destination.
- `/about/`: project introduction.

## Content

The three interviews remain **fictional samples**.

Each Stars collection contains the 52 Star GitHub usernames, with public display names retrieved from GitHub on 2026-09-14. Profile text is stored locally; builds do not call the GitHub API.

### Stories

Add Markdown files to `src/content/stories/`. The filename becomes the URL slug.

Frontmatter fields:

```yaml
---
title: A story headline
name: Interview subject
description: A short introduction to the story
color: "#797d67"
initials: IS
publishedAt: 2026-09-16
location: London, UK
links:
  - label: Personal website
    url: https://example.com
hero:
  src: /stories/your-photo.jpg
  alt: Describe the photograph
  caption: Photo caption and credit
---
```

Write the approved article beneath the frontmatter. Stories are sorted by `publishedAt` (newest first), with the newest featured on the homepage. Use a publication date in `YYYY-MM-DD` format; dates are displayed in UTC. The existing fictional drafts use placeholder dates of September 14–16, 2026 to preserve their previous order. `location`, `links`, and `hero` are optional. Article pages use the hero photograph when supplied, with initials artwork as a fallback; homepage and archive cards still use initials artwork. Remove preview wording and placeholder reading times in the homepage/archive/article templates when preparing actual publication.

Article text uses a narrow reading column beside a project introduction. Markdown blockquotes (`> Quote text`) become large pull quotes. For a photograph spanning the article width within the body, use `<figure class="story-photo">` with an `<img>` (including descriptive `alt`, dimensions, and `loading="lazy"`) and a `<figcaption>` for its caption and credit. Store photographs locally in `public/stories/`. The longer `finding-a-way-in.md` sample demonstrates these elements with repeated preview text and clearly labelled stock photography; source details are in `public/stories/README.md`.

### Stars

Add one JSON file per person inside `src/content/stars/<year>/`. For example, `2025/benjie.json` and `2026/benjie.json` are independent entries with their own contribution text and TSC flags.

```json
{
  "name": "Person Name",
  "initials": "PN",
  "year": 2026,
  "contribution": "An optional, verified description of their contribution.",
  "github": "github-username",
  "avatar": "https://github.com/github-username.png"
}
```

`github`, `avatar`, and `contribution` are optional. GitHub avatars are hotlinked using `https://github.com/<username>.png`, lazy-loaded, and cropped into circles. They reflect the current GitHub avatar and depend on GitHub availability; missing or failed images display initials. Names and usernames appear inside expandable profiles. Search matches only names and GitHub usernames, ignoring capitalisation, within the selected year. Each year needs its own entry for returning contributors; the year selector automatically expands when additional years are added.

Schemas are in `src/content.config.ts`, shared styles in `src/styles/global.css`, and the shared shell in `src/layouts/Layout.astro`. Stories and Stars use separate Astro content collections: https://docs.astro.build/en/guides/content-collections/.

Optional contribution images go in `public/stars/<year>/<github-username>.png` (for example, `public/stars/2025/acao.png`). A profile popover displays an image only when that exact year's PNG exists at build time; images are loaded when the popover opens. Add or remove files and rebuild to update availability. Images are never shared automatically between years.

## Design and hosting

The theme follows the current GraphQL website: locally hosted Host Grotesk and Commit Mono, Rhodamine pink accents, white editorial pages, and a near-black Stars gallery. The header and footer use the unmodified official GraphQL wordmark; the favicon uses the official hexagraph. Asset provenance and font licences are documented in `public/brand/README.md`. Native disclosure elements keep profiles usable without JavaScript. Search and year switching use a small client-side script.

TSC members are marked with `"tsc": true` on their annual Stars entry and receive a gold `#FFD700` avatar border. Membership reflects who was serving when the cards were produced in August of the class year. Set `"tsc": true` only for members serving at that time; a term ending earlier that year does not qualify. Each year’s flag is independent. Lee Byron’s chair role has no fixed term and qualifies for all three cohorts. Terms were checked against https://handbooks.graphql.org/tsc/members and its canonical source https://github.com/graphql/graphql-wg/blob/main/GraphQL-TSC.md on 2026-09-16.

The Stars loader reads year folders recursively. A person’s entry in one year is independent of their entry in another year.

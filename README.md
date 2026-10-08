# People of GraphQL

A showcase of the people involved in GraphQL, built with Astro and a shared React people directory.

## Run locally

Use Node.js 22.19 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:4321. `npm run check` validates Astro and TypeScript; `npm run build` generates the static site in `dist/`; `npm run preview` serves it locally. `npm test` checks identity and activity rules; after building, `npm run test:site` checks all directory/profile links, anchors, and local assets.

`npm run dev` and `npm run build` first run `people:sync`. After editing source datasets while the dev server is running, run `npm run people:sync` to update the directory. If Astro's content cache is stale, restart `npm run dev`.

## Pages

- `/`: all people, deduplicated, with active and previously active sections.
- `/stories/`: people with published stories. Switch to Articles for story summaries.
- `/stories/[id]/`: existing Markdown articles; filenames define the URL.
- `/stars/`: all Stars classes combined.
- `/stars/2024/`, `/stars/2025/`, `/stars/2026/`: individual classes.
- `/stars/about/`: background on GraphQL Stars.
- `/wg/`: working group participants and the Technical Steering Committee.
- `/wg/tsc/`: current and emeritus TSC members.
- `/wg/spec/`, `/wg/ai/`, `/wg/federation/`, `/wg/golden-path/`, `/wg/graphql-js/`, `/wg/graphiql/`, `/wg/http/`, `/wg/community/`, `/wg/otel/`, `/wg/nullability/`, `/wg/defer-stream/`: working group directories. Federation uses the composite schemas WG dataset.
- `/ambassadors/`: current and emeritus ambassadors.
- `/speakers/`: GraphQLConf speakers across all imported events.
- `/speakers/graphqlconf-2023/` through `/speakers/graphqlconf-2026/`: speakers by event.
- `/profiles/[slug]/`: a person's participation, stories, talks, available YouTube embeds, and Stars contribution cards.
- `/about/`: project background.

All directories share breadcrumbs, introductory copy and an action, category navigation, search, counts, and grid/list modes. Articles mode appears where stories are available. `?view=list` and `?view=article` are shareable; explicit grid/list choices are carried between category links. Search matches names, usernames, locations, organizations, participation labels, and story titles. Counts count people, not appearances.

## Identity and content

`src/content/people/<slug>.json` is the canonical identity record. The filename is a stable profile URL; prefer a GitHub username for the initial slug, otherwise a URL-safe name. Records contain a name, optional GitHub username, avatar URL, optional location and organization, and `sourceIds` tying together source records. Existing identity fields are preserved on subsequent imports, so they can be curated independently of the datasets.

`npm run people:sync` reads the following local datasets:

- `src/content/stars/<year>/*.json`: annual Stars entries. Historical `tsc` flags belong to that class, not today's TSC roster.
- `src/content/stories/*.md`: story frontmatter and article links.
- `src/content/wgs/*.json`: GitHub identity, attendance count, and `lastMeeting`.
- `src/content/tsc/members.json`: membership, terms, historical affiliations, chair and `emeriti` status.
- `src/content/ambassadors/members.json`: cohorts, interests, links and `emeriti` status.
- `src/content/talks/graphqlconf/`: speaker records, explicit speaker aliases, and schedules. Only events with speakers are imported; cancelled events are excluded. Video embeds appear only where a supported YouTube URL exists.

The importer writes `src/data/directory.json`, the build-time participation index, and seeds new person files. No network calls are needed for import or builds. `src/data/identity-aliases.json` records explicit cross-source identity mappings, including differences in conference usernames and source spelling. `src/data/identity-review.json` reports unmatched speaker identities with name-based candidates; review those rather than merging automatically. GitHub usernames are matched case-insensitively. Preserve source IDs when editing people. To resolve a new match, map the source ID to the canonical slug in `identity-aliases.json`, then sync again.

Missing local portraits use `/avatars/jemgillam.png` as a temporary placeholder. Replace `avatarUrl` in the relevant person record as portraits become available. Existing local portraits are reused. `npm run avatars:refresh` refreshes the original Stars portraits. `npm run avatars:refresh:wgs` refreshes all working-group attendees through their canonical GitHub identities and updates their person records. Run `npm run people:sync` afterward to refresh the directory.

### Activity and ordering

TSC and ambassadors use explicit `emeriti` status. Working group participation is active when the last meeting is within the preceding two calendar years (calculated during the build); unknown dates remain active. Stars recognition, stories, and speaking appearances do not expire. On aggregate pages, one active participation makes the person active in that context. Rebuild to advance the activity cutoff.

WG directories order by attendance (summed on the WG overview). TSC places the chair first, followed by names. Stars shuffle once per build so server rendering and client hydration agree. Stories order by newest publication date. Other directories order by name.

### Stories

```yaml
---
title: A story headline
name: Interview subject
github: github-username
description: A short introduction
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

Location, links, GitHub username, and hero are optional. The directory uses avatars; articles and profile story cards use hero photographs. Existing article bodies still contain sample content. Article rendering and typography remain in `src/pages/stories/[id].astro` and `article.module.css`.

### Stars cards

Optional contribution images live at `public/stars/<year>/<github-username>.png`. Profiles show only the matching year's card when the file exists; images are not shared between classes. Annual Stars JSON continues to support name, initials, year, GitHub username, avatar, contribution text, and TSC flag.

## Layout and styling

- `src/components/DirectoryPage.astro`: shared directory shell, breadcrumbs, introduction and action.
- `src/components/PeopleDirectory.tsx`: React filters, modes, search, counts, and people sections.
- `src/pages/[...directory].astro`: static category and subcategory routes.
- `src/lib/directory.ts`: contextual grouping, activity, ordering and navigation.
- `src/pages/profiles/[slug].astro`: profiles and participation links with person anchors.
- `src/layouts/Layout.astro`: document shell, navigation and footer.
- `src/styles/global.css` and `shared.module.css`: fonts, tokens and shared spacing.

Native cross-document View Transitions animate avatars with the same person identity between pages in supporting browsers. Other browsers navigate normally. Reduced-motion preferences disable these transitions. Avatars link to full profile pages.

CSS Modules live beside their components. Use `npx prettier --write .` to format the project; generated output, dependencies, and the package lock are ignored. Prettier's Astro plugin is configured in `.prettierrc.json`.

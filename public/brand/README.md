# Official GraphQL assets

Logo SVGs and font binaries were downloaded without modification from:
https://github.com/graphql/graphql.github.io/tree/5610357d8228fd807f5399b438739356b2577d01

- `graphql.svg`: `public/img/brand/logos/logo.svg`
- `graphql-white.svg`: `public/img/brand/logos/logo-white.svg`
- `graphql-wordmark.svg`: `public/img/brand/logos/logo-wordmark.svg`
- `../favicon.svg`: identical copy of `graphql.svg`
- `../fonts/host-grotesk.woff2`: `src/app/fonts/HostGrotesk-VariableFont_wght.woff2`
- `../fonts/host-grotesk-italic.woff2`: `src/app/fonts/HostGrotesk-Italic-VariableFont_wght.woff2`
- `../fonts/commit-mono.woff2`: `src/app/fonts/CommitMono-VariableFont.woff2`

Typography follows `src/app/fonts/index.tsx`. Colour values follow
`src/app/colors.css` and the Rhodamine token in `tailwind.config.ts`.

Logos are GraphQL trademarks: https://graphql.org/brand/.
The supplied wordmark preserves the official typography and proportions.
The header and footer use Rhodamine on white with clear space; dark gallery
accents use the supplied white hexagraph. Logos are not recoloured or redrawn.

Fonts are self-hosted with their SIL Open Font License notices in `../fonts/`.
Host Grotesk licence source: https://github.com/google/fonts/blob/main/ofl/hostgrotesk/OFL.txt
Commit Mono licence source: https://github.com/eigilnikolajsen/commit-mono/blob/main/LICENSE-FONT

Article pull quotes use self-hosted Rubik Medium (weight 500), including their
opening and closing quotation marks. This is an editorial font addition.

- Font: `../fonts/rubik-medium.ttf`
- Source: https://fonts.googleapis.com/css2?family=Rubik:wght@500&display=swap
- Binary: https://fonts.gstatic.com/s/rubik/v31/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-NYi1UA.ttf
- Licence: `../fonts/Rubik-OFL.txt`, from https://github.com/google/fonts/blob/main/ofl/rubik/OFL.txt

Article hero overlays adapt the conference site's vertical stripe and fading
corner treatment using CSS gradients and masks, with no additional image files.
The greens are `--color-sec-dark` (`hsl(79 98% 37%)`) and `--color-sec-base`
(`hsl(79 90% 65%)`) from the GraphQL palette.
Reference source at commit `1551e868e7de0c56ea826340f9ee1efdf42f34af`:

- https://github.com/graphql/graphql.github.io/blob/1551e868e7de0c56ea826340f9ee1efdf42f34af/src/app/conf/_design-system/stripes-decoration.tsx
- https://github.com/graphql/graphql.github.io/blob/1551e868e7de0c56ea826340f9ee1efdf42f34af/src/app/conf/2026/components/speaker-card.module.css

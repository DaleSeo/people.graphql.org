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

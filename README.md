# A.X.L. — music portfolio

Independent static artist portfolio. English first, Portuguese at `pt-br/`. Black editorial interface with Inter/Archivo typography verified from SSSOM's source, Apple-like interaction audit and Müller grid. No SSSOM application or third-party private skills are bundled.

## Content
17 selected releases: albums, compilations, mixtape, singles and EPs. 15 Spotify release links with track listings; Curta Metragem links to the supplied YouTube recording. TRIZ uses the supplied 2016 cover and Leonardo Irian collaboration; a verified listening link is still pending. Music videos: 12 (three highlighted) and 3 live performances.
Dates follow the supplied text, including Tudo Mudou 2022 regardless of the 2021 cover filename. The SSSOM profile image is used, but its explicitly fictitious biography is not. Biography sources and limitations: [docs/design.md](docs/design.md).

## Development
Requires Node 22+; the static build has no install step or package dependency.

```sh
npm run verify
npm run preview
npm run design:apple
npm run build:domain
```

Initial media import is an explicit local utility requiring a separately installed sharp module through SHARP_MODULE; it refuses to overwrite an existing catalogue. No original images, audio, tokens, font binaries or raw research belong in the repository. The browser audit uses a disposable local browser profile, not the user's personal browser session.

## Hosting
Preview: https://contato675.github.io/axl-portfolio/
Requested final hostname: https://axl.sssom.com/

GitHub Pages serves only the generated branch `pages-preview`; source is in feature branch `feat/axl-portfolio`, reviewed through a PR without self-merge. Run `npm run publish:preview` only after tests and commit/push. The preview retains noindex. Custom-domain output is generated separately in `dist-domain/`, including CNAME and root-relative assets, but is not automatically deployed into an unresolved hostname. See [docs/hosting.md](docs/hosting.md).

## Rights and limits
Music, cover artwork and photographs retain their respective rights; publishing this repository grants no blanket licence to reuse them. Google Fonts are requested through the provider's CSS service, not redistributed in the repository. The English biography awaits artist review. No PDF, user-account system, payment flow, Spotify audio mirror, full accessibility certification or field-performance claim is included.

# A.X.L. — music portfolio

Independent static artist portfolio. English first, Portuguese at `pt-br/`. Black editorial interface with Inter/Archivo typography verified from SSSOM's source, Apple-like interactions and Müller grid. No private SSSOM application or third-party skills are redistributed.

## Content
17 selected releases: albums, compilations, mixtape, singles and EPs. All have listening destinations: 15 Spotify releases with track listings, Curta Metragem and TRIZ on YouTube. There are 12 music videos (three highlighted) and three live performances. More clips starts expanded and can be closed. Video players are loaded only after a click.
Original years follow the supplied document, including Tudo Mudou 2022 despite the cover filename. The requested SSSOM portrait is retained, not its fictitious biography. Contact: ruadoflow@gmail.com. Source references include the Rolling Stone link supplied by the artist.

## Development
Node 22+; no install step or runtime package dependency for the static build.
```sh
npm run verify
npm run design:apple
npm run design:editorial
npm run preview
npm run build:domain
```
Initial media import and explicit poster refresh require a separately installed sharp module through SHARP_MODULE. Originals, audio, credentials, font binaries and raw research are not published. Audits use a disposable browser, not the user's signed-in session.

## Hosting and discovery
Preview: https://contato675.github.io/axl-portfolio/
Target: https://axl.sssom.com/ — not claimed active before DNS and HTTPS validation.
Source: feat/axl-portfolio; deployment: pages-preview; PR remains without self-merge. `npm run publish:preview` requires a clean pushed feature branch and noindex output. `node scripts/verify-published.mjs` checks exact live hashes and editorial requirements.
HTML, Markdown, llms.txt/full and JSON-LD use the same records. Root sitemap generation is opt-in with explicit sign-off; the preview remains noindex with an empty sitemap. A robots.txt inside the GitHub project path is not the policy of the host root. See [discovery and editorial checklist](docs/discovery-and-editorial.md) and [hosting](docs/hosting.md).

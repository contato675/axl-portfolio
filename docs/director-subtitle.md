# Featured films — songwriter and director

The artist requested a new editorial subtitle below Featured films / Clipes em destaque. This is distinct from the previously removed player-loading disclaimer.

PT-BR: Além da composição, A.X.L. também assina a direção de videoclipes.
EN: Beyond songwriting, A.X.L. also directs music videos.

## Source and scope
The directing role was supplied explicitly by the artist in this conversation. It is a statement about his overall practice, not an assertion that he directed every video displayed. Individual video metadata, source titles, collaborators, release years, listening URLs and cover files remain unchanged.

`artist.filmsIntro` is the bilingual source of truth. HTML uses escaped text below the section title; Markdown and llms-full include the same statement in the music-video section; llms.txt includes the English statement; the Person description in JSON-LD includes the same visible information. No per-video director credits are fabricated.

## Prior revision preserved
The badge remains Rapper · Compositor / Rapper · Songwriter. The approved Portuguese introduction, Brazilian identity, collective wording, full-width 16:9 video surfaces, expanded/closable Mais clipes, new email, removed SSSOM footer link, Rolling Stone reference, all 17 releases and all 15 videos remain intact. Native cinematic black bars are not cropped or stretched.

## Discovery and publishing boundaries
Preview publication remains noindex. This update neither changes DNS nor authorizes final indexation. The project-path robots copy does not govern the github.io origin. The prepared custom-domain sitemap remains conditional on explicit editorial and DNS/HTTPS/root verification. No changes are made to SSSOM, Renata, Aplanta, Cloudflare or original Desktop media.

## Verification
Eight additional unit tests cover localized text, text/data parity, escaping, required translations and no fabricated individual credits. The browser editorial audit now checks the exact new subtitle rather than expecting an empty subtitle. The live verifier checks both the new subtitle and its consolidated text representations. Exact results and deployed revision are recorded in the PR after testing and public verification.

## Executed results
- `npm run verify`: 60 tests passed, zero failures; 143 preview files and 144 custom-domain files generated.
- `npm run design:apple`: 55 browser checks passed, zero failures.
- `npm run design:editorial`: 15 browser checks passed, zero failures; all eight responsive/language layouts include the exact new subtitle.
- Screenshots visually inspected: Portuguese video section at 390 px and English video section at 1440 px. No added grey side gutters; original cinematic letterboxing remains preserved.
- Full reports: `audit-director-base.json` and `audit-director-editorial.json`.
These are local-browser/fixture results, not proof of DNS activation or third-party regional playback availability. Public verification follows publication.

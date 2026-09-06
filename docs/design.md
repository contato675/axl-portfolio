# Design and source ledger

## Verified SSSOM source
SSSOM master f4e913efc377e13419c19bfb4199940b6469f431 was read without changes. src/theme/index.css defines Inter Variable / Inter for text, Archivo Variable / Archivo for display and a display width of 110%. HomeHero uses heavy, tightly spaced display headings. This portfolio translates that language into black surfaces and album-led colour rather than importing the application.
Apple-like contracts read: docs/design-system/STUDIO_KIT_PLATFORMS.md; docs/plans/SLICE-04-DESIGN-AUDIT-MATRIX.md. Müller grid skill was read locally, not redistributed. The design uses a 12/8/4-column structure, 8px spacing, consistent gutters and full artwork aspect ratios. There is no public grid toggle or preview badge.

## Components and states
Desktop: restrained navigation + English/Português. Mobile: a Menu disclosure enhanced into a modal drawer with navigation and languages. Hero: Archivo artist name, Inter introduction, SSSOM portrait, listening and biography anchors. Music: separate album/mixtape/compilation and single/EP collections; release card opens details and has a genuine permanent URL. Featured clips use the three choices in the text; all other supplied clips and all three live videos remain available. Videos load only after a click.
Each page remains readable without JS. Dialogs have focus management, Escape, Back/Forward and reduced motion. No landscape image is forced into a square crop. The primary contact is RUADOFLOW's publicly listed email.

## Evidence and data priority
1. User: name, 1990 birth, Jacareí and RUADOFLOW founding role.
2. Links AXL.txt SHA256 175747f19d4fa7df123957c78374cc0aea61f2e527c7952c7ae44259aae4b9fd: release years, listening/video links and highlight selection. Only years are supplied; no invented month/day.
3. Local original covers: primary image source. Tudo Mudou's 2021 filename does not override 2022. TRIZ 2016 is an additional supplied collaborative EP with Leonardo Irian.
4. Spotify oEmbed and embed public metadata: titles, covers where missing locally, track names, credits and durations. No audio previews are copied. Service-title differences are displayed explicitly.
5. YouTube oEmbed: all 16 supplied YouTube links resolved, including Curta Metragem. No inferred video dates or transcripts.
6. SSSOM artist id a2337c6e-68a4-47b8-bf72-6403a552d552: image_url only. Existing biography says it is fictitious and is excluded entirely.

## Public research
- https://www.bocadaforte.com.br/reportagens/eovale-a-x-l-antes-de-tudo-primeira-parte-de-sua-trilogia — artist interview, 27 January 2015; early career, RUADOFLOW, autobiography and Manos e Minas.
- https://portalrnd.com.br/os-albuns-colaborativos-do-rap-brasileiro/ — 2 February 2017; TRIZ collaboration and four tracks.
- https://www.rapdab.com.br/2021/08/25/a-x-l-lanca-o-clipe-da-musica-nada-de-novo-faixa-do-disco-recem-lancado/ — Nada de Novo and Tudo de Novo context; no historical audience figure reused as current.
- https://ruadoflow.com/ — public contact contato@ruadoflow.com. Used as collective contact, not a guessed personal inbox.
- https://developers.google.com/fonts/docs/css2 — fonts served as external CSS, no bundled font files.
- https://developer.apple.com/design/human-interface-guidelines/accessibility — accessibility guidance, not certification.

## Approval boundaries
Artwork selection supplied by the artist; English biography remains an editorial draft. Full production indexation, domain DNS/HTTPS, real-device gestures and screen-reader-user testing are separate from browser checks. No changes to the live SSSOM profile, parent Cloudflare zone, Renata portfolio or original source files are authorized by this implementation.

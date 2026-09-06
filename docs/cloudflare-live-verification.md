# Cloudflare custom-domain verification

The requested hostname axl.sssom.com was created through an independent Workers Custom Domain. The original SSSOM Pages project, its domains and existing Worker routes were re-read and confirmed unchanged. GitHub main and pages-preview remain unchanged.

## First live verification, before indexation
On 2026-09-06 at 22:05:28 UTC, the live custom domain passed checks for valid HTTPS, HTTP 301 to HTTPS, IPv4/IPv6 DNS, both languages, all 17 release routes per language, public text documents and exclusion of private build/source paths.
The deployment receipt matched source cf3f78ca53c0cc6ee65d4a75ed7abaa5fe1ccd92. Among 142 origin assets, 104 were byte-identical over HTTP and 38 retained their full origin bytes with independently identified Cloudflare additions. These 38 are 37 HTML documents plus robots.txt. The deployment receipt is a separate 143rd uploaded asset.
A further live-browser check passed seven scenarios: EN/PT-BR at 390/1440, dialog/Escape, Portuguese mobile navigation, and video disclosure. Physical-device and assistive-technology certification is not implied.

## Managed edge additions, not origin corruption
Cloudflare's existing AI Labyrinth adds a nofollow invisible link. Its JavaScript Detections adds a provider bootstrap. Managed robots.txt prepends the zone's AI crawler policy to the portfolio policy. No bot-trap link was followed, security setting disabled or unrelated site changed.
The GET-only verifier now reports raw equality separately from origin integrity. It recognizes only the exact-host trap at the body start, a reviewed SHA-256 fingerprint for the bootstrap with only its ray/time fields normalized, and the exact reviewed robots preamble fingerprint. All original content must still hash exactly; unknown changes remain failures. The verifier does not rewrite the live response. No general HTML or script removal rule is used.
The site's existing CSP remains unchanged. Provider-injected inline scripts may produce CSP warnings; no unsafe-inline allowance was added to suppress them. Public portfolio navigation and display were tested with the provider additions present.

## Launch controls
The artist's current request to put the site online is the publication instruction. The production approval record is stored only under ignored artifacts/cloudflare, supported by real DNS, TLS, public-root robots and live-browser evidence. Tests are not the approval. Publication with --release enables the 36 canonical sitemap URLs and removes noindex from the final domain, never from the separate GitHub preview. Exact final revision and final live verification are recorded in PR #1 after release.

## References
- https://developers.cloudflare.com/bots/additional-configurations/ai-labyrinth/
- https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/
- https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/

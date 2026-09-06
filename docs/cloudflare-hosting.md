# Hosting axl.sssom.com on Cloudflare

## Scope and authorization
The artist requested bringing the A.X.L. portfolio online at axl.sssom.com using the existing Cloudflare account. Only that exact hostname and the new independent `axl-portfolio` assets-only Worker are in scope. Do not modify SSSOM Pages, other domains, parent DNS, TLS settings, subscriptions or billing plans.
The ChatGPT Cloudflare connector did not expose tools in this turn. The authorized local Wrangler OAuth session was refreshed by the official CLI and successfully read the exact active sssom.com zone. Tokens stay in Wrangler's local store, never in source, reports or frontend assets.

## Architecture
- Source: contato675/axl-portfolio, feature branch and PR without merge.
- Existing GitHub Pages preview remains unchanged and accessible.
- Production origin: Cloudflare Workers Static Assets, no `main` Worker script, runtime bindings, database, account system or Workers AI usage.
- Custom Domain: axl.sssom.com only. Cloudflare provisions DNS and TLS as part of its documented Workers Custom Domain operation. No CNAME pointing to GitHub should be added for this architecture.
- Wrangler is pinned at 4.129.0. `wrangler.jsonc` is strictly checked before building and deployment.
- The public upload excludes .build-manifest.json, CNAME, .nojekyll, source, credentials and original media. `_headers`/`.assetsignore` are provider configuration, not public pages.

## Deployment
`npm run build:cloudflare` builds a noindex domain preview. `npm run publish:cloudflare` requires a clean feature branch already pushed to GitHub. It does not merge main or replace the GitHub preview.
After real DNS/HTTPS/root-robots verification, an explicitly approved release may use `npm run publish:cloudflare -- --release`, with `artifacts/cloudflare/approval.json` naming the exact origin and evidence. Automated tests never supply production sign-off. The release has a 36-URL sitemap; the GitHub preview retains noindex.
The `deployment.json` receipt identifies source revision and exact hashes. HTTP verification must check canonical language routes (HTML /index.html redirects to trailing-slash routes), images, text documents, sitemap/robots, 404 responses and private-file exclusions.
This deployment uses local Wrangler; a GitHub push alone does not update Cloudflare. Use the checked-in publish command after review and validation. No deployment secrets were added to GitHub.

## Primary references
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/wrangler/configuration/

## Pre-deployment checks
66 Node tests passed; 55 Apple-like checks and 15 editorial checks passed. Wrangler 4.129.0 dry-run accepted the assets-only configuration with no runtime bindings. DNS, certificate and public files still require live verification after deploy.

# Allusions studio site

Static production candidate for the ALLUSIONS portfolio and its product pages.

## Architecture

- semantic HTML and CSS only;
- no client JavaScript, frontend build step, analytics, or remote assets;
- Node.js 24 development tooling runs tests without adding a client bundle;
- a Cloudflare Pages Function at `/ai/` proxies the existing AFK AI Worker, preserving its download integrity checks and rewriting local links and redirects under `/ai/`;
- self-hosted Bricolage Grotesque and IBM Plex Mono font files, with their upstream SIL Open Font License 1.1 notices bundled alongside them;
- deployment headers in `_headers`, including a default-deny Content Security Policy;
- product images in `assets/captures/` are real application screenshots, each listed with its build, date and edits in `assets/captures/PROVENANCE.md`; the contract test fails if a capture lacks a provenance entry or a build ID in its caption.
- Quire release captures have separate provenance in `quire/captures/PROVENANCE.md`;
- `products/quire.json` is a verified release snapshot shared by schema with the independent Quire site. Its private repository requires GitHub access; no anonymous download or dedicated website domain is claimed.

## Local preview

From the repository root with Node.js 24:

```sh
npm run preview
```

Open `http://127.0.0.1:4173/` or `http://127.0.0.1:4173/quire/`. Stop with Ctrl+C; use `npm run preview -- --port 4320` if that port is occupied. This dependency-free server binds only to loopback, serves the public static routes with the shared security headers, disables caching and returns the real 404 page for unavailable routes. It does not run the `/ai/` proxy Function.

Use HTTP for review. Double-clicking `index.html` opens a `file://` URL, where `/quire/captures/...` resolves against the drive root instead of this checkout. The production root-relative image, navigation and stylesheet paths are intentional; changing them to suit file access can break nested routes.

For Cloudflare Pages routing and Functions, use an approved local Wrangler 4 installation (qualified with 4.151.3):

```sh
wrangler pages dev . --ip 127.0.0.1 --port 8788 --compatibility-date 2026-10-22
```

This is a local runtime preview, not a deployment. It honors `_headers` and runs the `/ai/` Function, which contacts the existing AFK Worker when requested. No Cloudflare account change or production publication is part of either preview command. See [Cloudflare's local development instructions](https://developers.cloudflare.com/pages/functions/local-development/).

## Verification

On Windows PowerShell:

```powershell
./tests/site-contract.ps1
```

With Node.js 24, install development dependencies and run proxy, runtime, product and deployment-verifier tests:

```sh
npm ci --ignore-scripts
npm test
```

Tests cover proxy routing and download identity, real workerd HTMLRewriter behavior, product metadata, screenshot provenance, and deployed-source comparison failure paths. They do not certify a production deployment.

Check source against the live deployment (or an explicit plain HTTP(S) origin):

```sh
npm run verify:deployment
node scripts/verify-deployment.mjs https://allusions.pages.dev
```

The verifier compares exact HTML bytes on four product routes, requires HTTP 200 and static security headers, rejects redirects, and bounds each response to 2 MiB and 10 seconds. It emits JSON and exits nonzero for drift or unavailable evidence. Passing unit tests are separate from matching deployed source.

GitHub Actions runs these checks without deployment credentials. Refresh the Quire snapshot from authenticated GitHub release metadata and downloaded-asset SHA256 verification. Configure a dedicated site URL only after hosting ownership and deployment approval are established.

Product sites remain authoritative for exact release and download information. Re-check every project destination and status before public deployment.

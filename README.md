# Allusions studio site

Static production candidate for the Allusions studio homepage.

## Architecture

- semantic HTML and CSS only;
- no client JavaScript, build step, package manager, analytics, or remote assets;
- a Cloudflare Pages Function at `/ai/` proxies the existing AFK AI Worker, preserving its download integrity checks and rewriting local links and redirects under `/ai/`;
- self-hosted Bricolage Grotesque and IBM Plex Mono font files, with their upstream SIL Open Font License 1.1 notices bundled alongside them;
- deployment headers in `_headers`, including a default-deny Content Security Policy;
- product images in `assets/captures/` are real application screenshots, each listed with its build, date and edits in `assets/captures/PROVENANCE.md`; the contract test fails if a capture lacks a provenance entry or a build ID in its caption.

## Local preview

Serve the repository root with any static file server, then open `index.html` through that local origin. Direct file access is not representative because the production CSP and root-relative 404 links assume HTTP hosting.

## Verification

On Windows PowerShell:

```powershell
./tests/site-contract.ps1
```

With Node.js 24, verify proxy routing, redirect destinations and unchanged download responses:

```sh
node --test tests/ai-proxy.test.mjs
```

GitHub Actions runs both checks on pushes and pull requests without deployment credentials. The proxy tests exercise the handler with controlled upstream HTTP responses; Cloudflare's HTMLRewriter still requires runtime qualification before deployment.

Product sites remain authoritative for exact release and download information. Re-check every project destination and status before public deployment.

# Allusions studio site

Static production candidate for the Allusions studio homepage.

## Architecture

- semantic HTML and CSS only;
- no JavaScript, build step, package manager, analytics, or remote assets;
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

Product sites remain authoritative for exact release and download information. Re-check every project destination and status before public deployment.

# Commerce contract laboratory

**Local mock only. Off by default. No merchant, checkout, server, payment, email, application licence gate or production Function is configured.** This code is a testable boundary prototype, not a billing system. It cannot enable `sandbox` or `live`; those require separately reviewed adapters and owner actions. Merging this branch cannot activate it.

Run with Node 24:

```sh
npm run test:commerce
npm run commerce:demo
```

The demo runs in memory, generates fresh random secrets, verifies a synthetic paid event and fulfils an original 72-byte text fixture. It does not serve Quire, access its private release, install software, send requests or open a port. Its report explicitly separates mock orders from provider-confirmed orders and leaves unknown fees, taxes and net proceeds null. The price examples are unapproved USD hypotheses from the owner's research, not offers or forecasts.

## Production decision

Provisional first choice: **Lemon Squeezy hosted checkout, vendor-issued licence keys and provider-hosted digital files**. Their [hosted checkout](https://docs.lemonsqueezy.com/help/checkout/hosted-checkout), [licensing](https://docs.lemonsqueezy.com/help/licensing) and [file versions](https://docs.lemonsqueezy.com/help/products/managing-file-versions) cover the basic sale. Do not build or deploy a bespoke payment backend without a concrete unmet requirement. This optional local lab allows security tests before deciding whether any entitlement backend is necessary; Node SQLite is not a production Cloudflare migration.

Lemon's [test environment](https://docs.lemonsqueezy.com/help/getting-started/test-mode) supports checkout/licence/webhook tests but disables file downloads for test purchases. Therefore this synthetic fixture does **not** stand in for a successful merchant-hosted sandbox download. Merchant onboarding and the real test-mode flow remain unperformed.

## Demonstrated boundaries

- Raw bytes are read with a 64 KiB cap and a bounded deadline; JSON media type/UTF-8, exact allowed event schema and test-mode store/product/variant/order identities are checked. Customer grant bodies have a 1 KiB cap. Generic no-store error responses do not echo secrets or provider details.
- HMAC-SHA256 covers the original bytes; a fixed-length timing-safe comparison follows the [vendor signature contract](https://docs.lemonsqueezy.com/help/webhooks/signing-requests). The signed body supplies the event name; an unsigned header cannot change it. Redirects, visitor-supplied receipt IDs and email addresses never grant access.
- SQLite commits event digest and order state in one transaction. Order IDs prevent changed JSON serialization from counting twice. A persistent configuration fingerprint binds the database to the mock product and artifact across restarts. Injected interruption rolls the event and entitlement back together.
- Refunds are irreversible tombstones, including when refund arrives before creation. Partial refund conservatively quarantines the whole mock order; this is a prototype policy requiring an owner decision. A creation older than 24 hours cannot grant access. Old refunds remain able to revoke. Lemon's HMAC has no signed delivery timestamp: these controls do not prove delivery freshness. Production requires authenticated provider reconciliation, including disputes and unusual status changes.
- A mocked response shaped like the [licence validation API](https://docs.lemonsqueezy.com/api/license-api/validate-license-key) must be valid, active, unexpired and match the exact store/product/variant/order. Licence validation is repeated at redemption. No serial-key generator, offline DRM or activation limit is added to Quire.
- Grants are signed for one fixture identity, SHA-256 and byte length, expire after two minutes, and require both a bearer header and the corresponding licence credential. SQLite atomically consumes a nonce once and rechecks expiry/refund state after I/O. The entire fixture is verified before delivery; corruption leaves the grant available for a correct retry. **This single-use local grant is not an R2 presigned URL.** Ordinary presigned URLs are reusable until expiry.
- Mock provider and artifact calls have bounded waits and receive cancellation signals. A timed-out operation cannot later commit a grant. This does not promise termination of an arbitrary adapter that ignores cancellation. No retry loop amplifies a failing provider.
- Normalized IDs, amounts/currency, event digests and grant state are stored. Raw payloads, customer names/emails, licence keys, full tokens and card information are not. Reports are local function calls, not a publicly exposed endpoint.

Tests cover forgery/tamper, invalid identity/mode/status, malformed/oversize inputs, duplicates, reordered/partial refunds, restart persistence, storage interruption/outage, licence mismatch/revocation/outage, token expiry/replay, corrupt bytes, cancellation and concurrent redemption. Independent review/probe receipts live in the engineering handoff. These are deterministic mock tests, not vendor sandbox or production security certification.

## Before any real integration

Owner approval is required for product rights, signed/qualified artifact and actual customer access, price/edition/upgrade/refund policy, merchant KYC/terms/payouts, data retention/privacy, an approved origin, live payment activation and publication. No owner banking/identity action is delegated to this prototype.

If a backend is justified later, independently qualify its deployment secrets, rate limits, transaction durability, migrations, retention/backup/restore, replay/reconciliation workflow, operational alerts, account recovery, chargebacks, multi-item orders, upgrades and provider sandbox failures. Do not use a mock adapter, a success redirect or a branch merge as production authorization. Keep existing free AFK MIT functionality and Claude's DemiMedia ownership intact.

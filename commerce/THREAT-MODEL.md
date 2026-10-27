# Mock commerce boundaries and future adversarial campaign

This is an engineering test plan, not an authorization to operate commerce. The current lab accepts only local mock mode, has no server/live adapter and distributes an original text fixture. Card data, billing, licence issuance and real downloads remain vendor/owner responsibilities. No reserved Claude security credits were used.

| Boundary / threat | Current demonstrated control | Required independent production campaign |
| --- | --- | --- |
| Internet sender forges or edits a payment | Raw HMAC and strict JSON/mode/product identity, body cap, malformed-input tests | Actual vendor sandbox payloads, secret rotation, schema evolution, request/rate limits and restricted endpoint credentials |
| Retry, replay, reordered refund | Durable event digest/order identity, atomic updates, irreversible refund tombstone, creation age bound | Provider reconciliation after outages; late disputes, ambiguous/partial refunds, manual replay authorization and reconciliation alerts |
| Success URL or guessed order grants access | No success redirect flow; matching active mocked vendor licence plus durable paid state | Real provider authorization, account recovery, activation limits, store/variant changes and upgrade/downgrade policy |
| Issued grant survives revocation or gets reused | Revalidate licence and current refund state; two-minute scoped MAC, atomic single use after I/O | Real licence service failure modes, distributed concurrent redemption, clock/secret rotation, support restoration and audit retention |
| Download corruption or unavailable storage | Exact fixture hash/length before delivery; corruption retains grant; bounded adapter wait | Immutable signed software artifact and notices, rights, source commit, real customer access, provider-hosted fulfilment or authorized private storage |
| Interrupted transaction leaves a paid entitlement | SQLite atomic event/state commit and injected rollback/restart tests | Actual deployment database transactions, migrations, corruption, backup/restore, lost-webhook and disaster recovery |
| Customer/merchant data leaks through logs or static files | No raw keys/customer payload stored; sanitized errors; allowlisted public build excludes commerce/developer files | Deployment config, log redaction/retention, merchant account least privilege, encrypted PII where warranted, history/Actions disclosure review |
| Simulated or estimated revenue becomes a business claim | Mock classification; zero confirmed payments from the lab; unknown net/tax/fees remain null | Reconcile real provider settlements/refunds/fees by currency, approved aggregate funnel data and support costs |
| Manuscript or subscriber privacy is traded for conversion | Calculator has no uploads; this prototype has no collection endpoint | Separately approved opt-in notice, server-side abuse verification, suppression/unsubscribe, retention/deletion and consent evidence |

Assume attackers control unsigned headers, public request bodies and bearer strings, and can replay a captured request. Merchant signing keys and local process code are trusted for these mock tests; compromise of those roots is outside the demonstrated controls. Local SQLite and callback adapters are not proof of Cloudflare deployment durability or vendor security.

The vendor HMAC has no signed delivery timestamp. Do not claim age checks authenticate arrival time. Partial-refund quarantine is a conservative mock rule requiring an owner policy. Unknown events never manufacture an entitlement; real reconciliation must handle chargebacks and status changes that this order-only lab does not implement.

Before a paid release, assign an independent reviewer the exact immutable candidate, data-flow diagram, dependencies, accepted merchant SKU/variant IDs, artifact/source/signature/rights manifest and rollback plan. Exercise the full sandbox purchase/refund/redelivery lifecycle and the recovery paths above. A separately approved low-value live purchase/refund is a later gate. Keep deterministic tests, sandbox receipts, independent findings and production evidence separate.

# Commercial readiness — draft evidence pack

Prepared 24 October 2026 from the owner's three commercial documents and current primary vendor documentation; release-access status updated 26 October. **No price, merchant account, purchase flow, advertisement, subscriber collection or publication is activated.** The owner-approved v1.1.0 executable is publicly downloadable; application source remains private. Product rights, signing and physical printing remain separate gates.

## Provisional provider decision

| Option | Verified capability / published baseline | Decision and remaining work |
| --- | --- | --- |
| Lemon Squeezy | Hosted checkout, native software licensing and managed files; 5% + US$0.50 base transaction fee | Provisional first choice for a qualified Quire digital product. Test mode and live data are separate. File downloads are disabled in test mode; no hosted download was tested here. Owner merchant/product acceptance required. |
| Paddle Billing | Merchant of Record and 5% + US$0.50 pay-as-you-go; signed timestamped webhooks | Valid alternative. Current Billing requires separate fulfilment/licence workflows, increasing this product's integration scope. No Paddle adapter is built. |
| Microsoft Store | MSIX and unpackaged Win32 submission paths have different hosting, signing and commerce requirements | Prepare a package/rights/certification assessment before choosing. Current Quire EXE is not Store-certified. No submission or identity action performed. |
| Gumroad | Current direct-sale fees and Discover fees differ; payment processing can be additional | Secondary comparison for original digital packs, not a configured storefront. Obtain actual terms/settlement economics before choosing. |

Primary references: [Lemon fees](https://docs.lemonsqueezy.com/help/getting-started/fees), [test-mode restrictions](https://docs.lemonsqueezy.com/help/getting-started/test-mode), [acceptable use](https://docs.lemonsqueezy.com/help/getting-started/prohibited-products), [Paddle pricing](https://www.paddle.com/pricing), [Paddle fulfilment comparison](https://developer.paddle.com/migrate/learn/feature-comparison/), [Paddle webhook signatures](https://developer.paddle.com/webhooks/about/signature-verification/), [Microsoft distribution paths](https://learn.microsoft.com/en-us/windows/apps/distribute-through-store/how-to-distribute-your-win32-app-through-microsoft-store), [Gumroad fees](https://gumroad.com/help/article/66-gumroads-fees). Checked 24 October 2026. This comparison is not an acceptance, merchant agreement or eligibility guarantee.

Lemon's published extras include 1.5% international, 1.5% PayPal and 0.5% subscription charges; payout fees depend on method/location. Fees apply to total order value, including tax. Its acceptable-use restrictions mean a software SKU does not automatically cover AFK consulting or donation-only sales. Confirm the actual store terms before any offer. AFK's existing MIT core remains free.

`npm run commerce:demo` produces **scenario-only** USD arithmetic for the owner's unapproved $29/$39/$49 hypotheses. At $29, zero tax and only the 5%+$0.50 base fee, estimated proceeds are $27.05; this excludes payout/FX, support, refunds, disputes and income tax. No traffic, purchase intent or paying-customer baseline was observed. Ten hypothetical sales are not ten orders; one-time sales are not MRR.

## Useful acquisition and reproducible assets

The dedicated Quire site owns the browser-only calculator and researched articles. It has no assigned approved public origin. The portfolio retains `/quire/` as its internal information route; do not insert a fictional dedicated domain or anonymous private-release download.

Generate an **unpublished**, deterministic media pack into a new, separate folder:

```sh
npm run growth:assets -- ../../temp/quire-growth-review
```

The pack contains an original eight-page schematic, byte-verified v1.0.0 Book/Covers captures, a captioned HTML demo storyboard and the four-week editorial JSON. It contains no external requests or customer claims. The owner-supplied Home image remains correctly labelled elsewhere as an unverified build and is not substituted for a verified released capture. This is a storyboard and vector media pack, not an actually recorded video or physically printed practice pack.

### Community evidence and two draft answers

Actual public questions show confusion about extra blank pages and page order/duplex settings: [blank pages at signature ends](https://www.reddit.com/r/bookbinding/comments/1am7qed/), [imposition and flipped backs](https://www.reddit.com/r/bookbinding/comments/1ff6cdg/). These are qualitative problem examples, not market size, willingness-to-pay or customer evidence. Current community promotion rules have not been qualified for a post; no outreach is authorized.

**Draft A:** Count actual document pages rather than printed footer numbers. A folded duplex sheet holds four book pages, so the final booklet may need padding. First inspect whether those blank positions are already in the imposed preview. A numbered eight-page proof can isolate page order without sharing your manuscript. If affiliation becomes relevant and the community allows it, disclose that the author maintains Quire.

**Draft B:** Treat imposition, the driver's booklet/n-up feature and duplex flip as separate decisions. Avoid applying booklet layout twice. If preview order is right but backs are upside down, test the particular printer's flip/orientation using a tiny numbered proof. Do not assume every printer feeds paper alike. Offer an explanation before any product link, disclose maker affiliation and obtain publication approval.

The four-week schedule has an explicit owner and draft status. It adapts the supplied pack; it does not invent completed videos, testimonials, search volume, print results or subscribers. Proposed paid original template packs require their own physical and distribution-rights qualification. Affiliate links need an approved relationship and clear disclosure. No ads or spending are added; AdSense cannot be evaluated economically without actual eligible traffic, and is excluded from product, checkout and download interfaces.

## Consent and measurement design — disabled

No form or collection endpoint exists. Proposed separate scopes are product-test invitations and optional newsletter content; neither is preselected or bundled with product access. A future approved flow is **request → server-verified abuse controls → unconfirmed → confirmed scoped consent → suppression/unsubscribe or deletion**. Owner must supply real sender identity/contact, privacy notice/version, lawful retention and terms before capture. Do not use support messages as newsletter consent.

Keep only the minimum subscriber address and scoped consent proof, with restricted access, confirmation/version timestamps and a suppression record preventing re-import. Use a separate protected store, bounded retention, export/deletion and restoration rules. Confirm the exact retention period with the owner. Future Turnstile must call server-side Siteverify and enforce expiry/single-use, plus rate limits; a client widget alone is insufficient. No Turnstile widget or backend has been activated by this work.

Draft welcome: “Thanks for confirming interest in Quire testing. We will send only the updates you selected. A public purchase or download is not promised. You can unsubscribe at any time.” Draft feedback: “Did your own document open, preview and export correctly? If you tried paper, did the backs, margins and order match? Describe the failure stage; do not send a sensitive manuscript.” Both need approved real sender/contact, working unsubscribe and privacy links before sending. [CRTC consent/unsubscribe guidance](https://crtc.gc.ca/eng/com500/faq500.htm) informs this design; it is not a legal compliance signoff.

With separate privacy approval, measure aggregate qualified visits, calculator/demo use, product-information clicks, independent first-use success, confirmed opt-ins, provider-confirmed paid orders/refunds, actual fees/net settlements and support failures. Keep sources and currencies distinct; identify approximate attribution and missing denominators. Do not infer purchases from redirects, clicks or estimates. The local commerce report marks every event as mock and real confirmation as absent; unknown fees/net remain null. No production analytics, cookies, tracking beacon, fingerprint or manuscript telemetry is introduced.

## Owner-only launch gates

Proposed evidence targets from the source plan—10 outside testers, at least 7 useful outputs and at least 3 physical print trials—have **not** been met by this work. First resolve Quire source/history/privacy, contributor/asset/package rights and version-matched notices; independently qualify the distributable, signature and customer-access path. Then approve SKU/price/refunds/upgrades, merchant/KYC/payouts, privacy/consent and hosting. Sandbox testing, deployment, live billing, source visibility, executable publication and promotional distribution are separate actions. Keep the first approval request small and concrete; a source-code merge is not a paid launch.

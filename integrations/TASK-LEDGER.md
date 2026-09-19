# Sales Dashboard task ledger

## Scope update, latest user decision

Removed the visible Payments import-status badge at user request. Outstanding automatic payment-ingestion work remains recorded here, not displayed in the dashboard.

Removed all links from the Amazon payouts display, including payment timing, sample report, and archive. Original report files and integration references remain intact.

Amazon payouts is permanently visible, not collapsible. Payments issued and confirmed deposits display $0 as explicitly labeled empty-state placeholders until real payment/deposit data is connected. This does not imply payment ingestion is active or bank deposits are verified.

Data health section and its navigation link removed at user request. This is presentation-only: storage, FX rules, sync endpoint, and outstanding import setup are unchanged.

Dashboard is now Amazon-export-only: sales, royalties, 50/50 split, daily/cumulative sales, and payments. Unconnected rankings, reviews, social, website, attribution, and marketing boxes are removed. Earlier integration proposals below are superseded, not pending work. No scrapers, paid data providers, or social APIs unless explicitly reopened.

Active remaining steps: implement Payments report ingestion using the verified template and validate actual status/FX fields when records arrive; update the Notion SOP to the simplified scope; verify dashboard custom DNS without changing the GHL landing page; review other straightforward Amazon exports only when supplied. Bank deposit confirmation remains separate. Automatic sales imports are active; payment imports are not.

Maintain this record throughout the user's quick-fire task batch. At the end, provide one clean next-steps list in the chat, separating completed work from deferred items. Do not claim a placeholder or reviewed template is a working automatic integration.

## Completed

- Dashboard branding and finance layout, cumulative sales default, no Stripe fees, no viewer password, and permanently visible payouts section implemented.
- Three overlapping KDP exports combined without double counting: 62 paid copies through September 18, 2026.
- Original currencies preserved; USD columns and audited dated conversions added. USD retail estimate $1,672.09 and royalty equivalent $786.05.
- Mandatory USD conversion applies to every sales import; unavailable or invalid FX aborts the import safely.
- Google Apps Script authorization, Drive API v3 support, private sync property, verified first run, and 15-minute Exports-folder trigger completed.
- Sales Dashboard SOP created in Notion Documents and linked to From Scratch.
- First header-only Payments report inspected. Report/archive links and empty-state text added; payment mapping and guardrails saved. No payout records or bank receipts invented.
- Amazon Attribution, rankings, reviews, social, website, marketing, and data-health boxes removed under the simplified Amazon-export-only scope.

## Deferred next steps

1. Implement payment import/storage and Google folder scanning using KDP-PAYMENTS-MAPPING.md. Validate actual status values and Amazon FX direction when the first populated report arrives. Bank deposit confirmation remains separate.
2. Update the Notion Sales Dashboard SOP to reflect the simplified scope and active automatic sales import.
3. Confirm DNS for sales.readfromscratch.com without altering the public landing-page domain. Verify access/privacy expectations: the dashboard currently has no viewer authentication.
4. Review additional straightforward Amazon exports only when the user supplies them.

## Decisions

- Do not build Amazon Attribution now. Revisit only if explicitly requested.
- Social tracking is recommended, but Instagram and Pinterest connection work is deferred until account types, authorization, usefulness, and user preferences are confirmed. Do not silently add another empty Pinterest box.
- The user will send more tasks; wait until the batch is finished before presenting the consolidated next-steps list.

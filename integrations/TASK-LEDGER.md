# Sales Dashboard task ledger

## Scope update, latest user decision

Removed all links from the Amazon payouts display, including payment timing, sample report, and archive. Original report files and integration references remain intact.

Amazon payouts is permanently visible, not collapsible. Payments issued and confirmed deposits display $0 as explicitly labeled empty-state placeholders until real payment/deposit data is connected. This does not imply payment ingestion is active or bank deposits are verified.

Data health section and its navigation link removed at user request. This is presentation-only: storage, FX rules, sync endpoint, and outstanding import setup are unchanged.

Dashboard is now Amazon-export-only: sales, royalties, 50/50 split, daily/cumulative sales, and payments. Unconnected rankings, reviews, social, website, attribution, and marketing boxes are removed. Earlier integration proposals below are superseded, not pending work. No scrapers, paid data providers, or social APIs unless explicitly reopened.

Active remaining steps: complete and test Google folder-import authorization/trigger; implement Payments report ingestion using verified template and validate actual status/FX fields when records arrive; update Notion SOP to simplified scope; verify dashboard custom DNS without changing the GHL landing page; review other straightforward Amazon exports only when supplied. Bank deposit confirmation remains separate, and automatic sales/payment folder imports are not active yet.

Maintain this record throughout the user's quick-fire task batch. At the end, provide one clean next-steps list in the chat, separating completed work from deferred items. Do not claim a placeholder or reviewed template is a working automatic integration.

## Completed

- Dashboard branding and finance layout, cumulative sales default, no Stripe fees, no viewer password, and collapsed payouts section implemented.
- Two overlapping KDP exports combined without double counting: 46 paid copies through September 17, 2026.
- Original currencies preserved; USD columns and audited dated conversions added. USD retail estimate $1,242.25 and royalty equivalent $583.09.
- Mandatory USD conversion applies to every sales import; unavailable or invalid FX aborts the import safely.
- Sales Dashboard SOP created in Notion Documents and linked to From Scratch.
- First header-only Payments report inspected. Report/archive links and empty-state text added; payment mapping and guardrails saved. No payout records or bank receipts invented.
- Amazon Attribution box removed at user request, including its navigation entry. Rankings retains its own section.
- Ratings + reviews box now identifies Amazon and Goodreads as separate sources. Data not connected yet.

## Deferred next steps

1. Complete Google Apps Script authorization, enable its Drive service, securely enter the sync secret, and activate/test the prepared folder-import trigger. Automatic Drive imports are not active.
2. Implement payment import/storage and Google folder scanning using KDP-PAYMENTS-MAPPING.md. Validate actual status values and Amazon FX direction when the first populated report arrives. Bank deposit confirmation remains separate.
3. Confirm paperback and Kindle Amazon listing IDs, choose a permitted rank/ratings provider, verify cost and API credentials, and add scheduled collection/history. Save observed milestones and last successful check.
4. Obtain and verify the From Scratch Goodreads book URL; choose/test a permitted Goodreads source, review cost/access, and connect ratings/review counts. Keep Amazon and Goodreads totals separate.
5. Confirm whether shared @readfromscratch Instagram is Business/Creator. If personal, the user decides whether to switch. Explore direct Instagram Login and insights permissions without requiring a Facebook Page; Meta app setup/review and token maintenance may still be required. Never scrape private insights or assume shared credentials grant access.
6. Confirm Pinterest profile URL and business-account status. Pinterest's Instagram connection does not authorize dashboard API access and does not expose original IG engagement. If useful, track Pinterest impressions, saves, and outbound clicks separately via approved API authorization or report exports. Do not infer purchases from clicks or blend duplicate cross-post metrics.
7. Website analytics: GHL native stats inspected previously; assess available export/API access and ask before adding a new tracking script. Purchase-page click rate is sessions with a click / total sessions, not completed Amazon purchases. Public landing page stays in GHL.
8. Decide how to populate the dated marketing timeline.
9. Confirm DNS for sales.readfromscratch.com without altering the public landing-page domain. Verify access/privacy expectations: the dashboard currently has no viewer authentication.

## Decisions

- Do not build Amazon Attribution now. Revisit only if explicitly requested.
- Social tracking is recommended, but Instagram and Pinterest connection work is deferred until account types, authorization, usefulness, and user preferences are confirmed. Do not silently add another empty Pinterest box.
- The user will send more tasks; wait until the batch is finished before presenting the consolidated next-steps list.

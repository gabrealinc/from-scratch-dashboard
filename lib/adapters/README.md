# Data adapters

The dashboard UI reads a normalized dashboard snapshot. Each source integration should write to the same database schema, keeping vendors replaceable.

- `kdp.ts`: Google Drive raw export archive → cumulative master Google Sheet → database sync. KDP revenue is ingested as reported and sales tax is not subtracted automatically.
- `instagram.ts`: Meta Graph API metrics for `@readfromscratch`.
- `website.ts`: ReadFromScratch.com traffic and outbound Amazon click events from the site's analytics provider.
- `attribution.ts`: Amazon Attribution detail-page views, add-to-cart events, and purchases.
- `amazon.ts`: replaceable rankings, category milestones, ratings, and reviews provider.


The current deployment reads verified KDP snapshots from private Vercel Blob storage. Other source integrations are pending.

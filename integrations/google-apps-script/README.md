# From Scratch cloud import

1. Open the Running Sales Report → Extensions → Apps Script.
2. Paste Code.gs into the bound script. Enable the Drive API v3 advanced service.
3. Add SYNC_SECRET in Script properties, matching Vercel's SYNC_SECRET.
4. Run setupFromScratchSync once and approve Google's requested Drive, Sheets, external-request, and trigger permissions.
5. Confirm the initial sync succeeds and a 15-minute trigger appears.

The script polls for new or modified exports every 15 minutes while Google's service is available. It supports full KDP XLSX exports and native Google Sheets with royalty tabs. It does not support incomplete CSV/Orders-only exports. A failed import preserves the last successful dashboard snapshot and triggers Google's normal Apps Script failure reporting. It never deletes or modifies raw archive files.

Generated tabs: Sales Master, Import Log, Dashboard Summary, Daily Sales. These are authoritative cumulative reporting tabs. The original KDP tabs are preserved as the original report reference, not the live master.

Each source file's modification time determines precedence. Rows within one export with the same royalty date, order date, book ID, marketplace, format, royalty rate, transaction type, and currency are aggregated. The latest export replaces matching groups rather than adding duplicate sales. Missing groups are retained from older exports because these reports do not declare full date coverage. To reverse a group, use a corrected export with explicit zero/refund rows. Partial-period daily exports sharing a natural key cannot be safely added; use full daily or cumulative KDP reports.

KDP royalty is the author-proceeds source of truth. Retail value is an estimate from reported average offer price times net units. Amazon fees are the difference and are not deducted again from royalty. No extra sales tax is removed. Currencies are never silently converted. Other analytics remain unavailable until connected.

Dashboard data is held in a private Vercel Blob snapshot store, not a relational SQL database. Server-only reads bypass Blob caching, and the dashboard refreshes its view every minute. The sync endpoint uses a separate secret, stored only in server settings and Google Script properties.

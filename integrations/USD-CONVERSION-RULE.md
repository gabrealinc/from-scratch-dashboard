# USD reporting rule

Every successful KDP import must convert all marketplaces to USD before publishing the dashboard. Keep original amounts and currency unchanged in Sales Master columns A:R. Append FX rate date, USD-per-unit rate, FX source, retail USD, printing/delivery USD, Amazon fees USD, and KDP royalty USD in S:Y. All dashboard finance totals and the Gabby/Ryan split use USD equivalents.

Use the ECB reference rate through Frankfurter v2 on the KDP royalty date (the dashboard reporting basis), or the most recent available prior business day within seven calendar days. USD uses rate 1. Round each converted financial row to cents, then sum. Fees equal converted retail less converted royalties; printing is already included. Split total USD royalties 50/50, retaining exact halves before display rounding.

Never add overlapping export totals together. The latest matching KDP aggregate replaces the earlier version. No additional sales-tax deduction and no Stripe fees. Missing, unsupported, invalid, future, or stale FX rates must stop the import rather than publish partial USD totals. The previous verified dashboard snapshot remains available.

USD equivalents are reporting estimates, not Amazon's actual conversion or a bank payout. Actual payments and withholding require separate KDP Payments records. Rate requests send only currency/date, not sales records or customer data.

Pipeline: archive raw Drive exports, normalize and deduplicate, convert to USD, prepare generated Sheets tabs, read back every written cell, then commit the private dashboard snapshot. Automatic Drive-folder imports remain inactive until the Google Apps Script setup and authorization are completed.

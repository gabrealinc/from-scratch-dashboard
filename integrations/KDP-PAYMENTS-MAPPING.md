# KDP Payments report mapping

Verified sample: https://docs.google.com/spreadsheets/d/1F8EEUwqdGs828ITeImBP5zavfW4MWoJxTjF9-Jfhuh8/edit

Raw archive: https://drive.google.com/drive/folders/1HwwXhVnBAxzuhAYVW_9bvr4RoujhCjxM

The first sample is header-only, with no payment records. It is a schema reference, not evidence of a bank deposit or a complete lifetime payment history. Automatic payment ingestion is active through the same 15-minute Google Apps Script trigger used for sales exports.

## Observed columns, in order

1. Blank leading column, ignore
2. Sales Period - Start Date
3. Sales Period - End Date
4. Marketplace
5. Payment Number
6. Detail
7. Date
8. Payment Method
9. Currency (royalty currency)
10. Accrued Royalty
11. Tax Withholding
12. Net Earnings
13. Source
14. FX Rate
15. Currency (payout currency; CSV hydration calls this Currency.1)
16. Payout Amount
17. Payment Status

## Required importer rules

- Keep payment records separate from sales rows and royalty totals. Never add payout amounts to book revenue or subtract a payout from earned royalties.
- Keep original report files intact. Preserve source ID, modified date, report date coverage, both currency fields, all original values, and payment status.
- Resolve repeated Currency headers by column position, not a single name lookup.
- Latest revised export wins for an overlapping payment identity. Prefer payment number plus marketplace, source, royalty period, and payout currency; never blindly append cumulative exports. Missing or ambiguous identity must be reviewed rather than merged speculatively.
- Validate real populated records. Blank rows are ignored. Header-only reports produce an explicit empty import, never fabricated payment rows, dates, or bank deposits.
- Do not infer the meaning of nonempty Payment Status values from this empty template. Verify actual values in the first populated report before classifying issued, pending, failed, or cancelled payments.
- Use Payout Amount in the second Currency field for cash flow, not Accrued Royalty or Net Earnings in the first currency.
- Preserve Amazon's FX Rate as reported. Its direction must be verified against populated amounts before using it. Do not multiply Payout Amount by Amazon's rate again.
- A USD payout is already an actual Amazon-reported USD payment amount. For a non-USD payout, add a dated reference-rate USD equivalent using the existing conversion rule and label it an estimate. Preserve Amazon's conversion separately.
- Tax Withholding is a payment adjustment, not sales tax. Do not deduct it again from KDP sales royalties or the earned 50/50 split.
- An issued payment is not a confirmed bank deposit. Deposit confirmation and received date are separate fields requiring evidence.
- Do not calculate a lifetime unpaid balance or promise a next payout date without complete comparable sales and payment coverage, currency handling, and status classification.

## Dashboard placement

Use the permanently expanded Amazon payouts section below Sales Velocity. Display Amazon-reported payouts from the cumulative payment master and keep confirmed bank deposits at zero until separate bank evidence exists. The overview's copies, gross estimate, fees, royalties, and Gabby/Ryan split remain unchanged.

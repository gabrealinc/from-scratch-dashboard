export type RawReport = { id: string; name: string; modifiedTime: string; tables: Record<string, (string | number)[][]> };
export type Sale = {
  date: string; orderDate: string; title: string; author: string; bookId: string;
  marketplace: string; format: string; royaltyType: string; transactionType: string;
  sold: number; refunded: number; netUnits: number; retailValue: number;
  manufacturingCost: number; royalty: number; currency: string;
  sourceId: string; sourceModifiedAt: string;
  fx?: {date:string; rate:number; source:string};
  retailUsd?:number; manufacturingUsd?:number; feesUsd?:number; royaltyUsd?:number;
};
export type Snapshot = { version: 1; syncedAt: string; latestDate: string; sales: Sale[];
  usdConverted?: boolean;
  reports: { id: string; name: string; modifiedTime: string }[];
  totals: { copies: number; gross: number; fees: number; manufacturing: number; royalties: number };
  currencies: { currency: string; royalty: number; copies: number }[];
  daily: { date: string; daily: number; cumulative: number }[];
};
export const salesHeaders = ["Royalty date", "Order date", "Title", "Author", "Book ID", "Marketplace", "Format", "Royalty type", "Transaction type", "Units sold", "Units refunded", "Net units", "Retail value estimate", "Printing / delivery cost estimate", "KDP royalty", "Currency", "Source file ID", "Source modified at"];
const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const key = (r: Sale) => JSON.stringify([r.date,r.orderDate,r.bookId,r.marketplace,r.format,r.royaltyType,r.transactionType,r.currency]);
export function buildSnapshot(reports: RawReport[]): Snapshot {
  if (!Array.isArray(reports) || !reports.length) throw new Error("No reports supplied. Existing data was not changed.");
  const all = new Map<string, Sale>();
  for (const report of [...reports].sort((a,b)=>a.modifiedTime.localeCompare(b.modifiedTime)||a.id.localeCompare(b.id))) {
    if (!report.id || !report.name || !Number.isFinite(Date.parse(report.modifiedTime))) throw new Error("Invalid report metadata.");
    const grouped = new Map<string, Sale>();
    let found = false;
    for (const [tab, format] of [["eBook Royalty","eBook"],["Paperback Royalty","Paperback"],["Hardcover Royalty","Hardcover"]]) {
      const table = report.tables[tab];
      if (!table) continue;
      found = true;
      const headers = table[0]?.map(String) ?? [];
      const idx = (name: string) => headers.indexOf(name);
      for (const name of ["Royalty Date","Title","Marketplace","Units Sold","Units Refunded","Net Units Sold","Royalty","Currency"]) {
        if (idx(name) < 0) throw new Error(`Missing ${name} in ${report.name} / ${tab}. No partial import allowed.`);
      }
      for (const values of table.slice(1)) {
        if (!values.some(v=>v!==""&&v!==null)) continue;
        const s = (name: string) => String(values[idx(name)] ?? "");
        const n = (name: string) => {
          const value = values[idx(name)];
          if (value === "" || value === undefined || !Number.isFinite(Number(value))) throw new Error(`Invalid ${name} in ${report.name}`);
          return Number(value);
        };
        const date = s("Royalty Date");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date))) throw new Error("Royalty dates must be ISO dates.");
        const units = n("Net Units Sold");
        const costHeader = format === "eBook" ? "Avg. Delivery Cost" : "Avg. Manufacturing Cost";
        const row: Sale = {date,orderDate:s("Order Date"),title:s("Title"),author:s("Author Name"),bookId:s(format==="eBook"?"ASIN":"ISBN"),marketplace:s("Marketplace"),format,royaltyType:s("Royalty Type"),transactionType:s("Transaction Type"),sold:n("Units Sold"),refunded:n("Units Refunded"),netUnits:units,retailValue:units*n("Avg. Offer Price without tax"),manufacturingCost:units*n(costHeader),royalty:n("Royalty"),currency:s("Currency"),sourceId:report.id,sourceModifiedAt:report.modifiedTime};
        if (!row.bookId || !/^[A-Z]{3}$/.test(row.currency)) throw new Error("Invalid book identifier or currency.");
        if (![row.sold,row.refunded,row.netUnits].every(Number.isInteger) || row.sold-row.refunded!==row.netUnits) throw new Error("KDP unit totals do not reconcile.");
        if (!row.title.startsWith("From Scratch")) continue;
        const k = key(row);
        const prev = grouped.get(k);
        if (prev) for (const field of ["sold","refunded","netUnits","retailValue","manufacturingCost","royalty"] as const) prev[field] += row[field];
        else grouped.set(k,row);
      }
    }
    if (!found) throw new Error(`Unsupported KDP export: ${report.name}. Expected royalty tabs.`);
    for (const [k,r] of grouped) all.set(k,r);
  }
  const sales = [...all.values()].sort((a,b)=>key(a).localeCompare(key(b))).map(r=>({...r,retailValue:cents(r.retailValue),manufacturingCost:cents(r.manufacturingCost),royalty:cents(r.royalty)}));
  const usd = sales.filter(r=>r.currency==="USD");
  const sum = (rows: Sale[], field: "retailValue"|"royalty"|"manufacturingCost"|"netUnits") => cents(rows.reduce((n,r)=>n+r[field],0));
  const byDay = new Map<string,number>();
  for (const r of sales) byDay.set(r.date,(byDay.get(r.date)??0)+r.netUnits);
  let cumulative=0;
  const daily=[...byDay].sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({date,daily:value,cumulative:cumulative+=value}));
  return {version:1,syncedAt:new Date().toISOString(),latestDate:daily.at(-1)?.date??"",sales,reports:reports.map(({id,name,modifiedTime})=>({id,name,modifiedTime})),totals:{copies:sum(sales,"netUnits"),gross:sum(usd,"retailValue"),fees:cents(sum(usd,"retailValue")-sum(usd,"royalty")),manufacturing:sum(usd,"manufacturingCost"),royalties:sum(usd,"royalty")},currencies:[...new Set(sales.map(r=>r.currency))].sort().map(currency=>({currency,royalty:sum(sales.filter(r=>r.currency===currency),"royalty"),copies:sum(sales.filter(r=>r.currency===currency),"netUnits")})),daily};
}
export function sheetPlan(snapshot: Snapshot) {
  const headers = snapshot.usdConverted ? [...salesHeaders,"FX rate date","USD per original currency unit","FX source","Retail value (USD)","Printing / delivery (USD)","Amazon printing + fees (USD)","KDP royalty (USD)"] : salesHeaders;
  return {
    "Sales Master":[headers,...snapshot.sales.map(r=>[r.date,r.orderDate,r.title,r.author,r.bookId,r.marketplace,r.format,r.royaltyType,r.transactionType,r.sold,r.refunded,r.netUnits,r.retailValue,r.manufacturingCost,r.royalty,r.currency,r.sourceId,r.sourceModifiedAt,...(snapshot.usdConverted?[r.fx!.date,r.fx!.rate,r.fx!.source,r.retailUsd!,r.manufacturingUsd!,r.feesUsd!,r.royaltyUsd!]:[])])],
    "Import Log":[["Source file ID","File name","Source modified at","Last successful sync","Status"],...snapshot.reports.map(r=>[r.id,r.name,r.modifiedTime,snapshot.syncedAt,"Synced"])],
    "Dashboard Summary":[["Metric","Value","Definition"],["Paid copies",snapshot.totals.copies,"Net paid units across currencies, royalty-date basis"],["Retail value estimate (USD)",snapshot.totals.gross,"KDP average offer price without tax × net units; all currencies converted to USD when FX is enabled"],["Amazon printing + fees (USD)",snapshot.totals.fees,"USD retail estimate less USD royalty; includes Amazon share and printing/delivery"],["Printing / delivery component (USD)",snapshot.totals.manufacturing,"Reported average cost × net units, converted to USD; already included in Amazon fees"],["KDP royalty equivalent (USD)",snapshot.totals.royalties,"All currencies converted at dated reference rates; reporting estimate, not actual bank payout"],["Gabby 50% (USD)",snapshot.totals.royalties/2,"50% of combined USD royalty equivalent"],["Ryan 50% (USD)",snapshot.totals.royalties/2,"50% of combined USD royalty equivalent"],["Updated",snapshot.syncedAt,"Latest successful source import"],["Latest royalty date",snapshot.latestDate,"Not necessarily the customer's order date"]],
    "Daily Sales":[["Royalty date","Net paid units","Cumulative paid units"],...snapshot.daily.map(r=>[r.date,r.daily,r.cumulative])]
  };
}

import type { Snapshot, Sale, Payment } from "./reporting.ts";
export type FxRate = {date:string;rate:number;source:string};
const cents=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export async function referenceRate(currency:string,date:string):Promise<FxRate> {
  const url=`https://api.frankfurter.dev/v2/providers/ecb/rate/${currency.toLowerCase()}/usd?date=${date}`;
  // Only currency and date are sent to the provider, never report contents.
  const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error(`No verified USD rate for ${currency} on ${date}. Existing dashboard data was not changed.`);
  const data=await response.json() as {date:string;base:string;quote:string;rate:number};
  if(data.base!==currency||data.quote!=="USD")throw new Error("Unexpected FX currency pair.");
  return {date:data.date,rate:data.rate,source:"ECB via Frankfurter v2"};
}
export async function convertToUsd(snapshot:Snapshot,resolve=referenceRate):Promise<Snapshot> {
  const rates=new Map<string,FxRate>();
  const sales:(Sale & {fx:FxRate;retailUsd:number;royaltyUsd:number;manufacturingUsd:number;feesUsd:number})[]=[];
  for(const sale of snapshot.sales){
    const key=`${sale.currency}:${sale.date}`;
    let fx=rates.get(key);
    if(!fx){
      fx=sale.currency==="USD"?{date:sale.date,rate:1,source:"USD identity"}:await resolve(sale.currency,sale.date);
      const age=Date.parse(sale.date)-Date.parse(fx.date);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(fx.date)||!Number.isFinite(age)||age<0||age>7*86400000||!Number.isFinite(fx.rate)||fx.rate<=0||!fx.source)throw new Error(`Invalid or stale FX rate for ${key}. Import stopped.`);
      rates.set(key,fx);
    }
    const retailUsd=cents(sale.retailValue*fx.rate),royaltyUsd=cents(sale.royalty*fx.rate);
    sales.push({...sale,fx,retailUsd,royaltyUsd,manufacturingUsd:cents(sale.manufacturingCost*fx.rate),feesUsd:cents(retailUsd-royaltyUsd)});
  }
  const payments:(Payment & {payoutFx:FxRate;payoutUsd:number})[]=[];
  for(const payment of snapshot.payments??[]){
    const key=`${payment.payoutCurrency}:${payment.paymentDate}`;
    let fx=rates.get(key);
    if(!fx){
      fx=payment.payoutCurrency==="USD"?{date:payment.paymentDate,rate:1,source:"USD identity"}:await resolve(payment.payoutCurrency,payment.paymentDate);
      const age=Date.parse(payment.paymentDate)-Date.parse(fx.date);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(fx.date)||!Number.isFinite(age)||age<0||age>7*86400000||!Number.isFinite(fx.rate)||fx.rate<=0||!fx.source)throw new Error(`Invalid or stale FX rate for ${key}. Import stopped.`);
      rates.set(key,fx);
    }
    payments.push({...payment,payoutFx:fx,payoutUsd:cents(payment.payoutAmount*fx.rate)});
  }
  const sum=(field:"retailUsd"|"royaltyUsd"|"manufacturingUsd")=>cents(sales.reduce((n,r)=>n+r[field],0));
  return {...snapshot,usdConverted:true,sales,payments,payouts:{count:payments.length,totalUsd:cents(payments.reduce((n,r)=>n+r.payoutUsd,0)),latestPaymentDate:payments.map(r=>r.paymentDate).sort().at(-1)??""},totals:{copies:snapshot.totals.copies,gross:sum("retailUsd"),royalties:sum("royaltyUsd"),manufacturing:sum("manufacturingUsd"),fees:cents(sum("retailUsd")-sum("royaltyUsd"))}};
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSnapshot, type RawReport } from "../lib/reporting.ts";
const headers = ["Royalty Date","Order Date","Title","Author Name","ISBN","Marketplace","Royalty Type","Transaction Type","Units Sold","Units Refunded","Net Units Sold","Avg. Offer Price without tax","Avg. Manufacturing Cost","Royalty","Currency"];
function report(id: string, units = 2, modifiedTime = "2026-09-16T12:00:00Z", currency = "USD"): RawReport {
  return {id,name:"Synthetic test export",modifiedTime,tables:{"Paperback Royalty":[headers,["2026-09-15","2026-09-14","From Scratch test","Test authors","123","Amazon.com","60%","Standard",units,0,units,20,3,units*9,currency]]}};
}
test("overlapping exports do not duplicate sales", () => {
  assert.equal(buildSnapshot([report("a"),report("b")]).totals.copies,2);
});
test("newest revision replaces matching aggregate, independent of input order", () => {
  const result = buildSnapshot([report("b",3,"2026-09-17T12:00:00Z"),report("a")]);
  assert.equal(result.totals.copies,3);
  assert.equal(result.totals.royalties,27);
  assert.equal(result.totals.fees,33);
});
test("royalty already includes Amazon fees and no tax is subtracted", () => {
  const result=buildSnapshot([report("a")]);
  assert.equal(result.totals.gross,40);
  assert.equal(result.totals.royalties,18);
  assert.equal(result.totals.manufacturing,6);
});
test("currencies are kept separate, USD financial totals exclude foreign currency", () => {
  const result=buildSnapshot([report("a"),report("b",4,undefined,"GBP")]);
  assert.equal(result.totals.copies,6);
  assert.equal(result.totals.royalties,18);
  assert.equal(result.currencies.find(r=>r.currency==="GBP")?.royalty,36);
});
test("separate dates accumulate", () => {
  const b=report("b"); b.tables["Paperback Royalty"][1][0]="2026-09-16";
  assert.equal(buildSnapshot([report("a"),b]).daily.at(-1)?.cumulative,4);
});
test("invalid or unsupported reports fail without partial imports", () => {
  assert.throws(()=>buildSnapshot([]));
  assert.throws(()=>buildSnapshot([{...report("a"),tables:{}}]));
  const b=report("b");b.tables["Paperback Royalty"][1][10]=99;
  assert.throws(()=>buildSnapshot([report("a"),b]),/reconcile/);
});

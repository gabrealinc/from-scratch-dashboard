import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSnapshot, sheetPlan, type RawReport } from "../lib/reporting.ts";
import { convertToUsd } from "../lib/fx.ts";
const headers=["Royalty Date","Order Date","Title","Author Name","ISBN","Marketplace","Royalty Type","Transaction Type","Units Sold","Units Refunded","Net Units Sold","Avg. Offer Price without tax","Avg. Manufacturing Cost","Royalty","Currency"];
const report:RawReport={id:"fx-test",name:"FX fixture",modifiedTime:"2026-09-18T00:00:00Z",tables:{"Paperback Royalty":[headers,["2026-09-17","2026-09-15","From Scratch fixture","Test","123","Amazon.ca","60%","Standard",1,0,1,38.77,5.07,18.19,"CAD"],["2026-09-17","2026-09-15","From Scratch fixture","Test","123","Amazon.com","60%","Standard",1,0,1,27.99,3.86,12.93,"USD"]]}};
test("converts every financial amount and preserves original currency",async()=>{
  const result=await convertToUsd(buildSnapshot([report]),async()=>({date:"2026-09-17",rate:0.71453,source:"Test rate"}));
  assert.equal(result.totals.copies,2);
  assert.equal(result.totals.gross,55.69);
  assert.equal(result.totals.royalties,25.93);
  assert.equal(result.totals.fees,29.76);
  assert.equal(result.totals.manufacturing,7.48);
  assert.equal(result.sales[0].currency,"CAD");
  assert.equal(result.sales[0].royalty,18.19);
  assert.equal(sheetPlan(result)["Sales Master"][0].at(-1),"KDP royalty (USD)");
});
test("accepts previous business-day rate but rejects stale, future, zero, and unavailable rates",async()=>{
  await convertToUsd(buildSnapshot([report]),async()=>({date:"2026-09-16",rate:0.7,source:"Test"}));
  for(const fx of [{date:"2026-09-18",rate:0.7,source:"Test"},{date:"2026-09-01",rate:0.7,source:"Test"},{date:"2026-09-17",rate:0,source:"Test"}])await assert.rejects(convertToUsd(buildSnapshot([report]),async()=>fx));
  await assert.rejects(convertToUsd(buildSnapshot([report]),async()=>{throw new Error("Unavailable");}));
});

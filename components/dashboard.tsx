"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Menu, RefreshCw, X } from "lucide-react";
import type { Snapshot } from "@/lib/reporting";
const money=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2});
function Metric({label,value,detail,accent=false}:{label:string;value:string;detail:string;accent?:boolean}) {
  return <article className={`metric-card ${accent?"accent":""}`}><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}
function Title({kicker,title,aside}:{kicker:string;title:string;aside?:React.ReactNode}) {
  return <div className="section-title"><div><p>{kicker}</p><h2>{title}</h2></div>{aside}</div>;
}
export default function Dashboard({snapshot}:{snapshot:Snapshot|null}) {
  const [menu,setMenu]=useState(false);
  const [series,setSeries]=useState<"daily"|"cumulative">("cumulative");
  const router=useRouter();
  useEffect(()=>{const timer=setInterval(()=>router.refresh(),60000);return()=>clearInterval(timer);},[router]);
  function exportData(){
    if(!snapshot)return;
    const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="from-scratch-sales.json";link.click();URL.revokeObjectURL(url);
  }
  const totals=snapshot?.totals;
  const fmt=(v:number|undefined)=>v===undefined?"Not available":money.format(v);
  const nav=["Overview","Sales","Payouts"];
  return <div className="app-shell">
    <aside className={menu?"sidebar open":"sidebar"}>
      <div className="sidebar-head"><div className="brand-mark">FS</div><button className="icon-button close" onClick={()=>setMenu(false)} aria-label="Close menu"><X/></button></div>
      <div className="book-label"><p>From Scratch</p><span>Sales intelligence</span></div>
      <nav>{nav.map((item,i)=><a href={`#${item.toLowerCase().replace(" ","-")}`} className={i===0?"active":""} key={item} onClick={()=>setMenu(false)}>{item}</a>)}</nav>
      <div className="sidebar-bottom"><div className="sync-note"><span/><p>{snapshot?"Live KDP data":"Awaiting first sync"}</p><small>Last successfully imported export</small></div></div>
    </aside>
    <main>
      <header className="topbar"><button className="icon-button menu" onClick={()=>setMenu(true)} aria-label="Open menu"><Menu/></button><div><p>SALES DASHBOARD</p><h1>Good morning, Gabby + Ryan.</h1></div><div className="top-actions"><button className="range" onClick={()=>router.refresh()}><RefreshCw size={15}/> Refresh view</button><button className="export" onClick={exportData} disabled={!snapshot}><Download size={15}/> Export</button></div></header>
      <div className="content">
        <section id="overview" className="hero-section"><div className="hero-copy"><p className="eyebrow">Overview · KDP exports</p><h2>From Scratch</h2><p>{snapshot?`Reporting through ${snapshot.latestDate}. Synced ${new Date(snapshot.syncedAt).toLocaleString("en-US",{timeZone:"America/Los_Angeles"})} PT.`:"Your first successful import will appear here."}</p></div></section>
        <section className="metric-grid">
          <Metric label="Total copies sold" value={totals?.copies.toLocaleString("en-US")??"Not available"} detail="Net processed units · royalty-date basis" accent/>
          <Metric label="Gross book sales · retail estimate" value={fmt(totals?.gross)} detail="All marketplaces · converted to USD"/>
          <Metric label="Amazon printing + fees" value={fmt(totals?.fees)} detail="Retail estimate less KDP royalty; includes Amazon share"/>
          <Metric label="KDP net proceeds" value={fmt(totals?.royalties)} detail="All royalties · USD reporting equivalent" accent/>
          <Metric label="Gabby · 50%" value={fmt(totals?totals.royalties/2:undefined)} detail="50% of reported KDP royalties"/>
          <Metric label="Ryan · 50%" value={fmt(totals?totals.royalties/2:undefined)} detail="KDP share · exact split retained before rounding"/>
        </section>
        <p className="tax-note">KDP prices are used as reported. No additional sales-tax deduction. Royalties are already net of Amazon costs, which are not deducted twice. International amounts are converted to USD using dated reference rates. Original amounts and currencies are preserved in the running report. USD equivalents are estimates, not confirmed bank payouts.</p>
        <section id="sales" className="panel sales-panel"><Title kicker="Sales velocity" title="Daily + cumulative book sales" aside={<div className="segmented"><button className={series==="daily"?"selected":""} onClick={()=>setSeries("daily")}>Daily</button><button className={series==="cumulative"?"selected":""} onClick={()=>setSeries("cumulative")}>Cumulative</button></div>}/><div className="chart-summary"><strong>{series==="daily"?snapshot?.daily.at(-1)?.daily??0:totals?.copies??0}</strong><span>{series==="daily"?`paid copies on ${snapshot?.latestDate??"latest royalty date"}`:"paid copies across all imported dates"}</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={snapshot?.daily??[]}><defs><linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c72d22" stopOpacity={.28}/><stop offset="100%" stopColor="#c72d22" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#ded8ca" strokeDasharray="2 4" vertical={false}/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill:"#776f64",fontSize:11}} minTickGap={35}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} width={30} tick={{fontSize:11}}/><Tooltip/><Area type="monotone" dataKey={series} stroke="#b9251c" strokeWidth={2.5} fill="url(#redFill)"/></AreaChart></ResponsiveContainer></div></section>
        <section className="panel payouts-panel" id="payouts">
          <Title kicker="Cash flow · separate from earned royalties" title="Amazon payouts"/>
          <div className="payouts-content">
            <p className="payouts-intro">Royalties earned are not the same as money paid into your bank. This section tracks actual Amazon payments without changing the sales totals or 50/50 royalty split above.</p>
            <div className="payouts-grid">
              <Metric label="Royalty equivalent · USD" value={fmt(totals?.royalties)} detail="Earned proceeds in imported KDP sales reports, not confirmed cash received"/>
              <Metric label="Amazon payments issued" value="$0" detail="Empty-report placeholder · no payment records yet"/>
              <Metric label="Confirmed bank deposits" value="$0" detail="Empty-state placeholder · bank deposits require separate confirmation"/>
            </div>
            <p className="payouts-note">Your first Payments report has been reviewed and is empty. Future payment records will use the sales period, marketplace, payment number, payment date and status, withholding, Amazon’s FX rate, payout currency, and payout amount. Unpaid balance and next payout are not calculated from this empty report. Bank arrival dates require separate confirmation.</p>
            <p className="payouts-note">Amazon generally pays monthly, approximately 60 days after the end of the month in which sales were reported, or 90 days for Expanded Distribution, subject to applicable payment requirements. Bank processing can add time. These are timing guidelines, not a promised deposit date.</p>
          </div>
        </section>
      </div><footer><div className="brand-mark small">FS</div><p>FROM SCRATCH · SALES REPORTING</p><span>Built for the story behind the numbers.</span></footer>
    </main>
  </div>;
}

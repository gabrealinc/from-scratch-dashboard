"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, ExternalLink, Menu, RefreshCw, X } from "lucide-react";
import type { Snapshot } from "@/lib/reporting";
const money=new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2});
function Metric({label,value,detail,accent=false}:{label:string;value:string;detail:string;accent?:boolean}) {
  return <article className={`metric-card ${accent?"accent":""}`}><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}
function Title({kicker,title,aside}:{kicker:string;title:string;aside?:React.ReactNode}) {
  return <div className="section-title"><div><p>{kicker}</p><h2>{title}</h2></div>{aside}</div>;
}
function Pending({kicker,title,children}:{kicker:string;title:string;children:React.ReactNode}) {
  return <section className="panel"><Title kicker={kicker} title={title}/><p className="pending-copy">{children}</p><span className="pending-badge">Not connected</span></section>;
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
  const nav=["Overview","Sales","Attribution","Audience","Marketing","Data health"];
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
        <details className="panel payouts-panel" id="payouts">
          <summary><span><span className="eyebrow">Cash flow · separate from earned royalties</span><span className="payouts-title">Amazon payouts</span></span><span className="payouts-toggle">View details <span aria-hidden="true">+</span></span></summary>
          <div className="payouts-content">
            <p className="payouts-intro">Royalties earned are not the same as money paid into your bank. This section tracks actual Amazon payments without changing the sales totals or 50/50 royalty split above.</p>
            <div className="payouts-grid">
              <Metric label="Reported royalties · USD" value={fmt(totals?.royalties)} detail="Earned proceeds in imported KDP sales reports, not confirmed cash received"/>
              <Metric label="Amazon payments issued" value="Not available" detail="Requires KDP Payments report; no payment history imported"/>
              <Metric label="Confirmed bank deposits" value="Not available" detail="Requires deposit confirmation; an issued payment is not a verified bank receipt"/>
            </div>
            <p className="payouts-note">Unpaid balance and next payout are not calculated yet because payment history is missing. Payment dates, royalty periods, marketplace, currency, tax withholding, and payment amounts belong here once the Payments report is connected. Bank arrival dates will be confirmed separately.</p>
            <p className="payouts-note">Amazon generally pays monthly, approximately 60 days after the end of the month in which sales were reported, or 90 days for Expanded Distribution, subject to applicable payment requirements. Bank processing can add time. These are timing guidelines, not a promised deposit date.</p>
            <a className="payouts-link" href="https://kdp.amazon.com/en_US/help/topic/GK2MKZUL6U3SFBPZ" target="_blank" rel="noopener noreferrer">Amazon payment timing <ExternalLink size={14}/></a>
            <span className="pending-badge">Awaiting KDP Payments report</span>
          </div>
        </details>
        <div id="attribution" className="two-col"><Pending kicker="Amazon Attribution" title="From attention to purchase">Detail-page views, add-to-cart events, and attributed purchases will appear when Amazon Attribution is connected. Website clicks alone are not purchases.</Pending><Pending kicker="Amazon position" title="Category rankings + milestones">Rankings and bestseller milestones will appear when the Amazon-data adapter is connected.</Pending></div>
        <div id="audience" className="two-col"><Pending kicker="Amazon readers" title="Ratings + reviews">No live ratings or reviews have been imported yet.</Pending><Pending kicker="@readfromscratch" title="Instagram reach + engagement">Followers, reach, profile visits, and content metrics will appear after Meta authorization.</Pending></div>
        <div id="marketing" className="two-col lower"><Pending kicker="Marketing timeline" title="What moved the story">Add dated campaigns, posts, emails, and appearances when the marketing log is connected.</Pending><Pending kicker="ReadFromScratch.com" title="Traffic + purchase-page clicks">Tracks website sessions and clicks on the Amazon purchase button. Purchase-page click rate means sessions with a purchase-page click divided by total sessions, not completed purchases.</Pending></div>
        <section className="panel sources" id="data-health"><Title kicker="Data health" title="The reporting pipeline" aside={<a className="report-link" href="https://docs.google.com/spreadsheets/d/1y0I6R_wP0d8p6diFDZbJcAuJicLt5BziOwJOpi4Ub08/edit" target="_blank" rel="noopener noreferrer">Running report <ExternalLink size={14}/></a>}/><div className="pipeline"><div>KDP exports<small>Drive raw archive</small></div><span>→</span><div>Running report<small>Normalized + cumulative</small></div><span>→</span><div>Private data store<small>Verified reporting snapshot</small></div><span>→</span><div>From Scratch<small>Refreshes view every minute</small></div></div><div className="source-table"><div><p>KDP + running report</p><span><i/>{snapshot?"Imported successfully":"Awaiting import"}</span><small>{snapshot?.reports.length??0} exports</small></div><div><p>Automatic folder imports</p><span><i/>Google setup required</span><small>Cloud trigger</small></div><div><p>Meta, Attribution, Amazon data, site analytics</p><span><i/>Not connected</span><small>Pending</small></div></div>{snapshot?.currencies.map(c=><p className="currency-note" key={c.currency}>{c.currency}: {c.royalty.toFixed(2)} original-currency royalties · {c.copies} paid copies. Included in USD totals after conversion.</p>)}</section>
      </div><footer><div className="brand-mark small">FS</div><p>FROM SCRATCH · SALES REPORTING</p><span>Built for the story behind the numbers.</span></footer>
    </main>
  </div>;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, BookOpen, ChevronDown, Download, ExternalLink, Eye, Instagram, LogOut, Menu, MousePointerClick, RefreshCw, ShoppingBag, Star, Trophy, Users, X } from "lucide-react";
import { dataUpdatedAt, funnel, metrics, rankings, salesSeries, sourceStatus, timeline } from "@/lib/dashboard-data";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-US");

function MetricCard({ label, value, detail, accent }: { label: string; value: string; detail: string; accent?: boolean }) {
  return <article className={`metric-card ${accent ? "accent" : ""}`}><p>{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function SectionTitle({ kicker, title, aside }: { kicker: string; title: string; aside?: React.ReactNode }) {
  return <div className="section-title"><div><p>{kicker}</p><h2>{title}</h2></div>{aside}</div>;
}

export default function Dashboard() {
  const [menu, setMenu] = useState(false);
  const [range] = useState("Last 30 days");
  const [series, setSeries] = useState<"daily" | "cumulative">("daily");
  const router = useRouter();

  async function logout() { await fetch("/api/auth", { method: "DELETE" }); router.replace("/login"); router.refresh(); }

  const nav = ["Overview", "Sales", "Attribution", "Audience", "Marketing", "Data health"];
  return <div className="app-shell">
    <aside className={menu ? "sidebar open" : "sidebar"}>
      <div className="sidebar-head"><div className="brand-mark">FS</div><button className="icon-button close" onClick={() => setMenu(false)} aria-label="Close menu"><X /></button></div>
      <div className="book-label"><p>From Scratch</p><span>Sales intelligence</span></div>
      <nav>{nav.map((item, i) => <a href={`#${item.toLowerCase().replace(" ", "-")}`} className={i === 0 ? "active" : ""} key={item}>{item}</a>)}</nav>
      <div className="sidebar-bottom"><div className="sync-note"><span /><p>Demo data</p><small>Adapters ready to connect</small></div><button onClick={logout}><LogOut size={16} /> Sign out</button></div>
    </aside>

    <main>
      <header className="topbar"><button className="icon-button menu" onClick={() => setMenu(true)} aria-label="Open menu"><Menu /></button><div><p>PRIVATE DASHBOARD</p><h1>Good morning, Gabby + Ryan.</h1></div><div className="top-actions"><button className="range">{range}<ChevronDown size={15} /></button><button className="export"><Download size={15} /> Export</button></div></header>

      <div className="content">
        <section id="overview" className="hero-section">
          <div className="hero-copy"><p className="eyebrow">Overview · {dataUpdatedAt}</p><h2>The book is finding<br/><em>its readers.</em></h2><p>One view of every sale, every signal, and what remains after the work is paid for.</p></div>
          <div className="hero-number"><span>Copies sold</span><strong>{number.format(metrics.copies)}</strong><p><ArrowUpRight size={16} /> {metrics.weekGrowth}% vs. prior period</p></div>
        </section>

        <section className="metric-grid">
          <MetricCard label="Gross book sales" value={money.format(metrics.gross)} detail="KDP + direct Stripe" />
          <MetricCard label="Amazon printing + fees" value={`−${money.format(metrics.printingFees)}`} detail="25.9% of gross" />
          <MetricCard label="Stripe fees" value={`−${money.format(metrics.stripeFees)}`} detail="Est. 3.1% + $0.30 per transaction" />
          <MetricCard label="Net proceeds" value={money.format(metrics.net)} detail="Before 50/50 split" accent />
          <MetricCard label="Gabby" value={money.format(metrics.split)} detail="50% share" />
          <MetricCard label="Ryan" value={money.format(metrics.split)} detail="50% share" />
        </section>
        <p className="tax-note">KDP revenue shown as reported. Sales tax is not automatically subtracted.</p>

        <section id="sales" className="panel sales-panel">
          <SectionTitle kicker="Sales velocity" title="Daily + cumulative book sales" aside={<div className="segmented"><button className={series === "daily" ? "selected" : ""} onClick={() => setSeries("daily")}>Daily</button><button className={series === "cumulative" ? "selected" : ""} onClick={() => setSeries("cumulative")}>Cumulative</button></div>} />
          <div className="chart-summary"><strong>{series === "daily" ? number.format(metrics.todayCopies) : number.format(metrics.copies)}</strong><span>{series === "daily" ? "copies on Aug 28" : "copies all time"}</span></div>
          <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={salesSeries}><defs><linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c72d22" stopOpacity={0.28}/><stop offset="100%" stopColor="#c72d22" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#ded8ca" strokeDasharray="2 4" vertical={false}/><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#776f64", fontSize: 11 }} interval={6}/><YAxis hide/><Tooltip contentStyle={{ background: "#161512", color: "#fff", border: 0, borderRadius: 2 }} formatter={(v) => number.format(Number(v))}/><Area type="monotone" dataKey={series} stroke="#b9251c" strokeWidth={2.5} fill="url(#redFill)" /></AreaChart></ResponsiveContainer></div>
        </section>

        <div className="two-col" id="attribution">
          <section className="panel funnel-panel"><SectionTitle kicker="Amazon Attribution" title="From attention to purchase" /><div className="funnel">{funnel.map((item, i) => <div className="funnel-row" key={item.label}><div className="funnel-icon">{i === 0 ? <Eye/> : i === 1 ? <ShoppingBag/> : <BookOpen/>}</div><div><p>{item.label}</p><strong>{number.format(item.value)}</strong></div><span>{item.rate}</span></div>)}</div><div className="conversion"><p>View → purchase conversion</p><strong>8.0%</strong><small><ArrowUpRight size={14}/> 1.2 pts this period</small></div></section>
          <section className="panel"><SectionTitle kicker="Amazon position" title="Category rankings" aside={<Trophy className="red"/>}/><div className="ranking-list">{rankings.map((r) => <div className="ranking" key={r.category}><strong>#{r.current}</strong><div><p>{r.category}</p><span>Best: #{r.best}</span></div><small className={r.movement > 0 ? "up" : "down"}>{r.movement > 0 ? <ArrowUpRight/> : <ArrowDownRight/>}{Math.abs(r.movement)}</small></div>)}</div><div className="milestone"><Trophy size={17}/><p><strong>#1 Bestseller</strong><br/>Creativity Self-Help · Aug 24</p></div></section>
        </div>

        <section className="audience-grid" id="audience">
          <article className="audience-card"><div className="audience-icon"><Star/></div><p>Amazon rating</p><strong>4.8 <small>/ 5</small></strong><span>1,284 ratings · 682 reviews</span></article>
          <article className="audience-card"><div className="audience-icon"><Instagram/></div><p>@readfromscratch</p><strong>84.2K</strong><span>followers · +12.8% this period</span></article>
          <article className="audience-card"><div className="audience-icon"><Users/></div><p>Website sessions</p><strong>47.6K</strong><span>68.2% new visitors</span></article>
          <article className="audience-card"><div className="audience-icon"><MousePointerClick/></div><p>Amazon clicks</p><strong>12.9K</strong><span>27.1% site click-through</span></article>
        </section>

        <div className="two-col lower" id="marketing">
          <section className="panel"><SectionTitle kicker="Marketing timeline" title="What moved the story" /><div className="timeline">{timeline.map((item) => <div className="timeline-item" key={item.date}><time>{item.date}</time><span className={item.kind}/><div><p>{item.title}</p><small>{item.detail}</small></div></div>)}</div></section>
          <section className="panel traffic-panel"><SectionTitle kicker="ReadFromScratch.com" title="Traffic + Amazon clicks" /><div className="traffic-numbers"><div><p>Sessions</p><strong>47,602</strong></div><div><p>Amazon clicks</p><strong>12,901</strong></div></div><div className="bar-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={salesSeries.slice(-14)}><Bar dataKey="daily" fill="#c72d22" radius={[2,2,0,0]}/><XAxis dataKey="date" hide/><YAxis hide/><Tooltip cursor={{fill:"#eee8da"}} contentStyle={{ background: "#161512", color: "#fff", border: 0 }}/></BarChart></ResponsiveContainer></div><a href="https://readfromscratch.com" target="_blank">Open site <ExternalLink size={14}/></a></section>
        </div>

        <section className="panel sources" id="data-health"><SectionTitle kicker="Data health" title="The reporting pipeline" aside={<button className="refresh"><RefreshCw size={14}/> Refresh sources</button>}/><div className="pipeline"><div>KDP exports<small>Drive raw archive</small></div><span>→</span><div>Master Sheet<small>Normalized + cumulative</small></div><span>→</span><div>Dashboard DB<small>Canonical reporting</small></div><span>→</span><div>From Scratch<small>Private dashboard</small></div></div><div className="source-table">{sourceStatus.map((s) => <div key={s.name}><p>{s.name}</p><span><i/>{s.state}</span><small>{s.cadence}</small></div>)}</div></section>
      </div>
      <footer><div className="brand-mark small">FS</div><p>FROM SCRATCH · PRIVATE & CONFIDENTIAL</p><span>Built for the story behind the numbers.</span></footer>
    </main>
  </div>;
}

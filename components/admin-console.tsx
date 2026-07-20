"use client";

import { Activity, BadgeDollarSign, CircleAlert, Coins, CreditCard, LayoutTemplate, RefreshCw, Search, Users } from "lucide-react";
import { useState } from "react";

type AdminView = "health" | "users" | "jobs" | "payments" | "templates";

const views: { id: AdminView; label: string; icon: typeof Activity }[] = [
  { id: "health", label: "Health", icon: Activity },
  { id: "users", label: "Users", icon: Users },
  { id: "jobs", label: "Generation jobs", icon: RefreshCw },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
];

export function AdminConsole() {
  const [view, setView] = useState<AdminView>("health");
  const [notice, setNotice] = useState("");

  return (
    <div className="admin-console">
      <aside className="admin-sidebar">
        <p>Operations</p>
        {views.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={view === id ? "active" : undefined} aria-pressed={view === id} onClick={() => setView(id)}><Icon aria-hidden="true" size={15} /> {label}</button>)}
      </aside>
      <main id="main-content" className="admin-main">
        <header><div><p>Frontend operations preview</p><h1>{views.find((item) => item.id === view)?.label}</h1></div><button className="button-secondary compact" type="button" onClick={() => setNotice("Refresh is reserved for the database and job API integration.")}><RefreshCw aria-hidden="true" size={14} /> Refresh</button></header>
        {notice ? <p className="admin-notice" role="status">{notice}</p> : null}
        {view === "health" ? <HealthView /> : null}
        {view === "users" ? <UsersView onAction={setNotice} /> : null}
        {view === "jobs" ? <JobsView onAction={setNotice} /> : null}
        {view === "payments" ? <PaymentsView onAction={setNotice} /> : null}
        {view === "templates" ? <TemplatesView onAction={setNotice} /> : null}
      </main>
    </div>
  );
}

function HealthView() {
  return <><section className="admin-metrics" aria-label="Service metrics"><article><Activity aria-hidden="true" size={18} /><span>Generation success</span><strong>95.4%</strong><small>Mock 7-day view</small></article><article><Coins aria-hidden="true" size={18} /><span>Gross margin</span><strong>72.1%</strong><small>Mock 7-day view</small></article><article><BadgeDollarSign aria-hidden="true" size={18} /><span>Revenue</span><strong>$1,248</strong><small>Mock 30-day view</small></article><article><CircleAlert aria-hidden="true" size={18} /><span>Failed jobs</span><strong>18</strong><small>Needs review</small></article></section><section className="admin-panel"><h2>Provider health</h2><div className="provider-list"><div><span>Script provider</span><strong>Reserved</strong></div><div><span>Image provider</span><strong>Reserved</strong></div><div><span>Voice provider</span><strong>Reserved</strong></div><div><span>Render worker</span><strong>Reserved</strong></div></div></section></>;
}

function AdminTable({ headers, rows, action, onAction }: { headers: string[]; rows: string[][]; action: string; onAction: (value: string) => void }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const visibleRows = rows.filter((row) => {
    const matchesSearch = row.some((cell) => cell.toLowerCase().includes(search.trim().toLowerCase()));
    const matchesStatus = status === "All statuses" || row.some((cell) => cell.toLowerCase() === status.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  return <section className="admin-panel"><div className="admin-table-tools"><label><Search aria-hidden="true" size={14} /><span className="sr-only">Search</span><input placeholder="Search records" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select aria-label="Filter records" value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Failed</option><option>Completed</option></select></div><div className="table-scroll"><table><thead><tr>{headers.map((header) => <th scope="col" key={header}>{header}</th>)}<th scope="col">Action</th></tr></thead><tbody>{visibleRows.length ? visibleRows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={cell}>{cell}</th> : <td key={`${cell}-${index}`}>{cell}</td>)}<td><button type="button" onClick={() => onAction(`${action} is reserved for the connected admin API.`)}>{action}</button></td></tr>) : <tr><td colSpan={headers.length + 1}>No matching records.</td></tr>}</tbody></table></div></section>;
}

function UsersView({ onAction }: { onAction: (value: string) => void }) { return <AdminTable headers={["User", "Plan", "Credits", "Source"]} rows={[["preview@studio.test", "Free", "42", "Organic"], ["creator@example.test", "Creator", "118", "TikTok"], ["student@example.test", "Free", "8", "Google"]]} action="Open" onAction={onAction} />; }
function JobsView({ onAction }: { onAction: (value: string) => void }) { return <AdminTable headers={["Job", "Type", "Status", "Cost"]} rows={[["job_0198", "Text video", "Failed", "$0.42"], ["job_0197", "PDF video", "Processing", "$0.18"], ["job_0196", "Voice", "Completed", "$0.03"]]} action="Inspect" onAction={onAction} />; }
function PaymentsView({ onAction }: { onAction: (value: string) => void }) { return <AdminTable headers={["Order", "Product", "Status", "Amount"]} rows={[["ord_104", "Creator", "Paid", "$19.00"], ["ord_103", "Credit pack", "Paid", "$9.99"], ["ord_102", "Pro", "Failed", "$39.00"]]} action="Review" onAction={onAction} />; }
function TemplatesView({ onAction }: { onAction: (value: string) => void }) { return <AdminTable headers={["Template", "Tier", "Status", "Uses"]} rows={[["Parkour", "Free", "Active", "1,284"], ["Study explainer", "Creator", "Active", "642"], ["Meme slides", "Free", "Review", "388"]]} action="Edit" onAction={onAction} />; }

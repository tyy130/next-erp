"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Clock, Play, Square, Plus, Trash2, Download, Upload,
  Moon, Sun, Globe, Link2, Webhook, Copy, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";

// ═══════════════════════════════════════════════════════════
// TIME TRACKING
// ═══════════════════════════════════════════════════════════

interface TimeEntry { id: number; employeeName: string; projectName: string; taskName: string; description: string; startTime: string; endTime: string | null; durationMinutes: number; billable: boolean; hourlyRate: number | string; status: string; }

export function TimeTracker({ orgId }: { orgId: string }) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [running, setRunning] = useState<TimeEntry | null>(null);
  const [form, setForm] = useState({ employeeName: "", projectName: "", taskName: "", description: "", hourlyRate: "50", billable: true });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const fetchEntries = useCallback(async () => {
    try { const r = await fetch(`/api/time-entries?orgId=${orgId}`); const d = await r.json(); setEntries(d.entries || []); } catch { /* */ }
  }, [orgId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const startTimer = () => {
    if (!form.employeeName || !form.taskName) { toast.error("Employee and task name required"); return; }
    const entry: TimeEntry = { id: Date.now(), employeeName: form.employeeName, projectName: form.projectName, taskName: form.taskName, description: form.description, startTime: new Date().toISOString(), endTime: null, durationMinutes: 0, billable: form.billable, hourlyRate: Number(form.hourlyRate) || 50, status: "running" };
    setRunning(entry);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    toast.success("Timer started");
  };

  const stopTimer = async () => {
    if (!running) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const duration = Math.round(elapsed / 60);
    const stopped = { ...running, endTime: new Date().toISOString(), durationMinutes: duration, status: "completed" };
    try {
      await fetch("/api/time-entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(stopped) });
      toast.success(`Logged ${duration} minutes`);
    } catch { toast.error("Failed to save"); }
    setRunning(null);
    setElapsed(0);
    fetchEntries();
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalMinutes = entries.reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const billableMinutes = entries.filter(e => e.billable).reduce((s, e) => s + (e.durationMinutes || 0), 0);

  return (
    <div className="space-y-4">
      {/* Timer */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5" />Time Tracker</CardTitle></CardHeader>
        <CardContent>
          {running ? (
            <div className="text-center space-y-3">
              <div className="text-4xl font-mono font-bold text-primary">{formatDuration(elapsed)}</div>
              <p className="text-sm text-muted-foreground">{running.employeeName} — {running.taskName} {running.projectName && `(${running.projectName})`}</p>
              <Button onClick={stopTimer} variant="destructive" size="sm"><Square className="h-4 w-4 mr-1" />Stop Timer</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Employee</Label><Input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} placeholder="John Doe" /></div>
              <div className="space-y-1"><Label className="text-xs">Project</Label><Input value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} placeholder="Website Redesign" /></div>
              <div className="space-y-1"><Label className="text-xs">Task</Label><Input value={form.taskName} onChange={e => setForm(f => ({ ...f, taskName: e.target.value }))} placeholder="Frontend dev" /></div>
              <div className="col-span-2 sm:col-span-3 space-y-1"><Label className="text-xs">Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What are you working on?" /></div>
              <div className="space-y-1"><Label className="text-xs">Hourly Rate ($)</Label><Input type="number" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} /></div>
              <div className="flex items-end"><div className="flex items-center gap-2"><Switch checked={form.billable} onCheckedChange={v => setForm(f => ({ ...f, billable: v }))} /><Label className="text-xs">Billable</Label></div></div>
              <div className="flex items-end"><Button onClick={startTimer} size="sm"><Play className="h-4 w-4 mr-1" />Start</Button></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold">{entries.length}</div><div className="text-xs text-muted-foreground">Entries</div></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold">{Math.round(totalMinutes / 60 * 10) / 10}h</div><div className="text-xs text-muted-foreground">Total</div></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold">{Math.round(billableMinutes / 60 * 10) / 10}h</div><div className="text-xs text-muted-foreground">Billable</div></CardContent></Card>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Recent Entries</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {entries.slice(0, 10).map(e => (
              <div key={e.id} className="flex items-center justify-between py-1.5 px-2 rounded border text-sm">
                <div><span className="font-medium">{e.taskName}</span> <span className="text-muted-foreground">— {e.employeeName}</span></div>
                <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{e.durationMinutes}m</Badge>{e.billable && <Badge className="text-[10px] bg-green-100 text-green-700">${e.hourlyRate}/h</Badge>}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DARK MODE TOGGLE
// ═══════════════════════════════════════════════════════════

export function DarkModeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    const t = stored || "system";
    setTheme(t);
    applyTheme(t);
  }, []);

  const applyTheme = (t: string) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (t === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(t);
    }
  };

  const handleTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
    // Also save to server
    fetch("/api/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ theme: t }) }).catch(() => {});
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <button onClick={() => handleTheme("light")} className={`p-1.5 rounded ${theme === "light" ? "bg-muted" : ""}`} title="Light"><Sun className="h-4 w-4" /></button>
      <button onClick={() => handleTheme("dark")} className={`p-1.5 rounded ${theme === "dark" ? "bg-muted" : ""}`} title="Dark"><Moon className="h-4 w-4" /></button>
      <button onClick={() => handleTheme("system")} className={`p-1.5 rounded ${theme === "system" ? "bg-muted" : ""}`} title="System"><Globe className="h-4 w-4" /></button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// WEBHOOK MANAGER
// ═══════════════════════════════════════════════════════════

interface Webhook { id: number; url: string; events: string; isActive: boolean; lastTriggeredAt: string | null; failureCount: number; }

export function WebhookManager({ orgId }: { orgId: string }) {
  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const fetchHooks = useCallback(async () => {
    try { const r = await fetch(`/api/webhooks?orgId=${orgId}`); const d = await r.json(); setHooks(d.hooks || []); } catch { /* */ }
  }, [orgId]);

  useEffect(() => { fetchHooks(); }, [fetchHooks]);

  const addWebhook = async () => {
    if (!newUrl) return;
    try {
      await fetch("/api/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: newUrl, secret: newSecret }) });
      setNewUrl(""); setNewSecret(""); fetchHooks();
      toast.success("Webhook added");
    } catch { toast.error("Failed"); }
  };

  const deleteHook = async (id: number) => {
    await fetch(`/api/webhooks?id=${id}`, { method: "DELETE" });
    fetchHooks();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://your-server.com/webhook" className="flex-1" />
        <div className="relative">
          <Input type={showSecret ? "text" : "password"} value={newSecret} onChange={e => setNewSecret(e.target.value)} placeholder="Secret (optional)" className="w-40 pr-8" />
          <button onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">{showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
        </div>
        <Button size="sm" onClick={addWebhook} disabled={!newUrl}><Plus className="h-3 w-3 mr-1" />Add</Button>
      </div>
      {hooks.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground"><Webhook className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No webhooks configured</p></div>
      ) : (
        <div className="space-y-2">
          {hooks.map(h => (
            <div key={h.id} className="flex items-center justify-between p-3 rounded border">
              <div className="min-w-0 flex-1"><p className="text-sm font-mono truncate">{h.url}</p><p className="text-xs text-muted-foreground">Events: {h.events} {h.failureCount > 0 && <span className="text-red-500">({h.failureCount} failures)</span>}</p></div>
              <div className="flex items-center gap-2 ml-2"><Badge variant={h.isActive ? "default" : "secondary"} className="text-[10px]">{h.isActive ? "Active" : "Off"}</Badge><Button size="sm" variant="ghost" onClick={() => deleteHook(h.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CSV IMPORT/EXPORT
// ═══════════════════════════════════════════════════════════

export function CsvImportExport({ orgId, resourceType }: { orgId: string; resourceType: "contacts" | "invoices" | "expenses" }) {
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportCsv = async () => {
    try {
      const r = await fetch(`/api/csv/export?orgId=${orgId}&type=${resourceType}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${resourceType}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch { toast.error("Export failed"); }
  };

  const importCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const r = await fetch("/api/csv/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: resourceType, data: text }) });
      const d = await r.json();
      toast.success(`Imported ${d.imported || 0} rows${d.errors?.length ? ` (${d.errors.length} errors)` : ""}`);
    } catch { toast.error("Import failed"); }
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-3 w-3 mr-1" />Export CSV</Button>
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCsv} />
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={importing}><Upload className="h-3 w-3 mr-1" />{importing ? "..." : "Import CSV"}</Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CURRENCY SELECTOR
// ═══════════════════════════════════════════════════════════

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
];

export function CurrencySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
    </select>
  );
}

export function formatCurrency(amount: number, currency: string = "USD") {
  const c = CURRENCIES.find(x => x.code === currency);
  return `${c?.symbol || "$"}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

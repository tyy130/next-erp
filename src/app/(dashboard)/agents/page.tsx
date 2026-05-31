"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Bot, Shield, Key, Activity, Clock, CheckCircle2, XCircle,
  AlertCircle, Eye, Copy, Plus, Loader2, Moon, Sun, Globe, Download, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { CsvImportExport } from "@/components/features";

interface AgentAction {
  id: number;
  agentId: string;
  agentName: string | null;
  actionType: string;
  status: string;
  resourceType: string | null;
  payload: any;
  result: any;
  errorMessage: string | null;
  createdAt: string;
  executedAt: string | null;
}

export default function AgentsPage() {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity");
  const [guardrails, setGuardrails] = useState<any>(null);
  const [savingGuardrails, setSavingGuardrails] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/agents/actions?limit=50");
      const data = await res.json();
      setActions(data.actions || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  const fetchGuardrails = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/agents/guardrails");
      if (res.ok) setGuardrails(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchActions(); fetchGuardrails(); }, [fetchActions, fetchGuardrails]);

  const handleApprove = async (actionId: number) => {
    try {
      await fetch(`/api/v1/agents/actions/${actionId}/approve`, { method: "POST" });
      toast.success("Action approved and executed");
      fetchActions();
    } catch { toast.error("Failed to approve"); }
  };

  const handleReject = async (actionId: number) => {
    try {
      await fetch(`/api/v1/agents/actions/${actionId}/reject`, { method: "POST" });
      toast.success("Action rejected");
      fetchActions();
    } catch { toast.error("Failed to reject"); }
  };

  const handleSaveGuardrails = async () => {
    setSavingGuardrails(true);
    try {
      await fetch("/api/v1/agents/guardrails", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guardrails),
      });
      toast.success("Guardrails saved");
    } catch { toast.error("Failed to save"); }
    setSavingGuardrails(false);
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res = await fetch("/api/v1/agents/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName, scopes: ["read", "write"] }),
      });
      const data = await res.json();
      if (data.key) {
        setCreatedKey(data.key);
        setNewKeyName("");
        toast.success("API key created — copy it now!");
      }
    } catch { toast.error("Failed to create key"); }
  };

  const statusIcon = (s: string) => {
    if (s === "executed") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (s === "pending") return <Clock className="h-4 w-4 text-yellow-500" />;
    if (s === "failed") return <XCircle className="h-4 w-4 text-red-500" />;
    if (s === "rejected") return <XCircle className="h-4 w-4 text-gray-400" />;
    return <AlertCircle className="h-4 w-4 text-blue-500" />;
  };

  const pendingCount = actions.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bot className="h-6 w-6" /> Agent Operations</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor AI agent actions, manage guardrails, and configure API access.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2 px-4 pt-3"><CardTitle className="text-xs font-medium text-muted-foreground">Pending Approval</CardTitle></CardHeader><CardContent className="px-4 pb-3"><div className="text-xl font-bold">{pendingCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2 px-4 pt-3"><CardTitle className="text-xs font-medium text-muted-foreground">Total Actions</CardTitle></CardHeader><CardContent className="px-4 pb-3"><div className="text-xl font-bold">{actions.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2 px-4 pt-3"><CardTitle className="text-xs font-medium text-muted-foreground">Executed</CardTitle></CardHeader><CardContent className="px-4 pb-3"><div className="text-xl font-bold">{actions.filter(a => a.status === "executed").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2 px-4 pt-3"><CardTitle className="text-xs font-medium text-muted-foreground">Guardrails</CardTitle></CardHeader><CardContent className="px-4 pb-3"><div className="text-xl font-bold">{guardrails?.enabled ? "On" : "Off"}</div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="activity"><Activity className="h-4 w-4 mr-1" />Activity</TabsTrigger>
          <TabsTrigger value="guardrails"><Shield className="h-4 w-4 mr-1" />Guardrails</TabsTrigger>
          <TabsTrigger value="api-keys"><Key className="h-4 w-4 mr-1" />API Keys</TabsTrigger>
          <TabsTrigger value="preferences"><Moon className="h-4 w-4 mr-1" />Preferences</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Agent Action Log</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : actions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No agent activity yet. Actions will appear here when agents operate.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actions.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-md border">
                      <div className="flex items-center gap-3">
                        {statusIcon(a.status)}
                        <div>
                          <p className="text-sm font-medium">{a.actionType.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.agentName || a.agentId} · {new Date(a.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-4 px-1">{a.status}</Badge>
                        {a.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApprove(a.id)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />Approve
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleReject(a.id)}>
                              <XCircle className="h-3 w-3 mr-1" />Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guardrails Tab */}
        <TabsContent value="guardrails" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Agent Guardrails</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Guardrails</Label>
                <Switch checked={guardrails?.enabled ?? true} onCheckedChange={v => setGuardrails((p: any) => ({ ...p, enabled: v }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Require Approval Above ($)</Label>
                  <Input type="number" value={guardrails?.requireApprovalAbove ?? 1000}
                    onChange={e => setGuardrails((p: any) => ({ ...p, requireApprovalAbove: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Daily Action Limit</Label>
                  <Input type="number" value={guardrails?.dailyActionLimit ?? 50}
                    onChange={e => setGuardrails((p: any) => ({ ...p, dailyActionLimit: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Allowed Hours Start</Label>
                  <Input type="time" value={guardrails?.allowedHoursStart ?? "08:00"}
                    onChange={e => setGuardrails((p: any) => ({ ...p, allowedHoursStart: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Allowed Hours End</Label>
                  <Input type="time" value={guardrails?.allowedHoursEnd ?? "20:00"}
                    onChange={e => setGuardrails((p: any) => ({ ...p, allowedHoursEnd: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label>Notify on Action</Label>
                <Switch checked={guardrails?.notifyOnAction ?? true} onCheckedChange={v => setGuardrails((p: any) => ({ ...p, notifyOnAction: v }))} />
              </div>
              <Button onClick={handleSaveGuardrails} disabled={savingGuardrails}>
                {savingGuardrails ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                Save Guardrails
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">API Keys</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {createdKey && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm font-medium text-green-800 mb-1">API Key Created — Copy it now!</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-white px-2 py-1 rounded border flex-1 break-all">{createdKey}</code>
                    <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(createdKey)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-green-600 mt-1">This key won't be shown again.</p>
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="space-y-1.5 flex-1">
                  <Label>Key Name</Label>
                  <Input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. Production Agent, Zapier Integration" />
                </div>
                <Button onClick={handleCreateApiKey} disabled={!newKeyName.trim()}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Create Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">User Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Theme</Label>
                <div className="flex items-center gap-2">
                  {(["light", "dark", "system"] as const).map(t => (
                    <button key={t} onClick={() => { useTheme().setTheme(t); toast.success(`Theme: ${t}`); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm ${useTheme().theme === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                      {t === "light" && <Sun className="h-3.5 w-3.5" />}
                      {t === "dark" && <Moon className="h-3.5 w-3.5" />}
                      {t === "system" && <Globe className="h-3.5 w-3.5" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Data</Label>
                <CsvImportExport orgId="current" resourceType="contacts" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

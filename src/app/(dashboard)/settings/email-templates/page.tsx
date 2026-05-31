"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Mail,
  Eye,
  Send,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface EmailTemplate {
  id: number;
  type: string;
  name: string;
  subject: string;
  bodyHtml: string;
  enabled: boolean;
  isDefault: boolean;
  description: string | null;
  availableVars: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EmailLog {
  id: number;
  templateType: string;
  toEmail: string;
  toName: string | null;
  subject: string;
  status: string;
  createdAt: string;
}

const TYPE_DESCRIPTIONS: Record<string, string> = {
  welcome: "Sent when a new employee is added",
  birthday: "Automated — sent on employee birthday",
  anniversary: "Automated — sent on hire date anniversary",
  leave_decision: "Sent when leave is approved or rejected",
  payslip: "Sent when payroll is marked as paid",
};

const SAMPLE_VARS: Record<string, Record<string, string>> = {
  welcome: {
    employee_name: "Jane Smith",
    role: "Software Engineer",
    start_date: "2025-01-15",
    company_name: "NextERP",
    login_url: "https://app.example.com",
  },
  birthday: {
    employee_name: "Jane Smith",
    company_name: "NextERP",
  },
  anniversary: {
    employee_name: "Jane Smith",
    milestone: "3 years",
    company_name: "NextERP",
  },
  leave_decision: {
    employee_name: "Jane Smith",
    status: "approved",
    status_title: "Approved ✅",
    status_class: "approved",
    status_message: "<p>Enjoy your time off!</p>",
    leave_type: "Annual Leave",
    start_date: "2025-07-01",
    end_date: "2025-07-05",
    days: "5",
    company_name: "NextERP",
  },
  payslip: {
    employee_name: "Jane Smith",
    period_start: "2025-06-01",
    period_end: "2025-06-30",
    gross_pay: "$8,333.33",
    deductions: "$833.33",
    net_pay: "$7,500.00",
    company_name: "NextERP",
  },
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [activeTab, setActiveTab] = useState("templates");

  const selectedTemplate = templates.find((t) => t.type === selectedType);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/email-templates");
      const data = await res.json();
      setTemplates(data.templates || []);
      if (!selectedType && data.templates?.length > 0) {
        setSelectedType(data.templates[0].type);
      }
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/email-logs?limit=50");
      const data = await res.json();
      setEmailLogs(data.logs || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchLogs();
  }, [fetchTemplates, fetchLogs]);

  const handleSave = async (template: EmailTemplate) => {
    setSaving(true);
    try {
      const res = await fetch("/api/email-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: template.id,
          subject: template.subject,
          bodyHtml: template.bodyHtml,
          enabled: template.enabled,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Template saved");
      await fetchTemplates();
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (template: EmailTemplate) => {
    const updated = { ...template, enabled: !template.enabled };
    setTemplates((prev) => prev.map((t) => (t.id === template.id ? updated : t)));
    try {
      await fetch("/api/email-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: template.id,
          subject: template.subject,
          bodyHtml: template.bodyHtml,
          enabled: !template.enabled,
        }),
      });
      toast.success(updated.enabled ? "Template enabled" : "Template disabled");
    } catch {
      toast.error("Failed to update");
      setTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
    }
  };

  const handleTestSend = async () => {
    if (!testEmail || !selectedTemplate) return;
    setSendingTest(true);
    try {
      const vars = SAMPLE_VARS[selectedTemplate.type] || {};
      const res = await fetch("/api/email-templates/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          subject: selectedTemplate.subject,
          bodyHtml: selectedTemplate.bodyHtml,
          variables: vars,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Send failed");
      }
      toast.success(`Test email sent to ${testEmail}`);
      setTestEmail("");
      await fetchLogs();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  const handleFieldChange = (field: "subject" | "bodyHtml", value: string) => {
    if (!selectedTemplate) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.type === selectedType ? { ...t, [field]: value } : t
      )
    );
  };

  const getPreviewHtml = () => {
    if (!selectedTemplate) return "";
    const vars = SAMPLE_VARS[selectedTemplate.type] || {};
    let html = selectedTemplate.bodyHtml;
    for (const [key, val] of Object.entries(vars)) {
      html = html.replace(new RegExp(`\\{${key}\\}`, "g"), val);
    }
    return html;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize automated emails. Use {"{variable}"} placeholders for dynamic content.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Email </span>History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Template list — horizontal scroll on mobile, sidebar on desktop */}
            <div className="md:col-span-3 space-y-2">
              <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
                {templates.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => setSelectedType(t.type)}
                    className={`flex-shrink-0 w-64 md:w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                      selectedType === t.type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {t.enabled ? (
                          <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-50 text-green-700 border-green-200">
                            ON
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] h-4 px-1 bg-gray-50 text-gray-500 border-gray-200">
                            OFF
                          </Badge>
                        )}
                        <ChevronRight className="h-3 w-3 text-muted-foreground hidden md:block" />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 pl-6 hidden md:block">
                      {TYPE_DESCRIPTIONS[t.type]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            {selectedTemplate && (
              <div className="md:col-span-9 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {TYPE_DESCRIPTIONS[selectedTemplate.type]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="enable-toggle" className="text-xs">
                          {selectedTemplate.enabled ? "Enabled" : "Disabled"}
                        </Label>
                        <Switch
                          id="enable-toggle"
                          checked={selectedTemplate.enabled}
                          onCheckedChange={() => handleToggle(selectedTemplate)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Available variables */}
                    {selectedTemplate.availableVars && (
                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-xs font-medium mb-1.5">Available Variables:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTemplate.availableVars.split(",").map((v) => (
                            <code key={v.trim()} className="text-[11px] bg-background px-1.5 py-0.5 rounded border">
                              {v.trim()}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subject */}
                    <div>
                      <Label className="text-xs font-medium">Subject Line</Label>
                      <Input
                        value={selectedTemplate.subject}
                        onChange={(e) => handleFieldChange("subject", e.target.value)}
                        className="mt-1 font-mono text-sm"
                        placeholder="Email subject..."
                      />
                    </div>

                    {/* HTML Body */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs font-medium">HTML Body</Label>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowPreview(!showPreview)}>
                          <Eye className="h-3 w-3 mr-1" />
                          {showPreview ? "Editor" : "Preview"}
                        </Button>
                      </div>
                      {showPreview ? (
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-muted px-3 py-1.5 text-xs text-muted-foreground border-b">
                            Preview with sample data
                          </div>
                          <div className="p-4 bg-white max-h-[400px] overflow-auto" dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
                        </div>
                      ) : (
                        <Textarea
                          value={selectedTemplate.bodyHtml}
                          onChange={(e) => handleFieldChange("bodyHtml", e.target.value)}
                          className="font-mono text-xs leading-relaxed min-h-[280px] md:min-h-[400px]"
                          placeholder="HTML email body..."
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="Send test to..." className="h-8 text-xs w-full sm:w-52" />
                        <Button size="sm" variant="outline" className="h-8 flex-shrink-0" onClick={handleTestSend} disabled={!testEmail || sendingTest}>
                          <Send className="h-3 w-3 mr-1" />
                          {sendingTest ? "..." : "Test"}
                        </Button>
                      </div>
                      <Button size="sm" className="h-8" onClick={() => handleSave(selectedTemplate)} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Email Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {emailLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No emails sent yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-2 px-3 rounded-md border">
                      <div className="flex items-center gap-3 min-w-0">
                        {log.status === "sent" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : log.status === "failed" ? (
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        ) : log.status === "queued" ? (
                          <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{log.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">To: {log.toEmail}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <Badge variant="outline" className={`text-[10px] h-4 px-1 ${log.status === "sent" ? "bg-green-50 text-green-700 border-green-200" : log.status === "failed" ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {log.status}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

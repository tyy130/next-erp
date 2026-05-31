"use client";

import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrgSettings {
  id?: number;
  name?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zip?: string | null;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  industry?: string | null;
  timezone?: string | null;
  currency?: string | null;
  fiscalYearStart?: string | null;
}

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Phoenix", "America/Anchorage", "Pacific/Honolulu",
  "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR", "BRL", "MXN"];

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Manufacturing", "Retail",
  "Education", "Real Estate", "Consulting", "Legal", "Marketing",
  "Construction", "Transportation", "Energy", "Agriculture",
  "Entertainment", "Government", "Non-profit", "Other",
];

const EMPTY_SETTINGS: OrgSettings = {
  name: "", slug: "", website: "", address: "", city: "", state: "",
  country: "", zip: "", phone: "", email: "", taxId: "", industry: "",
  timezone: "America/New_York", currency: "USD", fiscalYearStart: "01-01",
};

export default function OrganizationPage() {
  const [settings, setSettings] = useState<OrgSettings>(EMPTY_SETTINGS);
  const [original, setOriginal] = useState<OrgSettings>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/organization");
      const data = await res.json();
      if (data.settings) {
        const s = { ...EMPTY_SETTINGS, ...data.settings };
        setSettings(s);
        setOriginal(s);
      }
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (field: keyof OrgSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const getChangedFields = (): Partial<OrgSettings> => {
    const changed: Partial<OrgSettings> = {};
    for (const key of Object.keys(settings) as (keyof OrgSettings)[]) {
      if (settings[key] !== original[key] && key !== "id") {
        changed[key] = settings[key];
      }
    }
    return changed;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const changedFields = getChangedFields();
    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes to save");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedFields),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      const s = { ...EMPTY_SETTINGS, ...data.settings };
      setSettings(s);
      setOriginal(s);
      toast.success("Organization settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Organization</h1>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const dirtyCount = Object.keys(getChangedFields()).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your company profile, billing details, and system preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="general">
            <Building2 className="h-4 w-4 mr-1.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="billing">
            <DollarSign className="h-4 w-4 mr-1.5" />
            Billing & Tax
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" value={settings.name ?? ""} onChange={(e) => handleChange("name", e.target.value)} placeholder="Acme Inc." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input id="slug" value={settings.slug ?? ""} onChange={(e) => handleChange("slug", e.target.value)} placeholder="acme-inc" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="industry">
                    <Building2 className="h-3.5 w-3.5 inline mr-1" />
                    Industry
                  </Label>
                  <select
                    id="industry"
                    value={settings.industry ?? ""}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    <option value="">Select...</option>
                    {INDUSTRIES.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website">
                    <Globe className="h-3.5 w-3.5 inline mr-1" />
                    Website
                  </Label>
                  <Input id="website" value={settings.website ?? ""} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://example.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  Address
                </Label>
                <Textarea id="address" value={settings.address ?? ""} onChange={(e) => handleChange("address", e.target.value)} placeholder="123 Main St, Suite 100" rows={2} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={settings.city ?? ""} onChange={(e) => handleChange("city", e.target.value)} placeholder="New York" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={settings.state ?? ""} onChange={(e) => handleChange("state", e.target.value)} placeholder="NY" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="zip">ZIP</Label>
                  <Input id="zip" value={settings.zip ?? ""} onChange={(e) => handleChange("zip", e.target.value)} placeholder="10001" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={settings.country ?? ""} onChange={(e) => handleChange("country", e.target.value)} placeholder="US" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    <Phone className="h-3.5 w-3.5 inline mr-1" />
                    Phone
                  </Label>
                  <Input id="phone" value={settings.phone ?? ""} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">
                    <Mail className="h-3.5 w-3.5 inline mr-1" />
                    Company Email
                  </Label>
                  <Input id="email" type="email" value={settings.email ?? ""} onChange={(e) => handleChange("email", e.target.value)} placeholder="hello@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    Timezone
                  </Label>
                  <select
                    id="timezone"
                    value={settings.timezone ?? "America/New_York"}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    {TIMEZONES.map((tz) => (<option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">
                    <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                    Default Currency
                  </Label>
                  <select
                    id="currency"
                    value={settings.currency ?? "USD"}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    {CURRENCIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
                  <Input id="fiscalYearStart" value={settings.fiscalYearStart ?? ""} onChange={(e) => handleChange("fiscalYearStart", e.target.value)} placeholder="01-01" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing & Tax Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input id="taxId" value={settings.taxId ?? ""} onChange={(e) => handleChange("taxId", e.target.value)} placeholder="XX-XXXXXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency2">Invoice Currency</Label>
                  <select
                    id="currency2"
                    value={settings.currency ?? "USD"}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    {CURRENCIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 -mx-6 px-4 sm:px-6 py-3 border-t bg-background/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {dirtyCount > 0 ? `${dirtyCount} field${dirtyCount > 1 ? "s" : ""} modified` : "No changes"}
          </p>
          <Button type="submit" size="sm" disabled={saving || dirtyCount === 0}>
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

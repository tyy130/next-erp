import Link from "next/link";
import { ArrowRight, Mail, Building2, Key, Moon, Sun, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your organization, email templates, and system preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Key className="h-4 w-4" /> API Keys
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/settings/organization" className="group flex items-center justify-between rounded-lg border p-4 hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Organization</p>
              <p className="text-sm text-muted-foreground">Company info, currency, billing settings</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
        </Link>

        <Link href="/settings/email-templates" className="group flex items-center justify-between rounded-lg border p-4 hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email Templates</p>
              <p className="text-sm text-muted-foreground">Customize automail emails</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
        </Link>

        <Link href="/operations/webhooks" className="group flex items-center justify-between rounded-lg border p-4 hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Webhooks</p>
              <p className="text-sm text-muted-foreground">Event subscriptions & integrations</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
        </Link>

        <Link href="/operations/time" className="group flex items-center justify-between rounded-lg border p-4 hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <Sun className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Time Tracking</p>
              <p className="text-sm text-muted-foreground">Log hours & manage timesheets</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
        </Link>
      </div>
    </div>
  );
}

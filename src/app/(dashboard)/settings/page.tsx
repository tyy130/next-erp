import Link from "next/link";
import { ArrowRight, Mail, Building2, Users } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your organization, email templates, and system preferences.
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        <Link
          href="/settings/email-templates"
          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Email Templates</p>
              <p className="text-sm text-muted-foreground">
                Customize automated emails, preview, and send tests
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <div className="p-4 rounded-lg border opacity-60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Organization</p>
              <p className="text-sm text-muted-foreground">
                Manage your organization profile and members
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

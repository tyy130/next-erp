import { OrganizationProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Manage your organization, members, and billing.
      </p>
      <OrganizationProfile routing="hash" />
    </div>
  );
}

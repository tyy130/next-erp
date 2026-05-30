import { createContact, getCompanies } from "@/app/actions/crm";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function NewContactPage() {
  const { orgId } = await auth();
  const companies = orgId ? await getCompanies() : [];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <ButtonLink variant="ghost" size="sm" href="/crm/contacts">
          <ChevronLeft className="h-4 w-4" />
          Back
        </ButtonLink>
        <h1 className="text-2xl font-bold">Add Contact</h1>
      </div>

      <form action={createContact} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" name="jobTitle" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyId">Company</Label>
            <select
              id="companyId"
              name="companyId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">— None —</option>
              {companies.map((co) => (
                <option key={co.id} value={co.id}>
                  {co.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit">Save Contact</Button>
          <ButtonLink variant="outline" href="/crm/contacts">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}

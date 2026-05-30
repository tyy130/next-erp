import { getDepartments, createEmployee } from "@/app/actions/hrm";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function NewEmployeePage() {
  const { orgId } = await auth();
  const departments = orgId ? await getDepartments() : [];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <ButtonLink variant="ghost" size="sm" href="/hrm/employees">
          <ChevronLeft className="h-4 w-4" />
          Back
        </ButtonLink>
        <h1 className="text-2xl font-bold">Add Employee</h1>
      </div>

      <form action={createEmployee} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" name="firstName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" name="lastName" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department</Label>
            <select
              id="departmentId"
              name="departmentId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">— Select —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payType">Pay Type</Label>
            <select
              id="payType"
              name="payType"
              defaultValue="salary"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="salary">Salary</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salary">Salary / Rate</Label>
            <Input id="salary" name="salary" type="number" step="0.01" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hireDate">Hire Date</Label>
            <Input id="hireDate" name="hireDate" type="date" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue="active"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit">Save Employee</Button>
          <ButtonLink variant="outline" href="/hrm/employees">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </div>
  );
}

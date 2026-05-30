import { getCompanies, createCompany, deleteCompany } from "@/app/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/ui/delete-button";
import { auth } from "@clerk/nextjs/server";

export default async function CompaniesPage() {
  const { orgId } = await auth();
  const rows = orgId ? await getCompanies() : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Companies</h1>

      <form
        action={createCompany}
        className="grid grid-cols-2 gap-4 rounded-lg border p-4 md:grid-cols-4"
      >
        <div className="space-y-1">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" name="industry" />
        </div>
        <div className="col-span-full">
          <Button type="submit">Add Company</Button>
        </div>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No companies yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((co) => (
              <TableRow key={co.id}>
                <TableCell className="font-medium">{co.name}</TableCell>
                <TableCell>{co.email ?? "—"}</TableCell>
                <TableCell>{co.phone ?? "—"}</TableCell>
                <TableCell>{co.industry ?? "—"}</TableCell>
                <TableCell>
                  <DeleteButton action={deleteCompany.bind(null, co.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

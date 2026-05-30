import {
  getDepartments,
  createDepartment,
  deleteDepartment,
} from "@/app/actions/hrm";
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

export default async function DepartmentsPage() {
  const { orgId } = await auth();
  const rows = orgId ? await getDepartments() : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Departments</h1>

      <form
        action={createDepartment}
        className="flex items-end gap-3 rounded-lg border p-4"
      >
        <div className="space-y-1">
          <Label htmlFor="title">Department Name</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Engineering"
            required
            className="w-64"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            placeholder="Optional"
            className="w-64"
          />
        </div>
        <Button type="submit">Add</Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground"
                >
                  No departments yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.title}</TableCell>
                <TableCell>{dept.description ?? "—"}</TableCell>
                <TableCell>
                  <DeleteButton action={deleteDepartment.bind(null, dept.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

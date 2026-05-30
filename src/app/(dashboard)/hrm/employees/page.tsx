import { getEmployees, deleteEmployee } from "@/app/actions/hrm";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { DeleteButton } from "@/components/ui/delete-button";
import { auth } from "@clerk/nextjs/server";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  terminated: "bg-red-100 text-red-800",
};

export default async function EmployeesPage() {
  const { orgId } = await auth();
  const rows = orgId ? await getEmployees() : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">{rows.length} total</p>
        </div>
        <ButtonLink href="/hrm/employees/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </ButtonLink>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No employees yet. Add your first employee.
                </TableCell>
              </TableRow>
            )}
            {rows.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">
                  {emp.firstName} {emp.lastName}
                </TableCell>
                <TableCell>{emp.email ?? "—"}</TableCell>
                <TableCell>{emp.department?.title ?? "—"}</TableCell>
                <TableCell>{emp.designation?.title ?? "—"}</TableCell>
                <TableCell>{emp.hireDate ?? "—"}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[emp.status ?? "active"]}`}
                  >
                    {emp.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DeleteButton action={deleteEmployee.bind(null, emp.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

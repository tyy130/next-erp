import {
  getLeaveRequests,
  updateLeaveStatus,
  createLeaveRequest,
  getEmployees,
  getLeaveTypes,
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
import { auth } from "@clerk/nextjs/server";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function LeavesPage() {
  const { orgId } = await auth();
  const [requests, employees, leaveTypes] = orgId
    ? await Promise.all([getLeaveRequests(), getEmployees(), getLeaveTypes()])
    : [[], [], []];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leave Management</h1>

      <form
        action={createLeaveRequest}
        className="grid grid-cols-2 gap-4 rounded-lg border p-4 md:grid-cols-3"
      >
        <div className="space-y-1">
          <Label htmlFor="employeeId">Employee</Label>
          <select
            id="employeeId"
            name="employeeId"
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">— Select —</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="leaveTypeId">Leave Type</Label>
          <select
            id="leaveTypeId"
            name="leaveTypeId"
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">— Select —</option>
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="days">Days</Label>
          <Input id="days" name="days" type="number" min="1" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="reason">Reason</Label>
          <Input id="reason" name="reason" placeholder="Optional" />
        </div>
        <div className="col-span-full">
          <Button type="submit">Submit Request</Button>
        </div>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No leave requests yet.
                </TableCell>
              </TableRow>
            )}
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  {req.employee?.firstName} {req.employee?.lastName}
                </TableCell>
                <TableCell>{req.leaveType?.name ?? "—"}</TableCell>
                <TableCell>{req.startDate}</TableCell>
                <TableCell>{req.endDate}</TableCell>
                <TableCell>{req.days}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[req.status ?? "pending"]}`}
                  >
                    {req.status}
                  </span>
                </TableCell>
                <TableCell>
                  {req.status === "pending" && (
                    <div className="flex gap-1">
                      <form
                        action={updateLeaveStatus.bind(
                          null,
                          req.id,
                          "approved",
                        )}
                      >
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-300"
                        >
                          Approve
                        </Button>
                      </form>
                      <form
                        action={updateLeaveStatus.bind(
                          null,
                          req.id,
                          "rejected",
                        )}
                      >
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="text-red-700 border-red-300"
                        >
                          Reject
                        </Button>
                      </form>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

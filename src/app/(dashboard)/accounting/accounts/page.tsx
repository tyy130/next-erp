import { getChartOfAccounts, createAccount } from "@/app/actions/accounting";
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

const typeColor: Record<string, string> = {
  asset: "bg-blue-100 text-blue-700",
  liability: "bg-red-100 text-red-700",
  equity: "bg-purple-100 text-purple-700",
  income: "bg-green-100 text-green-700",
  expense: "bg-orange-100 text-orange-700",
};

const types = ["asset", "liability", "equity", "income", "expense"] as const;

export default async function AccountsPage() {
  const { orgId } = await auth();
  const rows = orgId ? await getChartOfAccounts() : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chart of Accounts</h1>

      <form
        action={createAccount}
        className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
      >
        <div className="space-y-1">
          <Label htmlFor="name">Account Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Cash and Bank"
            className="w-64"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="type">Type *</Label>
          <select
            id="type"
            name="type"
            required
            className="flex h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">— Select —</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Add Account</Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Slug</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground"
                >
                  No accounts yet. Add your chart of accounts.
                </TableCell>
              </TableRow>
            )}
            {rows.map((acct) => (
              <TableRow key={acct.id}>
                <TableCell className="font-medium">{acct.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColor[acct.type]}`}
                  >
                    {acct.type}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {acct.slug}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

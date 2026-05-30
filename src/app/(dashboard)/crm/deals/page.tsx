import {
  getDeals,
  createDeal,
  deleteDeal,
  updateDealStage,
} from "@/app/actions/crm";
import { getContacts, getCompanies } from "@/app/actions/crm";
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

const stageColor: Record<string, string> = {
  lead: "bg-gray-100 text-gray-700",
  qualified: "bg-blue-100 text-blue-700",
  proposal: "bg-purple-100 text-purple-700",
  negotiation: "bg-yellow-100 text-yellow-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const stages = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export default async function DealsPage() {
  const { orgId } = await auth();
  const [rows, contacts, companies] = orgId
    ? await Promise.all([getDeals(), getContacts(), getCompanies()])
    : [[], [], []];

  const total = rows.reduce((sum, d) => sum + Number(d.value ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deals</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} deals · ${total.toLocaleString()} total value
        </p>
      </div>

      <form
        action={createDeal}
        className="grid grid-cols-2 gap-4 rounded-lg border p-4 md:grid-cols-3"
      >
        <div className="space-y-1">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="value">Value ($)</Label>
          <Input id="value" name="value" type="number" step="0.01" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stage">Stage</Label>
          <select
            id="stage"
            name="stage"
            defaultValue="lead"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            {stages.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactId">Contact</Label>
          <select
            id="contactId"
            name="contactId"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">— None —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
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
        <div className="space-y-1">
          <Label htmlFor="closeDate">Expected Close</Label>
          <Input id="closeDate" name="closeDate" type="date" />
        </div>
        <div className="col-span-full">
          <Button type="submit">Add Deal</Button>
        </div>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead>Move Stage</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  No deals yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((deal) => {
              const currentIdx = stages.indexOf(deal.stage ?? "lead");
              const nextStage = stages[currentIdx + 1];
              return (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.title}</TableCell>
                  <TableCell>
                    {deal.value
                      ? `$${Number(deal.value).toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stageColor[deal.stage ?? "lead"]}`}
                    >
                      {deal.stage}
                    </span>
                  </TableCell>
                  <TableCell>
                    {deal.contact
                      ? `${deal.contact.firstName} ${deal.contact.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell>{deal.company?.name ?? "—"}</TableCell>
                  <TableCell>{deal.closeDate ?? "—"}</TableCell>
                  <TableCell>
                    {nextStage && (
                      <form
                        action={updateDealStage.bind(null, deal.id, nextStage)}
                      >
                        <Button type="submit" variant="outline" size="sm">
                          → {nextStage}
                        </Button>
                      </form>
                    )}
                  </TableCell>
                  <TableCell>
                    <DeleteButton action={deleteDeal.bind(null, deal.id)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

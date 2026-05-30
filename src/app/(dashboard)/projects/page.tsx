import {
  getProjects,
  createProject,
  updateProjectStatus,
  deleteProject,
} from "@/app/actions/projects";
import { ButtonLink } from "@/components/ui/button-link";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { FolderOpen, CheckCircle2, Clock, Plus } from "lucide-react";

const statusColor: Record<string, string> = {
  planning: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  on_hold: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500",
};

const statusLabel: Record<string, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function ProjectsPage() {
  const { orgId } = await auth();
  const rows = orgId ? await getProjects() : [];

  const active = rows.filter((p) => p.status === "active").length;
  const completed = rows.filter((p) => p.status === "completed").length;
  const totalTasks = rows.reduce((s, p) => s + p.tasks.length, 0);
  const doneTasks = rows.reduce(
    (s, p) => s + p.tasks.filter((t) => t.status === "done").length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} projects · {doneTasks}/{totalTasks} tasks done
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {doneTasks} of {totalTasks} complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New project form */}
      <div className="rounded-lg border p-4 bg-muted/30">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1">
          <Plus className="h-4 w-4" /> New Project
        </h2>
        <form
          action={createProject}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Project Name *
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="Website Redesign"
              className="block h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Client
            </label>
            <input
              name="clientName"
              type="text"
              placeholder="Acme Corp"
              className="block h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Budget
            </label>
            <input
              name="budget"
              type="number"
              step="0.01"
              placeholder="5000"
              className="block h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Start Date
            </label>
            <input
              name="startDate"
              type="date"
              className="block h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              End Date
            </label>
            <input
              name="endDate"
              type="date"
              className="block h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" size="sm" className="w-full">
              Create Project
            </Button>
          </div>
        </form>
      </div>

      {/* Projects grid */}
      {rows.length === 0 ? (
        <div className="rounded-md border py-16 text-center text-muted-foreground">
          No projects yet. Create your first project above.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((project) => {
            const done = project.tasks.filter(
              (t) => t.status === "done",
            ).length;
            const total = project.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div
                key={project.id}
                className="rounded-lg border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    {project.clientName && (
                      <p className="text-xs text-muted-foreground">
                        {project.clientName}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[project.status ?? "planning"]}`}
                  >
                    {statusLabel[project.status ?? "planning"]}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Tasks</span>
                    <span>
                      {done}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {project.budget && (
                  <p className="text-xs text-muted-foreground">
                    Budget: ${Number(project.budget).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-1 pt-1">
                  <ButtonLink
                    href={`/projects/${project.id}`}
                    className="flex-1 h-8 text-xs"
                  >
                    View Tasks
                  </ButtonLink>
                  {project.status === "planning" && (
                    <form
                      action={updateProjectStatus.bind(
                        null,
                        project.id,
                        "active",
                      )}
                    >
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                      >
                        Activate
                      </Button>
                    </form>
                  )}
                  {project.status === "active" && (
                    <form
                      action={updateProjectStatus.bind(
                        null,
                        project.id,
                        "completed",
                      )}
                    >
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                      >
                        Complete
                      </Button>
                    </form>
                  )}
                  <DeleteButton action={deleteProject.bind(null, project.id)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

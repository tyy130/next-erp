import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import {
  createTask,
  updateTaskStatus,
  deleteTask,
} from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { ButtonLink } from "@/components/ui/button-link";
import { ArrowLeft, Plus } from "lucide-react";

const taskStatusColor: Record<string, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const priorityColor: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-yellow-500",
  high: "text-red-500",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await auth();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, Number(id)),
    with: { tasks: true },
  });

  if (!project || project.orgId !== orgId) notFound();

  const todo = project.tasks.filter((t) => t.status === "todo");
  const inProgress = project.tasks.filter((t) => t.status === "in_progress");
  const done = project.tasks.filter((t) => t.status === "done");

  const columns = [
    { key: "todo", label: "To Do", tasks: todo },
    { key: "in_progress", label: "In Progress", tasks: inProgress },
    { key: "done", label: "Done", tasks: done },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ButtonLink href="/projects" variant="ghost" className="h-8 px-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Projects
        </ButtonLink>
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.clientName && (
            <p className="text-sm text-muted-foreground">
              {project.clientName}
            </p>
          )}
        </div>
      </div>

      {/* Add task form */}
      <div className="rounded-lg border p-4 bg-muted/30">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Task
        </h2>
        <form action={createTask} className="flex flex-wrap gap-3 items-end">
          <input type="hidden" name="projectId" value={project.id} />
          <div className="space-y-1 flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-muted-foreground">
              Task Name *
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder="Write unit tests"
              className="block h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Priority
            </label>
            <select
              name="priority"
              className="block h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium" selected>
                Medium
              </option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Assignee
            </label>
            <input
              name="assigneeName"
              type="text"
              placeholder="Name"
              className="block h-9 rounded-md border border-input bg-background px-3 text-sm w-32"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Due Date
            </label>
            <input
              name="dueDate"
              type="date"
              className="block h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <Button type="submit" size="sm">
            Add
          </Button>
        </form>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {col.tasks.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[100px]">
              {col.tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border bg-card p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-medium leading-tight">
                      {task.name}
                    </p>
                    <span
                      className={`text-xs font-bold ${priorityColor[task.priority ?? "medium"]}`}
                    >
                      ●
                    </span>
                  </div>
                  {task.assigneeName && (
                    <p className="text-xs text-muted-foreground">
                      {task.assigneeName}
                    </p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due {task.dueDate}
                    </p>
                  )}
                  <div className="flex gap-1">
                    {task.status !== "in_progress" && (
                      <form
                        action={updateTaskStatus.bind(
                          null,
                          task.id,
                          project.id,
                          "in_progress",
                        )}
                      >
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                        >
                          {task.status === "todo" ? "Start" : "Reopen"}
                        </Button>
                      </form>
                    )}
                    {task.status !== "done" && (
                      <form
                        action={updateTaskStatus.bind(
                          null,
                          task.id,
                          project.id,
                          "done",
                        )}
                      >
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                        >
                          Done
                        </Button>
                      </form>
                    )}
                    <DeleteButton
                      action={deleteTask.bind(null, task.id, project.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

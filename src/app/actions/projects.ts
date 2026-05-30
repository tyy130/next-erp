"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, projectTasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function requireOrg(orgId: string | null | undefined): string {
  if (!orgId) throw new Error("No organization selected");
  return orgId;
}

export async function getProjects() {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  return db.query.projects.findMany({
    where: eq(projects.orgId, oid),
    with: { tasks: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
  });
}

export async function createProject(fd: FormData) {
  const { userId, orgId } = await auth();
  const oid = requireOrg(orgId);

  await db.insert(projects).values({
    name: fd.get("name") as string,
    description: (fd.get("description") as string) || undefined,
    clientName: (fd.get("clientName") as string) || undefined,
    budget: (fd.get("budget") as string) || undefined,
    startDate: (fd.get("startDate") as string) || undefined,
    endDate: (fd.get("endDate") as string) || undefined,
    status: "planning",
    orgId: oid,
    createdBy: userId!,
  });

  revalidatePath("/projects");
}

export async function updateProjectStatus(
  id: number,
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled",
) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.orgId, oid)));
  revalidatePath("/projects");
}

export async function deleteProject(id: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db.delete(projectTasks).where(eq(projectTasks.projectId, id));
  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.orgId, oid)));
  revalidatePath("/projects");
}

export async function createTask(fd: FormData) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);

  await db.insert(projectTasks).values({
    projectId: Number(fd.get("projectId")),
    name: fd.get("name") as string,
    description: (fd.get("description") as string) || undefined,
    priority: (fd.get("priority") as "low" | "medium" | "high") || "medium",
    dueDate: (fd.get("dueDate") as string) || undefined,
    assigneeName: (fd.get("assigneeName") as string) || undefined,
    status: "todo",
    orgId: oid,
  });

  const projectId = fd.get("projectId") as string;
  revalidatePath(`/projects/${projectId}`);
}

export async function updateTaskStatus(
  id: number,
  projectId: number,
  status: "todo" | "in_progress" | "done",
) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .update(projectTasks)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(projectTasks.id, id), eq(projectTasks.orgId, oid)));
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function deleteTask(id: number, projectId: number) {
  const { orgId } = await auth();
  const oid = requireOrg(orgId);
  await db
    .delete(projectTasks)
    .where(and(eq(projectTasks.id, id), eq(projectTasks.orgId, oid)));
  revalidatePath(`/projects/${projectId}`);
}

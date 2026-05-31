import { seedDefaultDepartments } from "@/app/actions/hrm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await seedDefaultDepartments();
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

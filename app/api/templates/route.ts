import { NextResponse } from "next/server";
import { TEMPLATES } from "@/lib/templates";

export async function GET() {
  return NextResponse.json({
    items: TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      duration: t.duration,
      fields: t.fields,
      scriptHints: t.scriptHints,
    })),
  });
}

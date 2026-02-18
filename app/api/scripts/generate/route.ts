import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient, newId } from "@/lib/server/db";
import { generateScriptVariants } from "@/lib/server/script-generator";
import { getTemplate, type TemplateId } from "@/lib/templates";

export const maxDuration = 60;

type GenerateScriptsBody = {
  workspaceId?: string;
  projectId?: string;
  userId?: string;
  templateId: TemplateId;
  fields: Record<string, string>;
  productDescription?: string;
  variants?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateScriptsBody;

    if (!body.templateId) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "templateId is required", details: {} } }, { status: 400 });
    }

    const template = getTemplate(body.templateId);
    if (!template) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "Unknown template", details: {} } }, { status: 400 });
    }

    if (!body.fields || typeof body.fields !== "object") {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "fields must be an object", details: {} } }, { status: 400 });
    }

    const variants = generateScriptVariants({
      template,
      fields: body.fields,
      productDescription: body.productDescription,
      variants: body.variants ?? 3,
    });

    let scriptRunId = newId("scr");
    let persisted = false;

    const prisma = await getPrismaClient();
    if (prisma && body.projectId && body.userId) {
      const created = await prisma.scriptRun.create({
        data: {
          id: scriptRunId,
          workspaceId: body.workspaceId ?? "workspace_local",
          projectId: body.projectId,
          userId: body.userId,
          templateId: template.id,
          inputJson: {
            fields: body.fields,
            productDescription: body.productDescription ?? null,
            variantsRequested: body.variants ?? 3,
          },
          scriptText: variants.map((v, idx) => `Variant ${idx + 1}\n${v.script}`).join("\n\n---\n\n"),
          status: "DRAFT",
        },
        select: { id: true },
      });
      scriptRunId = created.id;
      persisted = true;
    }

    return NextResponse.json({
      scriptRunId,
      variants,
      persisted,
      storageMode: persisted ? "database" : "in-memory",
    });
  } catch (err) {
    console.error("scripts/generate error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: err instanceof Error ? err.message : "Internal server error", details: {} } },
      { status: 500 }
    );
  }
}

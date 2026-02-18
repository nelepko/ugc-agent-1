import { NextRequest, NextResponse } from "next/server";
import { createLocalVideoJob } from "@/lib/server/video-jobs-store";
import { getPrismaClient, newId } from "@/lib/server/db";
import { getTemplate, type TemplateId } from "@/lib/templates";

export const maxDuration = 120;

type GenerateVideoBody = {
  workspaceId?: string;
  projectId?: string;
  userId?: string;
  templateId: TemplateId;
  scriptRunId?: string;
  variantId?: string;
  provider?: string;
  voice?: string;
  aspectRatio?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateVideoBody;

    if (!body.templateId) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "templateId is required", details: {} } }, { status: 400 });
    }

    if (!body.projectId) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "projectId is required", details: {} } }, { status: 400 });
    }

    const template = getTemplate(body.templateId);
    if (!template) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "Unknown template", details: {} } }, { status: 400 });
    }

    const provider = body.provider ?? "stub-provider";
    const prisma = await getPrismaClient();

    if (prisma && body.userId) {
      const created = await prisma.videoJob.create({
        data: {
          id: newId("vid"),
          workspaceId: body.workspaceId ?? "workspace_local",
          projectId: body.projectId,
          userId: body.userId,
          templateId: template.id,
          scriptRunId: body.scriptRunId,
          provider,
          status: "QUEUED",
          aspectRatio: body.aspectRatio ?? "9:16",
        },
        select: { id: true, status: true },
      });

      return NextResponse.json(
        {
          videoJobId: created.id,
          status: created.status,
          persisted: true,
          storageMode: "database",
        },
        { status: 202 }
      );
    }

    const localJob = createLocalVideoJob({
      provider,
      projectId: body.projectId,
      templateId: template.id,
      scriptRunId: body.scriptRunId,
    });

    return NextResponse.json(
      {
        videoJobId: localJob.id,
        status: localJob.status,
        persisted: false,
        storageMode: "in-memory",
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("videos/generate error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: err instanceof Error ? err.message : "Internal server error", details: {} } },
      { status: 500 }
    );
  }
}

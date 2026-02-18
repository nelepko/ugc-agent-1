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
  script?: string;
};

const SUPPORTED_ASPECT_RATIOS = new Set(["16:9", "9:16"]);

async function generateWithVeo(params: {
  prompt: string;
  aspectRatio: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it in Vercel Project Settings -> Environment Variables.");
  }

  const dynamicImport = new Function("m", "return import(m)") as (m: string) => Promise<{
    GoogleGenAI: new (args: { apiKey: string }) => {
      models: {
        generateVideos: (args: {
          model: string;
          prompt: string;
          config?: { aspectRatio?: string };
        }) => Promise<{ name?: string; done?: boolean }>;
      };
    };
  }>;

  const { GoogleGenAI } = await dynamicImport("@google/genai");
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.VEO_MODEL ?? "veo-3.0-generate-preview";

  const operation = await ai.models.generateVideos({
    model,
    prompt: params.prompt,
    config: { aspectRatio: params.aspectRatio },
  });

  if (!operation?.name) {
    throw new Error("Veo did not return an operation name.");
  }

  return operation;
}

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

    const provider = body.provider ?? (process.env.GEMINI_API_KEY ? "veo" : "stub-provider");
    const aspectRatio = SUPPORTED_ASPECT_RATIOS.has(body.aspectRatio ?? "")
      ? (body.aspectRatio as "16:9" | "9:16")
      : "9:16";

    if (provider === "veo") {
      const prompt = body.script?.trim()
        ? body.script.trim()
        : `Create a ${aspectRatio} short UGC ad video for template "${template.name}" in 20-30 seconds.`;

      const operation = await generateWithVeo({ prompt, aspectRatio });
      const operationName = encodeURIComponent(operation.name ?? "");

      return NextResponse.json(
        {
          videoJobId: `veoop_${operationName}`,
          status: operation.done ? "COMPLETED" : "QUEUED",
          persisted: false,
          storageMode: "veo-operation",
          provider: "veo",
        },
        { status: 202 }
      );
    }

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
        select: { id: true },
      });

      return NextResponse.json(
        {
          videoJobId: created.id,
          status: "QUEUED",
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

import { NextRequest, NextResponse } from "next/server";
import { getLocalVideoJob } from "@/lib/server/video-jobs-store";
import { getPrismaClient } from "@/lib/server/db";

type Context = {
  params: {
    videoJobId: string;
  };
};

export async function GET(_request: NextRequest, context: Context) {
  try {
    const videoJobId = context.params.videoJobId;
    if (!videoJobId) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "videoJobId is required", details: {} } }, { status: 400 });
    }

    if (videoJobId.startsWith("veoop_")) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: { code: "CONFIG_ERROR", message: "GEMINI_API_KEY is missing", details: {} } },
          { status: 500 }
        );
      }

      const operationName = decodeURIComponent(videoJobId.replace("veoop_", ""));
      const dynamicImport = new Function("m", "return import(m)") as (m: string) => Promise<{
        GoogleGenAI: new (args: { apiKey: string }) => {
          operations: {
            getVideosOperation: (args: { operation: { name: string } }) => Promise<{
              done?: boolean;
              error?: { message?: string };
              response?: {
                generatedVideos?: Array<{
                  video?: { uri?: string };
                }>;
              };
            }>;
          };
        };
      }>;

      const { GoogleGenAI } = await dynamicImport("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const operation = await ai.operations.getVideosOperation({
        operation: { name: operationName },
      });

      const generatedVideoUri = operation.response?.generatedVideos?.[0]?.video?.uri ?? null;
      const status = operation.done ? "COMPLETED" : "PROCESSING";
      const errorMessage = operation.error?.message ?? null;

      return NextResponse.json({
        id: videoJobId,
        status: errorMessage ? "FAILED" : status,
        videoUrl: generatedVideoUri,
        thumbnailUrl: null,
        durationSec: status === "COMPLETED" ? 25 : null,
        errorMessage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        storageMode: "veo-operation",
      });
    }

    const prisma = await getPrismaClient();
    if (prisma) {
      const record = (await prisma.videoJob.findUnique({
        where: { id: videoJobId },
        select: {
          id: true,
          status: true,
          videoUrl: true,
          thumbnailUrl: true,
          durationSec: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
        },
      })) as
        | {
            id: string;
            status: string;
            videoUrl: string | null;
            thumbnailUrl: string | null;
            durationSec: number | null;
            errorMessage: string | null;
            createdAt: Date;
            updatedAt: Date;
          }
        | null;

      if (record) {
        return NextResponse.json({
          id: record.id,
          status: record.status,
          videoUrl: record.videoUrl,
          thumbnailUrl: record.thumbnailUrl,
          durationSec: record.durationSec,
          errorMessage: record.errorMessage,
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
          storageMode: "database",
        });
      }
    }

    const localJob = getLocalVideoJob(videoJobId);
    if (!localJob) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Video job not found", details: {} } }, { status: 404 });
    }

    return NextResponse.json({
      id: localJob.id,
      status: localJob.status,
      videoUrl: localJob.videoUrl,
      thumbnailUrl: localJob.thumbnailUrl,
      durationSec: localJob.durationSec,
      errorMessage: localJob.errorMessage,
      createdAt: localJob.createdAt,
      updatedAt: localJob.updatedAt,
      storageMode: "in-memory",
    });
  } catch (err) {
    console.error("videos/[videoJobId] error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: err instanceof Error ? err.message : "Internal server error", details: {} } },
      { status: 500 }
    );
  }
}

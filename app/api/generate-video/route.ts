import { NextRequest, NextResponse } from "next/server";
import { generateScriptVariants } from "@/lib/server/script-generator";
import { getTemplate, type TemplateId } from "@/lib/templates";

export const maxDuration = 120; // allow long-running generation (e.g. 60–120s)

interface GenerateVideoBody {
  templateId: TemplateId;
  templateName: string;
  fields: Record<string, string>;
  productDescription?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateVideoBody;
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: "templateId is required" },
        { status: 400 }
      );
    }

    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Unknown template" },
        { status: 400 }
      );
    }

    const [primaryVariant] = generateScriptVariants({
      template,
      fields: body.fields ?? {},
      productDescription: body.productDescription,
      variants: 1,
    });
    const script = primaryVariant?.script ?? "";

    // --- STUB: Replace with your video generation provider ---
    // Examples:
    // - Runway Gen-3 / Pika: text-to-video with script
    // - Synthesia / HeyGen: script + avatar → video
    // - Remotion: script + template → render MP4
    //
    // const videoUrl = await yourVideoProvider.generate({
    //   script,
    //   durationSeconds: 25,
    //   templateId,
    // });
    //
    // return NextResponse.json({ videoUrl, script });

    // Simulate processing time
    await new Promise((r) => setTimeout(r, 2000));

    return NextResponse.json({
      success: true,
      script,
      // No real URL in stub; frontend shows instructions to connect a provider.
      videoUrl: null,
      message:
        "Video generation is stubbed. Use /api/videos/generate and /api/videos/:id for async jobs.",
    });
  } catch (err) {
    console.error("generate-video error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

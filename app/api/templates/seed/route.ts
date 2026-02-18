import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/server/db";
import { TEMPLATES } from "@/lib/templates";

function parseDuration(value: string): { min: number; max: number } {
  const matches = value.match(/(\d+)/g);
  if (!matches || matches.length === 0) {
    return { min: 20, max: 30 };
  }
  const nums = matches.map(Number).filter((n) => Number.isFinite(n));
  if (nums.length === 1) {
    return { min: nums[0], max: nums[0] };
  }
  return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
}

export async function POST() {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return NextResponse.json(
      {
        seeded: 0,
        storageMode: "in-memory",
        message: "Prisma client unavailable. Install prisma deps and set DATABASE_URL.",
      },
      { status: 200 }
    );
  }

  let seeded = 0;

  for (const template of TEMPLATES) {
    const { min, max } = parseDuration(template.duration);

    const updated = await prisma.template.updateMany({
      where: { id: template.id },
      data: {
        name: template.name,
        description: template.description,
        durationSecMin: min,
        durationSecMax: max,
        fieldsJson: template.fields,
        scriptHintsJson: template.scriptHints,
        isActive: true,
      },
    });

    if (updated.count === 0) {
      await prisma.template.create({
        data: {
          id: template.id,
          name: template.name,
          description: template.description,
          durationSecMin: min,
          durationSecMax: max,
          fieldsJson: template.fields,
          scriptHintsJson: template.scriptHints,
          isActive: true,
        },
      });
    }

    seeded += 1;
  }

  return NextResponse.json({
    seeded,
    storageMode: "database",
  });
}

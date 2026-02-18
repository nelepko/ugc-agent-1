import { newId } from "@/lib/server/db";
import type { Template } from "@/lib/templates";

export type ScriptVariant = {
  id: string;
  script: string;
  estimatedDurationSec: number;
  shotList: Array<{
    beat: number;
    timeRange: string;
    voiceover: string;
    visual: string;
    overlay: string;
    intent: "hook" | "proof" | "demo" | "cta";
  }>;
};

function compactFields(fields: Record<string, string>): Array<[string, string]> {
  return Object.entries(fields)
    .map(([k, v]) => [k, v.trim()] as [string, string])
    .filter(([, v]) => v.length > 0);
}

function titleCase(input: string): string {
  return input
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function makeScript(template: Template, fields: Record<string, string>, productDescription?: string, variantIndex = 0): string {
  const lines: string[] = [];

  lines.push(`[${template.name}]`);

  if (productDescription?.trim()) {
    lines.push(`Context: ${productDescription.trim()}`);
  }

  const filled = compactFields(fields);

  if (filled.length === 0) {
    lines.push("Hook: Stop scrolling. This is the easiest way to improve your result today.");
    lines.push("Body: We tested it in real-life use and the difference was obvious from day one.");
    lines.push("CTA: Tap to try it now.");
  } else {
    filled.forEach(([key, value], idx) => {
      const label = titleCase(key);
      const suffix = variantIndex > 0 && idx === 0 ? ` (${variantIndex + 1})` : "";
      lines.push(`${label}${suffix}: ${value}`);
    });
  }

  lines.push(`Hint: ${template.scriptHints[variantIndex % template.scriptHints.length]}`);

  return lines.join("\n");
}

function makeShotList(template: Template, fields: Record<string, string>, variantIndex: number): ScriptVariant["shotList"] {
  const nonEmpty = compactFields(fields);
  const topValue = nonEmpty[0]?.[1] ?? `Try ${template.name}`;
  const midValue = nonEmpty[1]?.[1] ?? "Show product in hand and use it naturally.";
  const ctaValue = nonEmpty.find(([k]) => k.toLowerCase().includes("cta"))?.[1] ?? "Tap the link to get started.";

  return [
    {
      beat: 1,
      timeRange: "0-3s",
      voiceover: topValue,
      visual: "Creator selfie, fast movement, direct eye contact.",
      overlay: "Stop scrolling",
      intent: "hook",
    },
    {
      beat: 2,
      timeRange: "3-8s",
      voiceover: `Here is the real issue: ${midValue}`,
      visual: "Quick b-roll of the pain moment / messy baseline.",
      overlay: "The problem",
      intent: "proof",
    },
    {
      beat: 3,
      timeRange: "8-15s",
      voiceover: "This is exactly how I use it day to day.",
      visual: "Product close-up and hands-on demo.",
      overlay: "How it works",
      intent: "demo",
    },
    {
      beat: 4,
      timeRange: "15-24s",
      voiceover: template.scriptHints[variantIndex % template.scriptHints.length],
      visual: "Result moment with smile/reaction and clear outcome.",
      overlay: "Real result",
      intent: "proof",
    },
    {
      beat: 5,
      timeRange: "24-30s",
      voiceover: ctaValue,
      visual: "Point to CTA area or show checkout flow quickly.",
      overlay: "Get it now",
      intent: "cta",
    },
  ];
}

export function generateScriptVariants(params: {
  template: Template;
  fields: Record<string, string>;
  productDescription?: string;
  variants: number;
}): ScriptVariant[] {
  const total = Math.min(Math.max(params.variants, 1), 5);

  return Array.from({ length: total }).map((_, idx) => ({
    id: newId("var"),
    script: makeScript(params.template, params.fields, params.productDescription, idx),
    estimatedDurationSec: 23 + (idx % 4),
    shotList: makeShotList(params.template, params.fields, idx),
  }));
}

/**
 * UGC templates inspired by high-conversion formats in the industry.
 * Each template targets ~20–30 second videos.
 */

export type TemplateId =
  | "problem-solution"
  | "unboxing"
  | "before-after"
  | "testimonial"
  | "how-it-works"
  | "limited-offer"
  | "day-in-life"
  | "quick-tip"
  | "comparison"
  | "story"
  | "demo"
  | "faq"
  | "countdown"
  | "social-proof"
  | "behind-scenes"
  | "challenge"
  | "list"
  | "myth-bust"
  | "transformation"
  | "cta-urgent";

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  duration: string;
  /** Placeholders for user copy, e.g. ["headline", "product_name", "cta"] */
  fields: { key: string; label: string; placeholder: string; required?: boolean }[];
  /** Suggested structure / script hints */
  scriptHints: string[];
}

export const TEMPLATES: Template[] = [
  {
    id: "problem-solution",
    name: "Problem → Solution",
    description: "State the pain point, then introduce your product as the fix. Classic conversion format.",
    duration: "20–30s",
    fields: [
      { key: "headline", label: "Hook / Headline", placeholder: "e.g. Tired of X?", required: true },
      { key: "problem", label: "Problem (1–2 sentences)", placeholder: "Describe the frustration...", required: true },
      { key: "solution", label: "Your product as solution", placeholder: "That's why we made...", required: true },
      { key: "cta", label: "Call to action", placeholder: "e.g. Link in bio" },
    ],
    scriptHints: ["Open with the problem in 3–5 sec", "Solution in 10–15 sec", "CTA in last 5 sec"],
  },
  {
    id: "unboxing",
    name: "Unboxing / First impression",
    description: "Show opening the product and first reaction. Builds trust and curiosity.",
    duration: "25–30s",
    fields: [
      { key: "intro", label: "Intro line", placeholder: "e.g. Just got this in the mail..." },
      { key: "product_name", label: "Product name", placeholder: "Your product name", required: true },
      { key: "first_impression", label: "First impression / key benefit", placeholder: "What stands out?" },
      { key: "cta", label: "Call to action", placeholder: "Where to get it" },
    ],
    scriptHints: ["Show packaging briefly", "Reveal product clearly", "One clear benefit"],
  },
  {
    id: "before-after",
    name: "Before & After",
    description: "Visual or narrative contrast. Strong for beauty, fitness, productivity.",
    duration: "20–30s",
    fields: [
      { key: "before", label: "Before state", placeholder: "e.g. Before I used this..." },
      { key: "after", label: "After state", placeholder: "Now I..." },
      { key: "product_mention", label: "Product mention", placeholder: "Thanks to [product]..." },
      { key: "cta", label: "Call to action", placeholder: "Try it yourself" },
    ],
    scriptHints: ["Clear before/after split", "One main benefit", "Short CTA"],
  },
  {
    id: "testimonial",
    name: "Mini testimonial",
    description: "First-person result story. Great for social proof.",
    duration: "20–25s",
    fields: [
      { key: "hook", label: "Hook", placeholder: "e.g. I was skeptical but..." },
      { key: "result", label: "Result / outcome", placeholder: "After 2 weeks I..." },
      { key: "product", label: "Product name", placeholder: "Product name", required: true },
      { key: "cta", label: "Call to action", placeholder: "Link below" },
    ],
    scriptHints: ["Real result in numbers or feeling", "Mention product once clearly", "End with CTA"],
  },
  {
    id: "how-it-works",
    name: "How it works",
    description: "3 simple steps or one clear mechanism. Reduces confusion.",
    duration: "25–30s",
    fields: [
      { key: "headline", label: "Headline", placeholder: "e.g. How [Product] works" },
      { key: "step1", label: "Step 1", placeholder: "First..." },
      { key: "step2", label: "Step 2", placeholder: "Then..." },
      { key: "step3", label: "Step 3", placeholder: "Finally..." },
      { key: "cta", label: "Call to action", placeholder: "Get started" },
    ],
    scriptHints: ["One step per 5–8 sec", "Keep steps simple", "Clear CTA"],
  },
  {
    id: "limited-offer",
    name: "Limited offer / Urgency",
    description: "Discount, limited time, or scarcity. Use ethically.",
    duration: "20–25s",
    fields: [
      { key: "offer", label: "Offer (e.g. 20% off)", placeholder: "20% off this week" },
      { key: "product", label: "Product or collection", placeholder: "Our bestseller" },
      { key: "deadline", label: "Deadline", placeholder: "Until Sunday" },
      { key: "cta", label: "Call to action", placeholder: "Link in bio" },
    ],
    scriptHints: ["State offer in first 5 sec", "Repeat CTA", "Clear deadline"],
  },
  {
    id: "day-in-life",
    name: "Day in my life",
    description: "Product used in real context. Relatable and aspirational.",
    duration: "25–30s",
    fields: [
      { key: "context", label: "Context (e.g. morning routine)", placeholder: "My morning routine" },
      { key: "product_usage", label: "Where product fits", placeholder: "I always use..." },
      { key: "benefit", label: "Why it matters", placeholder: "It helps me..." },
      { key: "cta", label: "Call to action", placeholder: "Try it" },
    ],
    scriptHints: ["Show real use case", "One moment with product", "Soft CTA"],
  },
  {
    id: "quick-tip",
    name: "Quick tip",
    description: "One actionable tip + product tie-in. High save/share potential.",
    duration: "15–25s",
    fields: [
      { key: "tip", label: "The tip", placeholder: "e.g. Always do X when..." },
      { key: "product_tie", label: "Product tie-in", placeholder: "I use [product] for this" },
      { key: "cta", label: "Call to action", placeholder: "Link below" },
    ],
    scriptHints: ["Tip in first 5 sec", "Product as enabler", "Short CTA"],
  },
  {
    id: "comparison",
    name: "Vs / Comparison",
    description: "Your product vs alternative. Good for consideration stage.",
    duration: "25–30s",
    fields: [
      { key: "headline", label: "Headline", placeholder: "e.g. X vs Y" },
      { key: "other", label: "Alternative (brief)", placeholder: "With others you get..." },
      { key: "yours", label: "Your product (brief)", placeholder: "With us you get..." },
      { key: "cta", label: "Call to action", placeholder: "Try ours" },
    ],
    scriptHints: ["Fair, short comparison", "One key differentiator", "Clear CTA"],
  },
  {
    id: "story",
    name: "Short story",
    description: "Micro-story that leads to the product. Emotional connection.",
    duration: "25–30s",
    fields: [
      { key: "opening", label: "Opening line", placeholder: "e.g. Last year I..." },
      { key: "turn", label: "Turn / change", placeholder: "Then I discovered..." },
      { key: "product", label: "Product role", placeholder: "[Product] helped because..." },
      { key: "cta", label: "Call to action", placeholder: "Link in bio" },
    ],
    scriptHints: ["Story in 15 sec", "Product as resolution", "CTA at end"],
  },
  {
    id: "demo",
    name: "Quick demo",
    description: "Show the product in action. No fluff.",
    duration: "20–30s",
    fields: [
      { key: "headline", label: "What you're showing", placeholder: "e.g. How to use X" },
      { key: "action_1", label: "Action / step 1", placeholder: "First..." },
      { key: "action_2", label: "Action / step 2", placeholder: "Then..." },
      { key: "cta", label: "Call to action", placeholder: "Get it" },
    ],
    scriptHints: ["Show, don't tell", "2–3 clear actions", "Short CTA"],
  },
  {
    id: "faq",
    name: "FAQ / Objection buster",
    description: "Answer one common question or objection. Builds trust.",
    duration: "20–25s",
    fields: [
      { key: "question", label: "Question", placeholder: "e.g. Is it really worth it?" },
      { key: "answer", label: "Short answer", placeholder: "Yes, because..." },
      { key: "product", label: "Product mention", placeholder: "That's why we made..." },
      { key: "cta", label: "Call to action", placeholder: "Link below" },
    ],
    scriptHints: ["State question clearly", "One clear answer", "Product as proof"],
  },
  {
    id: "countdown",
    name: "Countdown / Launch",
    description: "Build hype for a launch or restock.",
    duration: "20–25s",
    fields: [
      { key: "announcement", label: "Announcement", placeholder: "e.g. We're launching..." },
      { key: "date", label: "Date / time", placeholder: "This Friday" },
      { key: "teaser", label: "Teaser benefit", placeholder: "You'll get..." },
      { key: "cta", label: "Call to action", placeholder: "Set reminder" },
    ],
    scriptHints: ["Clear date/time", "One benefit tease", "Reminder CTA"],
  },
  {
    id: "social-proof",
    name: "Social proof",
    description: "Reviews, numbers, or \"everyone's using it\" angle.",
    duration: "20–25s",
    fields: [
      { key: "stat_or_quote", label: "Stat or quote", placeholder: "e.g. 50k+ happy customers" },
      { key: "product", label: "Product name", placeholder: "Product name", required: true },
      { key: "proof_detail", label: "One detail", placeholder: "Why they love it" },
      { key: "cta", label: "Call to action", placeholder: "Join them" },
    ],
    scriptHints: ["Lead with number or quote", "One proof point", "CTA"],
  },
  {
    id: "behind-scenes",
    name: "Behind the scenes",
    description: "How it's made or who's behind the brand. Trust and authenticity.",
    duration: "25–30s",
    fields: [
      { key: "intro", label: "Intro", placeholder: "e.g. Quick BTS of..." },
      { key: "what_you_show", label: "What you're showing", placeholder: "Our process..." },
      { key: "product_mention", label: "Product mention", placeholder: "This is why [product]..." },
      { key: "cta", label: "Call to action", placeholder: "Link in bio" },
    ],
    scriptHints: ["Authentic, not polished", "One product link", "Soft CTA"],
  },
  {
    id: "challenge",
    name: "Challenge / Trend",
    description: "Tie product to a challenge or trend. Good for virality.",
    duration: "20–30s",
    fields: [
      { key: "challenge", label: "Challenge name", placeholder: "e.g. 7-day X challenge" },
      { key: "product_role", label: "Product role", placeholder: "I'm using [product] to..." },
      { key: "invite", label: "Invite", placeholder: "Try it with me" },
      { key: "cta", label: "Call to action", placeholder: "Link below" },
    ],
    scriptHints: ["Name challenge clearly", "Product as tool", "Invite to join"],
  },
  {
    id: "list",
    name: "List / Roundup",
    description: "3–5 things (tips, favorites) with your product included.",
    duration: "25–30s",
    fields: [
      { key: "headline", label: "List headline", placeholder: "e.g. 3 things I swear by" },
      { key: "item_1", label: "Item 1", placeholder: "First..." },
      { key: "item_2", label: "Item 2 (your product)", placeholder: "Second - [product]..." },
      { key: "item_3", label: "Item 3", placeholder: "Third..." },
      { key: "cta", label: "Call to action", placeholder: "Link for #2" },
    ],
    scriptHints: ["Number the list", "Product as one item", "CTA for product"],
  },
  {
    id: "myth-bust",
    name: "Myth bust",
    description: "Address a misconception. Positions you as expert.",
    duration: "20–25s",
    fields: [
      { key: "myth", label: "Myth", placeholder: "e.g. People say X" },
      { key: "truth", label: "Truth", placeholder: "Actually..." },
      { key: "product", label: "Product tie-in", placeholder: "[Product] does this by..." },
      { key: "cta", label: "Call to action", placeholder: "Link below" },
    ],
    scriptHints: ["State myth in 5 sec", "One clear truth", "Product as proof"],
  },
  {
    id: "transformation",
    name: "Transformation",
    description: "Journey from A to B. Strong for courses, coaching, products.",
    duration: "25–30s",
    fields: [
      { key: "before", label: "Before", placeholder: "I used to..." },
      { key: "after", label: "After", placeholder: "Now I..." },
      { key: "how", label: "How (product)", placeholder: "[Product] helped by..." },
      { key: "cta", label: "Call to action", placeholder: "Start your journey" },
    ],
    scriptHints: ["Clear before/after", "Product as catalyst", "Invite CTA"],
  },
  {
    id: "cta-urgent",
    name: "Direct CTA + Urgency",
    description: "Straight ask with reason to act now. Best for sales/launches.",
    duration: "15–25s",
    fields: [
      { key: "offer", label: "Offer", placeholder: "e.g. 20% off today" },
      { key: "product", label: "Product", placeholder: "Our [product]" },
      { key: "reason", label: "Why now", placeholder: "Because..." },
      { key: "cta", label: "Call to action", placeholder: "Tap the link" },
    ],
    scriptHints: ["Offer in first 5 sec", "One reason to act now", "Clear CTA"],
  },
];

export function getTemplate(id: TemplateId): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

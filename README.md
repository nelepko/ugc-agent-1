# UGC Content Builder

A web service for **marketing leaders and managers** to create **20–30 second UGC (user-generated content) videos** for their brand. Choose from conversion-focused templates, add your copy and product description, and generate short videos in one flow.

## Features

- **20 templates** inspired by high-conversion UGC formats (problem–solution, unboxing, before/after, testimonial, how-it-works, limited offer, day-in-life, quick tip, comparison, story, demo, FAQ, countdown, social proof, behind-the-scenes, challenge, list, myth-bust, transformation, direct CTA).
- **Product description** field so you can describe your product; the system uses it to build or suggest script copy.
- **Template-specific fields** (headlines, steps, CTAs, etc.) so you can paste or edit text per template.
- **Generate video** flow that builds a script and calls an API—ready to plug in your preferred video provider (Runway, Synthesia, HeyGen, Remotion, etc.).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pick a template on the home page, then on the create page add your product description and copy, and click **Generate 20–30s video**.

## API routes (implemented)

- `POST /api/scripts/generate` – returns 1–5 script variants + shot lists.
- `POST /api/videos/generate` – creates async video job (stub provider).
- `GET /api/videos/:videoJobId` – polls video job status.
- `GET /api/templates` – returns active template definitions.
- `POST /api/templates/seed` – seeds templates into Prisma `Template` table.
- `POST /api/generate-video` – legacy compatibility endpoint used by current UI.

## Database setup (Prisma + Postgres)

1. Copy env file: `cp .env.example .env`
2. Set `DATABASE_URL` in `.env`
3. Generate Prisma client: `npm run db:generate`
4. Run migrations: `npm run db:migrate`
5. Seed templates: `curl -X POST http://localhost:3000/api/templates/seed`

Without `DATABASE_URL` or Prisma client installed, API routes fall back to in-memory mode so you can still prototype.

## Project structure

- `app/page.tsx` – Home: template picker.
- `app/create/page.tsx` – Create: form (product description + template fields) and generate flow.
- `app/api/generate-video/route.ts` – API: builds script from template + fields; **stub** for real video generation.
- `lib/templates.ts` – All 20 UGC templates (ids, names, descriptions, fields, script hints).

## Connecting real video generation

The **Generate video** button currently calls `POST /api/generate-video` with:

- `templateId`, `templateName`
- `fields` – key/value copy for that template
- `productDescription` – optional

The API builds a **script** (see `buildScript()` in the route). To get actual 20–30s videos:

1. **Text-to-video (e.g. Runway, Pika)**  
   Send the script (and optional style/template hints) to the provider’s API and get back a video URL.

2. **AI avatar / talking head (e.g. Synthesia, HeyGen)**  
   Use the script as the narrator script and map `templateId` to a video template or avatar scene.

3. **Custom (e.g. Remotion)**  
   Use the script and template config to drive a Remotion composition (e.g. text overlays on stock footage) and render to MP4.

Implement this in `app/api/generate-video/route.ts`: replace the stub with a call to your provider and return `videoUrl` in the JSON response. The frontend already shows the video and a download link when `videoUrl` is present.

## Tech stack

- **Next.js 14** (App Router), **React 18**, **TypeScript**
- No database required for the core flow; add one if you want to save projects or user accounts.

## Implementation assets

- Data model (Prisma): `prisma/schema.prisma`
- API contracts (MVP): `docs/api-contract.md`
- 10 conversion-focused template structures: `docs/top-10-template-structures.md`

## License

MIT.

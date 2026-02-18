# API Contract (MVP)

Base path: `/api`

## Auth

### `POST /auth/session`
Create session after OAuth or magic-link callback.

Request:
```json
{
  "provider": "google",
  "oauthCode": "..."
}
```

Response `200`:
```json
{
  "user": {
    "id": "usr_123",
    "email": "lead@brand.com",
    "fullName": "Alex Rivera"
  },
  "workspace": {
    "id": "wrk_123",
    "name": "Acme Marketing"
  }
}
```

## Brands + products

### `POST /brands`
Request:
```json
{
  "workspaceId": "wrk_123",
  "name": "Acme",
  "websiteUrl": "https://acme.com",
  "description": "Clean hydration brand",
  "voiceTone": "confident, friendly",
  "targetAudience": "women 25-40"
}
```

Response `201`:
```json
{
  "id": "brd_123"
}
```

### `POST /products`
Request:
```json
{
  "brandId": "brd_123",
  "name": "Electrolyte Drops",
  "description": "Sugar-free drops for daily hydration",
  "offerText": "15% off first order"
}
```

Response `201`:
```json
{
  "id": "prd_123"
}
```

## Templates

### `GET /templates`
Returns active templates and field definitions.

Response `200`:
```json
{
  "items": [
    {
      "id": "problem-solution",
      "name": "Problem -> Solution",
      "description": "State pain, present fix",
      "durationSecMin": 20,
      "durationSecMax": 30,
      "fields": [
        { "key": "hook", "label": "Hook", "required": true }
      ]
    }
  ]
}
```

## Projects

### `POST /projects`
Create a working project before generation.

Request:
```json
{
  "workspaceId": "wrk_123",
  "brandId": "brd_123",
  "productId": "prd_123",
  "templateId": "problem-solution",
  "title": "Hydration pain-point campaign",
  "objective": "Increase paid conversion",
  "input": {
    "audience": "busy professionals",
    "primaryPain": "afternoon crash",
    "cta": "Shop now"
  }
}
```

Response `201`:
```json
{
  "id": "prj_123",
  "status": "DRAFT"
}
```

### `GET /projects/:projectId`
Response `200`:
```json
{
  "id": "prj_123",
  "title": "Hydration pain-point campaign",
  "templateId": "problem-solution",
  "input": {
    "audience": "busy professionals"
  },
  "latestScript": {
    "id": "scr_123",
    "status": "DRAFT"
  },
  "latestVideo": {
    "id": "vid_123",
    "status": "PROCESSING"
  }
}
```

## Script generation

### `POST /scripts/generate`
Generate 3-5 script variants for selected template.

Request:
```json
{
  "workspaceId": "wrk_123",
  "projectId": "prj_123",
  "templateId": "problem-solution",
  "fields": {
    "hook": "Still crashing by 3pm?",
    "problem": "Coffee helps for 30 minutes",
    "solution": "Mineral drops in your water"
  },
  "productDescription": "Hydration supplement for focus",
  "variants": 3
}
```

Response `200`:
```json
{
  "scriptRunId": "scr_123",
  "variants": [
    {
      "id": "scr_123_v1",
      "script": "Hook...",
      "estimatedDurationSec": 24,
      "shotList": [
        {
          "beat": 1,
          "voiceover": "Still crashing by 3pm?",
          "visual": "Creator selfie with tired expression",
          "overlay": "3PM energy crash"
        }
      ]
    }
  ]
}
```

## Video generation

### `POST /videos/generate`
Create asynchronous render job.

Request:
```json
{
  "workspaceId": "wrk_123",
  "projectId": "prj_123",
  "templateId": "problem-solution",
  "scriptRunId": "scr_123",
  "variantId": "scr_123_v1",
  "provider": "creatomate",
  "voice": "female_en_us_1",
  "aspectRatio": "9:16"
}
```

Response `202`:
```json
{
  "videoJobId": "vid_123",
  "status": "QUEUED"
}
```

### `GET /videos/:videoJobId`
Response `200`:
```json
{
  "id": "vid_123",
  "status": "COMPLETED",
  "videoUrl": "https://cdn.example.com/vid_123.mp4",
  "thumbnailUrl": "https://cdn.example.com/vid_123.jpg",
  "durationSec": 26
}
```

## Exports

### `POST /exports/captions`
Response `200`:
```json
{
  "format": "srt",
  "url": "https://cdn.example.com/captions/vid_123.srt"
}
```

## Billing + quotas

### `GET /billing/usage?workspaceId=wrk_123`
Response `200`:
```json
{
  "tier": "STARTER",
  "videoLimit": 20,
  "videosUsed": 7,
  "periodEndsAt": "2026-03-01T00:00:00.000Z"
}
```

## Error model
All endpoints use:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "templateId is required",
    "details": {}
  }
}
```

Suggested status codes: `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`.

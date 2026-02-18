"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TEMPLATES, getTemplate, type TemplateId } from "@/lib/templates";
import "./create.css";

type ScriptVariant = {
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

function CreateContent() {
  const searchParams = useSearchParams();
  const templateId = (searchParams.get("template") || TEMPLATES[0].id) as TemplateId;
  const template = useMemo(() => getTemplate(templateId), [templateId]) ?? TEMPLATES[0];

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.fields.map((f) => [f.key, ""]))
  );
  const [productDescription, setProductDescription] = useState("");
  const [projectId] = useState(() => `prj_local_${Date.now().toString(36)}`);
  const [status, setStatus] = useState<
    "idle" | "scripts-generating" | "scripts-ready" | "video-generating" | "video-ready" | "error"
  >("idle");
  const [scriptRunId, setScriptRunId] = useState<string | null>(null);
  const [variants, setVariants] = useState<ScriptVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(Object.fromEntries(template.fields.map((f) => [f.key, ""])));
    setProductDescription("");
    setStatus("idle");
    setScriptRunId(null);
    setVariants([]);
    setSelectedVariantId(null);
    setVideoJobId(null);
    setVideoStatus(null);
    setErrorMessage(null);
  }, [template.id, template.fields]);

  useEffect(() => {
    if (!videoJobId || status !== "video-generating") {
      return;
    }

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/videos/${videoJobId}`);
        const data = await res.json();
        if (!res.ok) return;

        const nextStatus = String(data.status ?? "PROCESSING");
        setVideoStatus(nextStatus);

        if (nextStatus === "COMPLETED") {
          setStatus("video-ready");
        } else if (nextStatus === "FAILED") {
          setStatus("error");
          setErrorMessage(data.errorMessage || "Video generation failed");
        }
      } catch {
        // Polling best-effort; keep trying.
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [videoJobId, status]);

  const updateField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateScripts = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("scripts-generating");
    setErrorMessage(null);
    setScriptRunId(null);
    setVariants([]);
    setSelectedVariantId(null);
    setVideoJobId(null);
    setVideoStatus(null);

    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          projectId,
          userId: "usr_local",
          workspaceId: "workspace_local",
          fields: values,
          productDescription: productDescription || undefined,
          variants: 3,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data?.error?.message || "Script generation failed");
        setStatus("error");
        return;
      }

      const nextVariants = (data.variants ?? []) as ScriptVariant[];
      if (!nextVariants.length) {
        setErrorMessage("No script variants generated");
        setStatus("error");
        return;
      }

      setScriptRunId(data.scriptRunId ?? null);
      setVariants(nextVariants);
      setSelectedVariantId(nextVariants[0].id);
      setStatus("scripts-ready");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Request failed");
      setStatus("error");
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedVariantId) return;

    setStatus("video-generating");
    setErrorMessage(null);
    setVideoStatus("QUEUED");

    try {
      const res = await fetch("/api/videos/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          projectId,
          userId: "usr_local",
          workspaceId: "workspace_local",
          scriptRunId: scriptRunId ?? undefined,
          variantId: selectedVariantId,
          provider: "stub-provider",
          aspectRatio: "9:16",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data?.error?.message || "Video generation failed");
        setStatus("error");
        return;
      }

      setVideoJobId(data.videoJobId ?? null);
      setVideoStatus(data.status ?? "QUEUED");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Request failed");
      setStatus("error");
    }
  };

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? variants[0] ?? null,
    [variants, selectedVariantId]
  );

  return (
    <div className="page-create">
      <header className="header">
        <div className="container">
          <Link href="/" className="back-link">
            ← All templates
          </Link>
          <h1 className="title">Create your UGC video</h1>
          <p className="subtitle">
            Template: <strong>{template.name}</strong> · {template.duration}
          </p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="create-layout">
            <section className="form-section card">
              <h2 className="form-section-title">Your copy & product</h2>
              <form onSubmit={handleGenerateScripts}>
                <div className="form-group">
                  <label className="label">Product / brand description (optional)</label>
                  <textarea
                    className="textarea"
                    placeholder="Describe your product in a few sentences. We'll use this to suggest or refine your script."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {template.fields.map((field) => (
                  <div key={field.key} className="form-group">
                    <label className="label">
                      {field.label}
                      {field.required && " *"}
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder={field.placeholder}
                      value={values[field.key] ?? ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      required={field.required}
                    />
                  </div>
                ))}

                <div className="script-hints">
                  <span className="label">Script hints</span>
                  <ul>
                    {template.scriptHints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={status === "scripts-generating" || status === "video-generating"}
                  >
                    {status === "scripts-generating" ? "Generating scripts…" : "Generate script variants"}
                  </button>
                </div>
              </form>
            </section>

            <aside className="result-section">
              {status === "scripts-generating" && (
                <div className="card result-card result-generating">
                  <div className="spinner" />
                  <p>Generating script variants and shot list...</p>
                </div>
              )}
              {status === "error" && (
                <div className="card result-card result-error">
                  <p><strong>Error</strong></p>
                  <p>{errorMessage}</p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setStatus("idle")}
                  >
                    Try again
                  </button>
                </div>
              )}
              {(status === "scripts-ready" || status === "video-generating" || status === "video-ready") && (
                <div className="card result-card result-done">
                  <p><strong>Scripts ready</strong></p>
                  <div className="variant-list">
                    {variants.map((variant, index) => (
                      <label key={variant.id} className="variant-item">
                        <input
                          type="radio"
                          name="variant"
                          checked={(selectedVariant?.id ?? null) === variant.id}
                          onChange={() => setSelectedVariantId(variant.id)}
                          disabled={status === "video-generating"}
                        />
                        <span>Variant {index + 1} ({variant.estimatedDurationSec}s)</span>
                      </label>
                    ))}
                  </div>

                  {selectedVariant && (
                    <>
                      <pre className="result-script">{selectedVariant.script}</pre>
                      <div className="shot-list">
                        <p><strong>Shot list</strong></p>
                        {selectedVariant.shotList.map((shot) => (
                          <div key={shot.beat} className="shot-item">
                            <span className="shot-meta">
                              Beat {shot.beat} · {shot.timeRange} · {shot.intent}
                            </span>
                            <span>{shot.voiceover}</span>
                            <span className="muted">Visual: {shot.visual}</span>
                            <span className="muted">Overlay: {shot.overlay}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!selectedVariant || status === "video-generating"}
                    onClick={handleGenerateVideo}
                  >
                    {status === "video-generating" ? "Generating video..." : "Generate video"}
                  </button>

                  {videoJobId && (
                    <p className="muted">
                      Job: <code>{videoJobId}</code><br />
                      Status: <strong>{videoStatus ?? "PROCESSING"}</strong>
                    </p>
                  )}

                  {status === "video-ready" && (
                    <p className="muted">
                      Stub video completed. Подключи реальный провайдер в <code>/api/videos/generate</code>, чтобы получать MP4 URL.
                    </p>
                  )}
                </div>
              )}
              {status === "idle" && (
                <div className="card result-card result-idle">
                  <p>1) Fill in fields 2) Generate script variants 3) Pick one 4) Generate video job.</p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="page-create"><div className="container">Loading…</div></div>}>
      <CreateContent />
    </Suspense>
  );
}

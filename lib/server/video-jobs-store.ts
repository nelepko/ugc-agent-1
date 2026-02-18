import { newId } from "@/lib/server/db";

export type LocalVideoJob = {
  id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  provider: string;
  projectId: string;
  templateId: string;
  scriptRunId?: string;
  createdAt: string;
  updatedAt: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  durationSec: number | null;
  errorMessage: string | null;
};

const globalStore = globalThis as typeof globalThis & {
  __ugcVideoJobs?: Map<string, LocalVideoJob>;
};

function getStore() {
  if (!globalStore.__ugcVideoJobs) {
    globalStore.__ugcVideoJobs = new Map<string, LocalVideoJob>();
  }
  return globalStore.__ugcVideoJobs;
}

export function createLocalVideoJob(params: {
  provider: string;
  projectId: string;
  templateId: string;
  scriptRunId?: string;
}): LocalVideoJob {
  const now = new Date().toISOString();

  const job: LocalVideoJob = {
    id: newId("vid"),
    status: "QUEUED",
    provider: params.provider,
    projectId: params.projectId,
    templateId: params.templateId,
    scriptRunId: params.scriptRunId,
    createdAt: now,
    updatedAt: now,
    videoUrl: null,
    thumbnailUrl: null,
    durationSec: null,
    errorMessage: null,
  };

  const store = getStore();
  store.set(job.id, job);

  setTimeout(() => {
    const existing = store.get(job.id);
    if (!existing) return;
    existing.status = "PROCESSING";
    existing.updatedAt = new Date().toISOString();
  }, 800);

  setTimeout(() => {
    const existing = store.get(job.id);
    if (!existing) return;
    existing.status = "COMPLETED";
    existing.durationSec = 25;
    existing.updatedAt = new Date().toISOString();
  }, 2000);

  return job;
}

export function getLocalVideoJob(id: string): LocalVideoJob | null {
  return getStore().get(id) ?? null;
}

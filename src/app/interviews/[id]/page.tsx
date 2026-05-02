import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

import InterviewDetailClient from "./interview-detail-client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageShell } from "@/components/ui/layout/page-shell";
import {
  type Interview,
  type InterviewResult,
} from "@/lib/api";

interface InterviewDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

function getBackendUrl() {
  return process.env.BACKEND_URL || "http://localhost:3000";
}

async function requestServer<T>(path: string, cookieHeader: string) {
  const res = await fetch(`${getBackendUrl()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  const body = await res.text();
  if (!body) {
    return undefined as T;
  }

  return JSON.parse(body) as T;
}

async function loadInterviewPageData(id: string, cookieHeader: string) {
  const interview = await requestServer<Interview>(
    `/interviews/${id}`,
    cookieHeader,
  );

  let results: InterviewResult | null = interview.result ?? null;

  if (interview.status === "completed") {
    try {
      results = await requestServer<InterviewResult>(
        `/interviews/${id}/results`,
        cookieHeader,
      );
    } catch {
      results = interview.result ?? null;
    }
  }

  return {
    interview,
    results,
  };
}

export default async function InterviewDetailPage({
  params,
}: InterviewDetailPageProps) {
  noStore();

  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  let interview: Interview;
  let results: InterviewResult | null;

  try {
    ({ interview, results } = await loadInterviewPageData(id, cookieHeader));
  } catch (error) {
    return (
      <PageShell spacing="tight">
        <Alert variant="danger">
          <AlertTitle>Interview unavailable</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load interview."}
          </AlertDescription>
        </Alert>
      </PageShell>
    );
  }

  return (
    <InterviewDetailClient
      id={id}
      initialInterview={interview}
      initialResults={results}
    />
  );
}

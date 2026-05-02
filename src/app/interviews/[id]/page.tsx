import { cookies, headers } from "next/headers";
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

function getRequestOrigin(headerStore: Headers) {
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");
  const protocol = forwardedProto ?? (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    throw new Error("Unable to resolve request host for server API fetch.");
  }

  return `${protocol}://${host}`;
}

async function requestServer<T>(
  path: string,
  cookieHeader: string,
  origin: string,
) {
  const res = await fetch(`${origin}/api${path}`, {
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

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON from /api${path}, got ${contentType || "unknown content type"}.`,
    );
  }

  return JSON.parse(body) as T;
}

async function loadInterviewPageData(
  id: string,
  cookieHeader: string,
  origin: string,
) {
  const interview = await requestServer<Interview>(
    `/interviews/${id}`,
    cookieHeader,
    origin,
  );

  let results: InterviewResult | null = interview.result ?? null;

  if (interview.status === "completed") {
    try {
      results = await requestServer<InterviewResult>(
        `/interviews/${id}/results`,
        cookieHeader,
        origin,
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
  const headerStore = await headers();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const origin = getRequestOrigin(headerStore);

  let interview: Interview;
  let results: InterviewResult | null;

  try {
    ({ interview, results } = await loadInterviewPageData(
      id,
      cookieHeader,
      origin,
    ));
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

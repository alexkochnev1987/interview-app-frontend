"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from '@/i18n/navigation'
import {
  ArrowLeft,
  ChartColumnBig,
  CheckCircle2,
  Copy,
  CircleAlert,
  CircleDashed,
  FileVideo2,
  LoaderCircle,
  Sparkles,
  Upload,
  Workflow,
} from "lucide-react";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { EyebrowLabel } from "@/components/ui/eyebrow-label";
import { HeroLead, HeroTitle } from "@/components/ui/hero-text";
import { HeroNumber } from "@/components/ui/hero-number";
import { IconBadge } from "@/components/ui/icon-badge";
import { IconLabel } from "@/components/ui/icon-label";
import { MetricPanel } from "@/components/ui/metric-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { LoadingStateCard } from "@/components/ui/state-card";
import { SurfaceTile } from "@/components/ui/surface-tile";
import { PageShell } from "@/components/ui/layout/page-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Grid } from "@/components/ui/layout/grid";
import { HiddenFileInput } from "@/components/ui/hidden-file-input";
import { HoverGroup } from "@/components/ui/hover-group";
import { Inline } from "@/components/ui/layout/inline";
import { Progress } from "@/components/ui/progress";
import { Section } from "@/components/ui/layout/section";
import { Stack } from "@/components/ui/layout/stack";
import { BodyText, SectionHeading } from "@/components/ui/text";
import { UnstyledLink } from "@/components/ui/unstyled-link";
import { VideoFrame, VideoSurface } from "@/components/ui/video-frame";
import {
  completeUploadAndFetchInterview,
  generateCandidateLink,
  getInterview,
  getInterviewAnswerMedia,
  getPresignedUrl,
  getResults,
  validateInterview,
  type Interview,
  type InterviewResult,
} from "@/lib/api";
import {
  formatInterviewDate,
  formatInterviewDateTime,
  getCandidateInitials,
} from "@/lib/interview-formatters";
import { useSharedLabels } from "@/i18n/use-shared-labels";
import { runMutation } from "@/lib/run-mutation";
import { useToastMessages } from "@/lib/use-toast-messages";
import { InterviewCanceledBanner } from '@/components/interviews/interview-canceled-banner'
import { InterviewEditPanel } from '@/components/interviews/interview-edit-panel'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cancelInterview } from '@/lib/api'
import { canManageInterview, isCanceledInterview } from '@/lib/interview-management'
import { interviewStatusTone } from '@/lib/interview-status-ui'

type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

interface QuestionUploadState {
  status: UploadStatus;
  errorMessage?: string;
}

interface AnswerMediaState {
  loading: boolean;
  cameraUrl?: string;
  screenUrl?: string;
  errorMessage?: string;
}

interface InterviewDetailClientProps {
  id: string;
  initialInterview: Interview;
  initialResults: InterviewResult | null;
}

function formatAnswerDuration(seconds: number | undefined, emptyLabel: string) {
  if (!seconds || seconds < 1) {
    return emptyLabel;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number | undefined, emptyLabel: string) {
  if (!bytes || bytes < 1) {
    return emptyLabel;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatWorkflowStage(stage: string | undefined, idleLabel: string) {
  if (!stage) {
    return idleLabel;
  }

  return stage.replaceAll("_", " ");
}

function formatMetricLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getValidationTone(
  status?: string,
): "neutral" | "processing" | "completed" | "failed" {
  if (status === "queued" || status === "processing") {
    return "processing";
  }
  if (status === "completed") {
    return "completed";
  }
  if (status === "failed") {
    return "failed";
  }
  return "neutral";
}

function formatCandidateLinkPreview(candidateLink: string) {
  if (!candidateLink) {
    return "";
  }

  try {
    const url = new URL(candidateLink);
    const token = url.searchParams.get("token");
    const shortToken = token
      ? `${token.slice(0, 12)}...${token.slice(-8)}`
      : null;

    return `${url.origin}${url.pathname}${shortToken ? `?token=${shortToken}` : ""}`;
  } catch {
    if (candidateLink.length <= 96) {
      return candidateLink;
    }

    return `${candidateLink.slice(0, 72)}...${candidateLink.slice(-20)}`;
  }
}

export default function InterviewDetailClient({
  id,
  initialInterview,
  initialResults,
}: InterviewDetailClientProps) {

  const [isEditing, setIsEditing] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const tEdit = useTranslations('interviews.edit')

  const t = useTranslations("questions.common");
  const tDetail = useTranslations("interviews.detail");
  const sharedLabels = useSharedLabels();
  const toastMessages = useToastMessages();

  const router = useRouter()

  function validationStatusLabel(status?: string) {
    if (!status) {
      return tDetail("validationStatus.idle");
    }
    if (
      status === "idle" ||
      status === "queued" ||
      status === "processing" ||
      status === "completed" ||
      status === "failed"
    ) {
      return tDetail(`validationStatus.${status}`);
    }
    return status.replaceAll("_", " ");
  }
  const [interview, setInterview] = useState<Interview | null>(initialInterview);
  const [results, setResults] = useState<InterviewResult | null>(initialResults);
  const [loading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [uploadStates, setUploadStates] = useState<QuestionUploadState[]>(
    initialInterview.questions.map((_, qi) => {
      const hasAnswer = initialInterview.answers.some(
        (answer) => answer.questionIndex === qi,
      );
      return {
        status: hasAnswer ? "uploaded" : "idle",
      } as QuestionUploadState;
    }),
  );
  const [mediaByQuestion, setMediaByQuestion] = useState<
    Record<number, AnswerMediaState>
  >({});
  const [candidateLink, setCandidateLink] = useState("");
  const [candidateLinkStatus, setCandidateLinkStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [candidateLinkError, setCandidateLinkError] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const tActions = useTranslations('interviews.actions')

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const validationPollRef = useRef<number | null>(null);
  const requestedMediaRef = useRef<Map<number, string>>(new Map());
  const mediaFetchInterviewIdRef = useRef(id);

  const buildCandidateUrl = useCallback((relativeLink: string) => {
    if (typeof window === "undefined") {
      return relativeLink;
    }

    return new URL(relativeLink, window.location.origin).toString();
  }, []);

  const loadCandidateLink = useCallback(
    async (mode: "initial" | "refresh" = "refresh") => {
      try {
        setCandidateLinkStatus("loading");
        setCandidateLinkError("");
        const data = await runMutation(() => generateCandidateLink(id), {
          showSuccessToast: mode === "refresh",
          showErrorToast: mode === "refresh",
          successMessage: toastMessages.interview.refreshLinkSuccess,
          errorMessage: toastMessages.interview.refreshLinkError,
        });
        setCandidateLink(buildCandidateUrl(data.candidateLink));
        setCandidateLinkStatus("ready");
        if (mode === "refresh") {
          setCopyStatus("idle");
        }
      } catch (err) {
        setCandidateLink("");
        setCandidateLinkStatus("error");
        setCandidateLinkError(
          err instanceof Error
            ? err.message
            : toastMessages.interview.refreshLinkError,
        );
      }
    },
    [buildCandidateUrl, id, toastMessages.interview.refreshLinkError, toastMessages.interview.refreshLinkSuccess],
  );

  useEffect(() => {
    void loadCandidateLink("initial");
  }, [loadCandidateLink]);

  function setFileInputRef(index: number, element: HTMLInputElement | null) {
    fileInputRefs.current[index] = element;
  }

  const stopValidationPolling = useCallback(() => {
    if (validationPollRef.current !== null) {
      window.clearInterval(validationPollRef.current);
      validationPollRef.current = null;
    }
    setValidating(false);
  }, []);

  const startValidationPolling = useCallback(() => {
    if (validationPollRef.current !== null) {
      return;
    }

    validationPollRef.current = window.setInterval(async () => {
      try {
        const refreshedInterview = await getInterview(id);
        setInterview(refreshedInterview);
        setResults(refreshedInterview.result ?? null);

        const hasActiveValidation = refreshedInterview.answers.some(
          (answer) =>
            answer.validation?.status === "queued" ||
            answer.validation?.status === "processing",
        );

        if (refreshedInterview.status === "completed") {
          stopValidationPolling();
          try {
            const nextResults = await getResults(id);
            setResults(nextResults);
          } catch (resultsError) {
            console.warn(
              t("resultsNotAfterValidation"),
              resultsError,
            );
          }
          return;
        }

        if (!hasActiveValidation) {
          stopValidationPolling();
        }
      } catch (pollError) {
        console.warn("Validation polling stopped", pollError);
        stopValidationPolling();
      }
    }, 2500);
  }, [id, stopValidationPolling, t]);

  useEffect(() => {
    return () => {
      if (validationPollRef.current !== null) {
        window.clearInterval(validationPollRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!interview) {
      return;
    }

    if (mediaFetchInterviewIdRef.current !== id) {
      requestedMediaRef.current.clear();
      mediaFetchInterviewIdRef.current = id;
    }

    const answersWithMedia = interview.answers.filter(
      (answer) => answer.mediaKey || answer.screenMediaKey,
    );
    if (answersWithMedia.length === 0) {
      return;
    }

    answersWithMedia.forEach((answer) => {
      const mediaFingerprint = `${answer.mediaKey ?? ""}|${answer.screenMediaKey ?? ""}`;
      if (requestedMediaRef.current.get(answer.questionIndex) === mediaFingerprint) {
        return;
      }

      requestedMediaRef.current.set(answer.questionIndex, mediaFingerprint);

      setMediaByQuestion((current) => ({
        ...current,
        [answer.questionIndex]: {
          ...current[answer.questionIndex],
          loading: true,
          errorMessage: undefined,
        },
      }));

      void getInterviewAnswerMedia(id, answer.questionIndex)
        .then((media) => {
          setMediaByQuestion((current) => ({
            ...current,
            [answer.questionIndex]: {
              loading: false,
              cameraUrl: media.cameraUrl,
              screenUrl: media.screenUrl,
            },
          }));
        })
        .catch((mediaError) => {
          setMediaByQuestion((current) => ({
            ...current,
            [answer.questionIndex]: {
              loading: false,
              errorMessage:
                mediaError instanceof Error
                  ? mediaError.message
                  : t("failedLoadMedia"),
            },
          }));
        });
    });
  }, [id, interview, t]);

  async function handleCopyCandidateLink() {
    if (!candidateLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(candidateLink);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  async function handleUpload(questionIndex: number) {
    const fileInput = fileInputRefs.current[questionIndex];
    if (!fileInput?.files?.length || !interview) {
      return;
    }

    const file = fileInput.files[0];

    setUploadStates((current) =>
      current.map((state, index) =>
        index === questionIndex ? { status: "uploading" } : state,
      ),
    );

    try {
      const refreshedInterview = await runMutation(
        async () => {
          const { uploadUrl, mediaKey } = await getPresignedUrl(
            interview.id,
            questionIndex,
            file.type as "video/webm",
          );

          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error(t("uploadToStorageFailed"));
          }

          return completeUploadAndFetchInterview(
            interview.id,
            questionIndex,
            mediaKey,
          );
        },
        {
          successMessage: toastMessages.interview.uploadSuccess(questionIndex + 1),
          errorMessage: toastMessages.interview.uploadError(questionIndex + 1),
        },
      );
      setInterview(refreshedInterview);
      setUploadStates((current) =>
        current.map((state, index) =>
          index === questionIndex ? { status: "uploaded" } : state,
        ),
      );
    } catch (err) {
      setUploadStates((current) =>
        current.map((state, index) =>
          index === questionIndex
            ? {
                status: "error",
                errorMessage:
                  err instanceof Error ? err.message : t("uploadFailed"),
              }
            : state,
        ),
      );
    }
  }

  async function handleValidate() {
    if (!interview) {
      return;
    }

    setValidating(true);

    try {
      await runMutation(() => validateInterview(interview.id, { force: true }), {
        successMessage: toastMessages.interview.validationStartSuccess,
        errorMessage: toastMessages.interview.validationStartError,
      });
      const refreshedInterview = await getInterview(interview.id);
      setInterview(refreshedInterview);
      setResults(refreshedInterview.result ?? null);
      startValidationPolling();
    } catch {
      setValidating(false);
    }
  }

  async function handleCancelInterview() {
    if (canceling || !interview) return

    setCanceling(true)

    try {
      const updated = await runMutation(() => cancelInterview(id), {
        successMessage: toastMessages.interview.cancelSuccess,
        errorMessage: toastMessages.interview.cancelError,
      })
      setCancelConfirmOpen(false)
      router.push('/')
    } catch {
      /* toast handled by runMutation */
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <PageShell>
        <LoadingStateCard label={t("loadingInterview")} />
      </PageShell>
    );
  }

  if (!interview) {
    return null;
  }

  const answeredCount = interview.answers.filter(
    (answer) => answer.status === "submitted",
  ).length;
  const validatedCount = interview.answers.filter(
    (answer) => answer.validation?.status === "completed",
  ).length;
  const hasActiveValidation = interview.answers.some(
    (answer) =>
      answer.validation?.status === "queued" ||
      answer.validation?.status === "processing",
  );
  const totalQuestions = interview.questions.length;
  const answersByIndex = new Map(
    interview.answers.map((a) => [a.questionIndex, a]),
  );
  const progressValue =
    answeredCount === 0
      ? 0
      : Math.round((validatedCount / answeredCount) * 100);
  const allAnswered = interview.questions.every((_, qi) =>
    interview.answers.some(
      (answer) => answer.questionIndex === qi && answer.status === "submitted",
    ),
  );
  const isTerminal =
    interview.status === "completed" || interview.status === "failed";
  const canValidate =
    allAnswered && !hasActiveValidation && interview.status !== "completed";
  const candidateLinkPreview = formatCandidateLinkPreview(candidateLink);

  return (
    <PageShell>
      {interview && isCanceledInterview(interview) ? (
          <InterviewCanceledBanner/>
      ) : null}
      <Grid as="section" columns="split-115-85" gap={6}>
        <Card variant="floating" size="lg">
          <CardContent spacing="2xl">
            <Inline gap={4} align="start" justify="between" wrap="wrap">
              <Stack gap={4}>
                <UnstyledLink href="/">
                  <EyebrowBadge
                    tone="default"
                    icon={<ArrowLeft className="size-3.5" />}
                  >
                    {tDetail("backToDashboard")}
                  </EyebrowBadge>
                </UnstyledLink>

                <Inline gap={4} align="center">
                  <IconBadge tone="primary" size="lg" textSize="lg">
                    {getCandidateInitials(interview.candidateName)}
                  </IconBadge>
                  <Stack gap={1.5}>
                    <HeroTitle>{interview.candidateName}</HeroTitle>
                    <HeroLead>{interview.position}</HeroLead>
                  </Stack>
                </Inline>

                <Inline gap={3} align="center" wrap="wrap">
                  <StatusPill tone={interviewStatusTone(interview.status)}>
                    {sharedLabels.interviewStatus(interview.status)}
                  </StatusPill>
                  <StatusPill tone="neutral">
                    {t("createdPrefix")} {formatInterviewDate(interview.createdAt)}
                  </StatusPill>
                </Inline>
              </Stack>

              <Inline gap={3} wrap="wrap">
                {canManageInterview(interview) && !isEditing ? (
                    <>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                        {tActions('edit')}
                      </Button>
                      <Button
                          type="button"
                          variant="destructive"
                          onClick={()=>setCancelConfirmOpen(true)}
                          disabled={canceling}
                      >
                        {canceling ? tActions('canceling') : tActions('cancelInterview')}
                      </Button>
                    </>
                ) : null}
                {isEditing ? (
                    <Button variant="outline" onClick={() => setDiscardOpen(true)}>
                      {tActions('discardEdit')}
                    </Button>
                ) : null}
                {!isEditing && !isCanceledInterview(interview) && interview.status !== 'completed' ? (
                    <Button
                        type="button"
                        variant="gradient"
                        onClick={handleValidate}
                        disabled={!canValidate || validating || hasActiveValidation}
                    >
                      {validating || hasActiveValidation ? t('validating') : t('validate')}                    </Button>
                ) : null}
              </Inline>
            </Inline>

            <Grid columns="metrics-3" gap={4}>
              <MetricPanel
                label={t("metricsQuestions")}
                value={totalQuestions}
                valueSize="lg"
              />
              <MetricPanel
                label={t("metricsUploaded")}
                value={answeredCount}
                valueSize="lg"
              />
              <MetricPanel
                label={t("metricsOverallScore")}
                value={results ? results.overallScore : "--"}
                valueSize="lg"
              />
            </Grid>
          </CardContent>
        </Card>

        {!isEditing ? (
        <Card variant="tinted">
          <CardHeader spacing="sm">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />} tone="muted">
              {t("candidateAccessEyebrow")}
            </EyebrowBadge>
            <CardTitle size="lg">{t("interviewLinkTitle")}</CardTitle>
            <CardDescription>{t("interviewLinkDescription")}</CardDescription>
          </CardHeader>
          <CardContent spacing="xl">
            <SurfaceTile tone="glass" padding="lg">
              <Stack gap={3}>
                <Inline gap={3} align="center" justify="between" wrap="wrap">
                  <BodyText as="span" size="sm-tight" tone="foreground">
                    {t("candidateLinkLabel")}
                  </BodyText>
                  <Inline gap={2} wrap="wrap">
                    <Button
                      type="button"
                      variant="outline-pill"
                      shape="pill"
                      size="sm"
                      onClick={() => void loadCandidateLink("refresh")}
                      disabled={candidateLinkStatus === "loading" || isCanceledInterview(interview)}
                    >
                      {candidateLinkStatus === "loading"
                        ? t("generating")
                        : t("refreshLink")}
                    </Button>
                    <Button
                      type="button"
                      variant="gradient"
                      shape="pill"
                      size="sm"
                      onClick={handleCopyCandidateLink}
                      disabled={
                        candidateLinkStatus !== "ready" || !candidateLink
                      }
                    >
                      <Copy className="size-4" />
                      {copyStatus === "copied"
                        ? t("copied")
                        : copyStatus === "error"
                          ? t("copyFailed")
                          : t("copyLink")}
                    </Button>
                  </Inline>
                </Inline>

                <BodyText size="sm">
                  {candidateLinkStatus === "loading"
                    ? t("generatingLink")
                    : candidateLinkStatus === "error"
                      ? candidateLinkError
                      : candidateLinkPreview || t("linkNotReady")}
                </BodyText>
                {candidateLinkStatus === "ready" && candidateLink ? (
                  <BodyText size="xs" title={candidateLink}>
                    {t("linkPreviewHelp")}
                  </BodyText>
                ) : null}
              </Stack>
            </SurfaceTile>

            <SurfaceTile tone="glass" padding="lg">
              <Stack gap={3}>
                <IconLabel
                  icon={
                    canValidate ? (
                      <CheckCircle2 className="size-4 text-success-soft-foreground" />
                    ) : (
                      <CircleDashed className="size-4 text-muted-foreground" />
                    )
                  }
                >
                  {t("readyState")}
                </IconLabel>
                <BodyText size="sm">
                  {hasActiveValidation
                    ? t("readyValidationRunning")
                    : canValidate
                      ? t("readyCanValidate")
                      : t("readyLocked")}
                </BodyText>
              </Stack>
            </SurfaceTile>

            <SurfaceTile tone="glass" padding="lg">
              <Stack gap={3}>
                <Inline gap={3} align="center" justify="between">
                  <BodyText as="span" size="sm-tight" tone="foreground">
                    {t("validationProgress")}
                  </BodyText>
                  <StatusPill tone="neutral">{progressValue}%</StatusPill>
                </Inline>
                <Progress value={progressValue} density="thick" />
                <BodyText size="sm">
                  {t("validatedOf", {
                    validated: validatedCount,
                    answered: answeredCount,
                  })}
                </BodyText>
              </Stack>
            </SurfaceTile>

            {interview.workflow ? (
              <SurfaceTile tone="glass" padding="lg">
                <Stack gap={3}>
                  <IconLabel icon={<Workflow className="size-4" />} tone="primary">
                    {t("workflowLabel")}
                  </IconLabel>
                  <BodyText size="sm">
                    {t("workflowStatus")}{" "}
                    <strong>
                      {interview.workflow.status.replace("_", " ")}
                    </strong>
                    {interview.workflow.currentStage
                      ? ` • ${t("workflowStage")} ${formatWorkflowStage(interview.workflow.currentStage, t("idle"))}`
                      : ""}
                  </BodyText>
                  <BodyText size="sm">
                    {t("workflowLastUpdate")}{" "}
                    {formatInterviewDateTime(interview.workflow.lastUpdatedAt)}
                  </BodyText>
                  {interview.workflow.errorMessage ? (
                    <BodyText size="sm" tone="danger">
                      {interview.workflow.errorMessage}
                    </BodyText>
                  ) : null}
                </Stack>
              </SurfaceTile>
            ) : null}
          </CardContent>
        </Card>
        ) : null}
      </Grid>

      {isEditing ? (
        <InterviewEditPanel
          interview={interview}
          onSaved={(updated) => {
            setInterview(updated)
            setIsEditing(false)
          }}
          onDiscard={() => setDiscardOpen(true)}
        />
      ) : (
      <>
      <Section gap={4}>
        <Inline gap={4} align="end" justify="between" wrap="wrap">
          <Stack gap={2}>
            <EyebrowLabel size="lg">{t("packetEyebrow")}</EyebrowLabel>
            <SectionHeading>{t("packetHeading")}</SectionHeading>
          </Stack>
          <BodyText size="sm">{t("packetLead")}</BodyText>
        </Inline>

        <Stack gap={4}>
          {interview.questions.map((question, questionIndex) => {
            const answer = answersByIndex.get(questionIndex);
            const hasAnswer = Boolean(answer);
            const uploadState = uploadStates[questionIndex] ?? {
              status: "idle",
            };
            const media = mediaByQuestion[questionIndex];

            return (
              <HoverGroup key={question.id}>
                <Card variant="surface" interaction="hover">
                  <CardHeader spacing="md">
                    <Inline gap={4} align="start" justify="between" wrap="wrap">
                      <Stack gap={3}>
                        <Inline gap={2} align="center" wrap="wrap">
                          <StatusPill tone="neutral">
                            Q{questionIndex + 1}
                          </StatusPill>
                          <StatusPill tone={question.difficulty}>
                            {sharedLabels.difficulty(question.difficulty)}
                          </StatusPill>
                          {question.category ? (
                            <StatusPill tone="neutral" casing="chip">
                              {question.category}
                            </StatusPill>
                          ) : null}
                          <StatusPill tone="neutral">
                            {t("weightInline", { weight: question.weight })}
                          </StatusPill>
                        </Inline>
                        <CardTitle size="md" width="xl">
                          {question.questionText}
                        </CardTitle>
                      </Stack>

                      <Stack gap={2} align="end">
                        {answer?.status === "submitted" ? (
                          <StatusPill tone="completed">{t("answerSubmitted")}</StatusPill>
                        ) : hasAnswer || uploadState.status === "uploaded" ? (
                          <StatusPill tone="processing">{t("answerDraft")}</StatusPill>
                        ) : uploadState.status === "uploading" ? (
                          <StatusPill tone="processing">{t("answerUploading")}</StatusPill>
                        ) : uploadState.status === "error" ? (
                          <StatusPill tone="failed">{t("answerUploadFailed")}</StatusPill>
                        ) : (
                          <StatusPill tone="pending">{t("answerPending")}</StatusPill>
                        )}
                        {answer?.validation ? (
                          <StatusPill
                            tone={getValidationTone(answer.validation.status)}
                          >
                            {validationStatusLabel(answer.validation.status)}
                          </StatusPill>
                        ) : null}

                        {!isTerminal && !hasActiveValidation && !validating ? (
                          <>
                            <HiddenFileInput
                              accept="video/*,audio/*"
                              ref={(element) =>
                                setFileInputRef(questionIndex, element)
                              }
                              onChange={() => handleUpload(questionIndex)}
                            />
                            <Button
                              type="button"
                              variant={
                                uploadState.status === "error"
                                  ? "destructive"
                                  : "outline-pill"
                              }
                              shape="pill"
                              size="sm"
                              onClick={() =>
                                fileInputRefs.current[questionIndex]?.click()
                              }
                            >
                              <Upload className="size-4" />
                              {uploadState.status === "error"
                                ? t("retryUpload")
                                : t("uploadManualHint")}
                            </Button>
                          </>
                        ) : null}
                      </Stack>
                    </Inline>
                  </CardHeader>
                  <CardContent spacing="md">
                    {answer ? (
                      <Grid columns="metrics-2-md" gap={4}>
                        <SurfaceTile rounded="xl">
                          <Stack gap={3}>
                            <EyebrowLabel>{t("recordedAnswer")}</EyebrowLabel>
                            <BodyText size="sm">
                              {t("answerDuration", {
                                duration: formatAnswerDuration(
                                  answer.durationSeconds,
                                  t("notAvailable"),
                                ),
                                count: answer.retakeCount ?? 0,
                              })}
                            </BodyText>
                            <BodyText size="sm">
                              {t("answerMediaSizes", {
                                camera: formatFileSize(
                                  answer.camera?.fileSizeBytes,
                                  t("notAvailable"),
                                ),
                                screen: formatFileSize(
                                  answer.screen?.fileSizeBytes,
                                  t("notAvailable"),
                                ),
                              })}
                            </BodyText>
                            <BodyText size="sm">
                              {t("answerMeta", {
                                status: answer.status,
                                versions: answer.versions?.length ?? 1,
                              })}
                            </BodyText>
                            <BodyText size="sm">
                              {t("uploaded")}{" "}
                              {formatInterviewDateTime(answer.uploadedAt)}
                            </BodyText>
                            {media?.loading ? (
                              <Inline gap={2} align="center">
                                <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
                                <BodyText size="sm">
                                  {t("loadingMedia")}
                                </BodyText>
                              </Inline>
                            ) : null}
                            {media?.errorMessage ? (
                              <BodyText size="sm" tone="danger">
                                {media.errorMessage}
                              </BodyText>
                            ) : null}
                          </Stack>
                        </SurfaceTile>
                        <SurfaceTile rounded="xl">
                          <Stack gap={3}>
                            <EyebrowLabel>{t("validationStatus")}</EyebrowLabel>
                            <BodyText size="sm">
                              {t("hiddenTabs")}{" "}
                              {answer.behaviorSignals?.tabHiddenCount ?? 0} •{" "}
                              {t("blur")}{" "}
                              {answer.behaviorSignals?.windowBlurCount ?? 0} •{" "}
                              {t("copy")} {answer.behaviorSignals?.copyCount ?? 0} •{" "}
                              {t("paste")}{" "}
                              {answer.behaviorSignals?.pasteCount ?? 0}
                            </BodyText>
                            <BodyText size="sm">
                              {t("keydown")}{" "}
                              {answer.behaviorSignals?.keydownCount ?? 0} •{" "}
                              {t("resize")}{" "}
                              {answer.behaviorSignals?.resizeCount ?? 0}
                            </BodyText>
                            <BodyText size="sm">
                              {t("transcript")}{" "}
                              {answer.transcript?.text ? t("ready") : t("pending")}{" "}
                              • {t("evaluation")}{" "}
                              {answer.evaluation?.overallScore !== undefined
                                ? t("ready")
                                : t("pending")}
                            </BodyText>
                            {answer.validation?.errorMessage ? (
                              <BodyText size="sm" tone="danger">
                                {answer.validation.errorMessage}
                              </BodyText>
                            ) : null}
                          </Stack>
                        </SurfaceTile>
                      </Grid>
                    ) : null}

                    {answer?.evaluation ? (
                      <Grid columns="metrics-2-md" gap={4}>
                        <SurfaceTile rounded="xl">
                          <Stack gap={3}>
                            <EyebrowLabel>{t("shortResult")}</EyebrowLabel>
                            <Inline gap={2} align="center" wrap="wrap">
                              {answer.evaluation.overallScore !== undefined ? (
                                <StatusPill tone="neutral">
                                  {t("scorePrefix")} {answer.evaluation.overallScore}
                                </StatusPill>
                              ) : null}
                              {answer.evaluation.decisionHint ? (
                                <StatusPill tone="neutral">
                                  {answer.evaluation.decisionHint}
                                </StatusPill>
                              ) : null}
                              {answer.evaluation.behaviorRisk ? (
                                <StatusPill tone="neutral">
                                  {t("riskPrefix")} {answer.evaluation.behaviorRisk}
                                </StatusPill>
                              ) : null}
                            </Inline>
                            <BodyText size="sm">
                              {answer.evaluation.summary ??
                                t("summaryUnavailable")}
                            </BodyText>
                            {answer.evaluation.categoryScores &&
                            Object.keys(answer.evaluation.categoryScores)
                              .length > 0 ? (
                              <BodyText size="sm">
                                {Object.entries(
                                  answer.evaluation.categoryScores,
                                )
                                  .map(
                                    ([category, score]) =>
                                      `${category}: ${score}`,
                                  )
                                  .join(" • ")}
                              </BodyText>
                            ) : null}
                          </Stack>
                        </SurfaceTile>
                        <SurfaceTile rounded="xl">
                          <Stack gap={3}>
                            <EyebrowLabel>{t("detailedRubric")}</EyebrowLabel>
                            <BodyText size="sm">
                              {t("covered")}:{" "}
                              {answer.evaluation.coveredConceptIds?.length
                                ? answer.evaluation.coveredConceptIds.join(", ")
                                : t("none")}
                            </BodyText>
                            <BodyText size="sm">
                              {t("missed")}:{" "}
                              {answer.evaluation.missedConceptIds?.length
                                ? answer.evaluation.missedConceptIds.join(", ")
                                : t("none")}
                            </BodyText>
                            <BodyText size="sm">
                              {t("redFlags")}:{" "}
                              {answer.evaluation.redFlagIds?.length
                                ? answer.evaluation.redFlagIds.join(", ")
                                : t("none")}
                            </BodyText>
                          </Stack>
                        </SurfaceTile>
                      </Grid>
                    ) : null}

                    {answer?.transcript?.text ? (
                      <SurfaceTile rounded="xl">
                        <Stack gap={3}>
                          <EyebrowLabel>{t("fullResult")}</EyebrowLabel>
                          <BodyText size="sm">
                            {answer.transcript.text}
                          </BodyText>
                        </Stack>
                      </SurfaceTile>
                    ) : null}

                    {media?.cameraUrl || media?.screenUrl ? (
                      <Grid columns="metrics-2-md" gap={4}>
                        {media.cameraUrl ? (
                          <SurfaceTile rounded="xl">
                            <Stack gap={3}>
                              <EyebrowLabel>{t("candidateCamera")}</EyebrowLabel>
                              <VideoFrame className="my-0 rounded-2xl">
                                <VideoSurface
                                  controls
                                  preload="metadata"
                                  playsInline
                                  src={media.cameraUrl}
                                />
                              </VideoFrame>
                            </Stack>
                          </SurfaceTile>
                        ) : null}
                        {media.screenUrl ? (
                          <SurfaceTile rounded="xl">
                            <Stack gap={3}>
                              <EyebrowLabel>{t("candidateScreen")}</EyebrowLabel>
                              <VideoFrame className="my-0 rounded-2xl">
                                <VideoSurface
                                  controls
                                  preload="metadata"
                                  playsInline
                                  src={media.screenUrl}
                                />
                              </VideoFrame>
                            </Stack>
                          </SurfaceTile>
                        ) : null}
                      </Grid>
                    ) : null}

                    <Grid columns="metrics-2-md" gap={4}>
                      <SurfaceTile rounded="xl">
                        <Stack gap={3}>
                          <EyebrowLabel>{t("expectedConcepts")}</EyebrowLabel>
                          <BodyText size="sm">
                            {question.expectedConcepts.length > 0
                              ? question.expectedConcepts
                                  .map((item) => item.label)
                                  .join(", ")
                              : t("notSpecified")}
                          </BodyText>
                        </Stack>
                      </SurfaceTile>
                      <SurfaceTile rounded="xl">
                        <Stack gap={3}>
                          <EyebrowLabel>{t("redFlags")}</EyebrowLabel>
                          <BodyText size="sm">
                            {question.redFlags.length > 0
                              ? question.redFlags
                                  .map((item) => item.label)
                                  .join(", ")
                              : t("notSpecified")}
                          </BodyText>
                        </Stack>
                      </SurfaceTile>
                    </Grid>

                    {uploadState.status === "error" &&
                    uploadState.errorMessage ? (
                      <Alert variant="danger">
                        <CircleAlert className="size-4" />
                        <AlertTitle>{t("uploadErrorTitle")}</AlertTitle>
                        <AlertDescription>
                          {uploadState.errorMessage}
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </CardContent>
                </Card>
              </HoverGroup>
            );
          })}
        </Stack>
      </Section>

      {results ? (
        <Section gap={4}>
          <Inline gap={4} align="end" justify="between" wrap="wrap">
            <Stack gap={2}>
              <EyebrowLabel size="lg">{t("scorecardEyebrow")}</EyebrowLabel>
              <SectionHeading>{t("scorecardHeading")}</SectionHeading>
            </Stack>
            <BodyText size="sm">{t("scorecardFootnote")}</BodyText>
          </Inline>

          <Grid columns="split-115-85" gap={4}>
            <Card variant="surface" size="lg">
              <CardContent spacing="lg">
                <Stack gap={5}>
                  <Stack gap={3}>
                    <EyebrowBadge
                      icon={<ChartColumnBig className="size-3.5" />}
                      tone="primary"
                    >
                      {t("resultsSummaryEyebrow")}
                    </EyebrowBadge>
                    <BodyText size="lead">{results.summary}</BodyText>
                    <Inline gap={2} wrap="wrap">
                      {results.decision ? (
                        <StatusPill tone="neutral">
                          {results.decision}
                        </StatusPill>
                      ) : null}
                      {results.trustScore !== undefined ? (
                        <StatusPill tone="neutral">
                          {t("trustPrefix")} {results.trustScore}
                        </StatusPill>
                      ) : null}
                      {results.rubricVersion ? (
                        <StatusPill tone="neutral">
                          {results.rubricVersion}
                        </StatusPill>
                      ) : null}
                    </Inline>
                    {results.trustFlags?.length ? (
                      <BodyText size="lead">
                        {t("flagsPrefix")}: {results.trustFlags.join(", ")}
                      </BodyText>
                    ) : null}
                  </Stack>

                  {results.questionResults?.length ? (
                    <Stack gap={4}>
                      <IconLabel icon={<FileVideo2 className="size-4" />} tone="primary">
                        {t("questionBreakdown")}
                      </IconLabel>
                      <Stack gap={3}>
                        {results.questionResults.map((questionResult) => (
                          <SurfaceTile
                            key={questionResult.questionId}
                            tone="elevated"
                            padding="lg"
                            rounded="xl"
                          >
                            <Stack gap={4}>
                              <Inline
                                gap={3}
                                align="center"
                                justify="between"
                                wrap="wrap"
                              >
                                <Stack gap={1}>
                                  <EyebrowLabel>
                                    {t("questionLabel", {
                                      n: questionResult.questionIndex + 1,
                                    })}
                                  </EyebrowLabel>
                                  {questionResult.summary ? (
                                    <BodyText size="sm">
                                      {questionResult.summary}
                                    </BodyText>
                                  ) : null}
                                </Stack>
                                <Inline gap={2} align="center" wrap="wrap">
                                  {questionResult.decisionHint ? (
                                    <StatusPill tone="neutral">
                                      {questionResult.decisionHint}
                                    </StatusPill>
                                  ) : null}
                                  {questionResult.score !== undefined ? (
                                    <StatusPill tone="completed">
                                      {t("scorePrefix")} {questionResult.score}
                                    </StatusPill>
                                  ) : null}
                                </Inline>
                              </Inline>

                              {questionResult.categoryScores &&
                              Object.keys(questionResult.categoryScores)
                                .length > 0 ? (
                                <Grid columns={3} gap={3}>
                                  {Object.entries(
                                    questionResult.categoryScores,
                                  ).map(([category, score]) => (
                                    <MetricPanel
                                      key={`${questionResult.questionId}-${category}`}
                                      tone="compact"
                                      label={formatMetricLabel(category)}
                                      value={score}
                                      valueSize="md"
                                      valueTone="primary"
                                      description={t("outOf100")}
                                    />
                                  ))}
                                </Grid>
                              ) : null}
                            </Stack>
                          </SurfaceTile>
                        ))}
                      </Stack>
                    </Stack>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>

            <Stack gap={4}>
              <Card variant="surface" size="lg">
                <CardContent spacing="lg">
                  <EyebrowBadge
                    icon={<FileVideo2 className="size-3.5" />}
                    tone="primary"
                  >
                    {t("overallScoreCard")}
                  </EyebrowBadge>
                  <HeroNumber>{results.overallScore}</HeroNumber>
                </CardContent>
              </Card>

              <Grid columns={1} gap={4}>
                {Object.entries(results.categoryScores).map(
                  ([category, score]) => (
                    <MetricPanel
                      key={category}
                      tone="surface"
                      label={formatMetricLabel(category)}
                      value={score}
                      description={t("outOf100")}
                      valueSize="hero"
                      valueTone="primary"
                    />
                  ),
                )}
              </Grid>
            </Stack>
          </Grid>
        </Section>
      ) : null}
      </>
      )}

      <ConfirmDialog
          open={discardOpen}
          title={tEdit('discardTitle')}
          description={tEdit('discardDescription')}
          confirmLabel={tActions('discardEdit')}
          cancelLabel={tActions('dismiss')}
          onConfirm={() => {
            setIsEditing(false)
            setDiscardOpen(false)
          }}
          onCancel={() => setDiscardOpen(false)}
        />

      <ConfirmDialog
          open={cancelConfirmOpen}
          destructive
          title={tActions('cancelTitle')}
          description={tActions('cancelDescription')}
          confirmLabel={canceling ? tActions('canceling') : tActions('confirmCancel')}
          cancelLabel={tActions('dismiss')}
          loading={canceling}
          onConfirm={() => void handleCancelInterview()}
          onCancel={() => {
            if (!canceling) setCancelConfirmOpen(false)
          }}
        />

    </PageShell>
  );
}

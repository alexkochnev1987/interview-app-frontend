import { useCallback, useEffect, useRef, useState } from 'react';

import {
  completeInterview,
  completeUpload,
  getInterview,
  getPresignedUrl,
  getResults,
  type Interview,
  type InterviewResult,
} from '@/lib/api';

type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

interface QuestionUploadState {
  status: UploadStatus;
  errorMessage?: string;
}

export function useInterviewDetail(id: string) {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [results, setResults] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [uploadStates, setUploadStates] = useState<QuestionUploadState[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loadInterview = useCallback(async () => {
    try {
      const data = await getInterview(id);
      setInterview(data);
      setUploadStates(
        data.questions.map((_, qi) => {
          const hasAnswer = data.answers.some((answer) => answer.questionIndex === qi);
          return { status: hasAnswer ? 'uploaded' : 'idle' } as QuestionUploadState;
        }),
      );

      if (data.status === 'completed') {
        try {
          const nextResults = await getResults(id);
          setResults(nextResults);
        } catch {
          // Results may still be processing even after completion.
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  function setFileInputRef(index: number, element: HTMLInputElement | null) {
    fileInputRefs.current[index] = element;
  }

  async function handleUpload(questionIndex: number) {
    const fileInput = fileInputRefs.current[questionIndex];
    if (!fileInput?.files?.length || !interview) {
      return;
    }

    const file = fileInput.files[0];

    setUploadStates((current) =>
      current.map((state, index) => (index === questionIndex ? { status: 'uploading' } : state)),
    );

    try {
      const { uploadUrl, mediaKey } = await getPresignedUrl(interview.id, questionIndex, file.type);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload to storage failed');
      }

      const updatedInterview = await completeUpload(interview.id, questionIndex, mediaKey);
      setInterview(updatedInterview);
      setUploadStates((current) =>
        current.map((state, index) => (index === questionIndex ? { status: 'uploaded' } : state)),
      );
    } catch (err) {
      setUploadStates((current) =>
        current.map((state, index) =>
          index === questionIndex
            ? {
                status: 'error',
                errorMessage: err instanceof Error ? err.message : 'Upload failed',
              }
            : state,
        ),
      );
    }
  }

  async function handleComplete() {
    if (!interview) {
      return;
    }

    setCompleting(true);
    setError(null);

    try {
      const updatedInterview = await completeInterview(interview.id);
      setInterview(updatedInterview);

      if (updatedInterview.status === 'completed') {
        try {
          const nextResults = await getResults(interview.id);
          setResults(nextResults);
        } catch {
          // Results may still be processing after completion.
        }
      }

      if (updatedInterview.status === 'processing') {
        const pollId = window.setInterval(async () => {
          try {
            const refreshedInterview = await getInterview(interview.id);
            setInterview(refreshedInterview);

            if (refreshedInterview.status === 'completed') {
              window.clearInterval(pollId);
              const nextResults = await getResults(interview.id);
              setResults(nextResults);
            } else if (refreshedInterview.status === 'failed') {
              window.clearInterval(pollId);
            }
          } catch {
            window.clearInterval(pollId);
          }
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete interview.');
    } finally {
      setCompleting(false);
    }
  }

  return {
    interview,
    results,
    loading,
    error,
    completing,
    uploadStates,
    fileInputRefs,
    setFileInputRef,
    handleUpload,
    handleComplete,
  };
}

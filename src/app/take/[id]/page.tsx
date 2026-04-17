'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

interface InterviewData {
  id: string;
  position: string;
  candidateName: string;
  totalQuestions: number;
  currentQuestion: string | null;
  currentQuestionIndex: number;
  completed: boolean;
}

type Stage = 'loading' | 'consent' | 'interview' | 'recording' | 'review' | 'complete';

export default function TakeInterviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get('token') || '';

  const [stage, setStage] = useState<Stage>('loading');
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [timeLeft, setTimeLeft] = useState(240); // 4 minutes
  const [reRecordUsed, setReRecordUsed] = useState(false);
  const [uploading, setUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load interview data
  async function loadInterview() {
    try {
      const res = await fetch(`/api/take/${id}?token=${token}`);
      if (!res.ok) throw new Error('Invalid or expired interview link');
      const data: InterviewData = await res.json();
      setInterview(data);
      if (data.completed) {
        setStage('complete');
      } else {
        setStage('consent');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview');
    }
  }

  useEffect(() => {
    loadInterview();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start camera
  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 854, height: 480 },
      audio: true,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }

  // Start consent → interview
  async function handleStartInterview() {
    try {
      await startCamera();
      setStage('interview');
    } catch {
      setError('Camera and microphone access required');
    }
  }

  // Start recording answer
  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm',
      videoBitsPerSecond: 1_500_000,
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setStage('review');
    };
    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setRecording(true);
    setTimeLeft(240);
    setStage('recording');

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  // Re-record
  function handleReRecord() {
    setRecordedBlob(null);
    setReRecordUsed(true);
    setStage('interview');
  }

  // Submit answer and move to next question
  async function handleSubmitAnswer() {
    if (!recordedBlob || !interview) return;
    setUploading(true);

    try {
      // 1. Get presigned URL
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: id,
          questionIndex: interview.currentQuestionIndex,
          contentType: 'video/webm',
        }),
      });
      const { uploadUrl, mediaKey } = await presignRes.json();

      // 2. Upload to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: recordedBlob,
        headers: { 'Content-Type': 'video/webm' },
      });

      // 3. Submit answer
      await fetch(`/api/take/${id}/answer?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionIndex: interview.currentQuestionIndex,
          mediaKey,
        }),
      });

      // 4. Load next question
      setRecordedBlob(null);
      setReRecordUsed(false);
      await loadInterview();
      if (interview.currentQuestionIndex + 1 < interview.totalQuestions) {
        setStage('interview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Error state
  if (error) {
    return (
      <div className="take-container">
        <div className="card error-card">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Loading
  if (stage === 'loading' || !interview) {
    return <div className="take-container"><p>Loading interview...</p></div>;
  }

  // Complete
  if (stage === 'complete') {
    return (
      <div className="take-container">
        <div className="card">
          <h2>Thank you, {interview.candidateName}!</h2>
          <p>Your interview for <strong>{interview.position}</strong> has been submitted.</p>
          <p>Results are being processed. You may receive feedback via email.</p>
        </div>
      </div>
    );
  }

  // Consent
  if (stage === 'consent') {
    return (
      <div className="take-container">
        <div className="card consent-card">
          <h2>Interview for {interview.position}</h2>
          <p>Welcome, {interview.candidateName}!</p>
          <p>This interview has <strong>{interview.totalQuestions} questions</strong>, up to 4 minutes each.</p>

          <h3>Before we start</h3>
          <p>To ensure fairness, we collect the following data during the interview:</p>
          <ul>
            <li>Video and audio from your camera and microphone</li>
            <li>Browser activity (tab switches, keyboard, mouse)</li>
            <li>Session metadata (answer timing, browser info)</li>
          </ul>
          <p>Data is used only for interview evaluation and stored for 90 days.</p>

          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I agree to the data collection terms
          </label>

          <button
            className="btn btn-primary"
            disabled={!consent}
            onClick={handleStartInterview}
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // Interview / Recording / Review
  return (
    <div className="take-container">
      <div className="interview-header">
        <span>Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}</span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((interview.currentQuestionIndex + 1) / interview.totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="card question-card">
        <h3>{interview.currentQuestion}</h3>

        <div className="video-container">
          <video ref={videoRef} autoPlay muted playsInline className="video-preview" />
          {stage === 'recording' && (
            <div className="timer">
              <span className="rec-dot">●</span> {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {stage === 'interview' && (
          <button className="btn btn-primary" onClick={startRecording}>
            Start Recording
          </button>
        )}

        {stage === 'recording' && (
          <button className="btn btn-danger" onClick={stopRecording} disabled={!recording}>
            Stop Recording
          </button>
        )}

        {stage === 'review' && (
          <div className="review-actions">
            {!reRecordUsed && (
              <button className="btn btn-secondary" onClick={handleReRecord}>
                Re-record
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSubmitAnswer} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Submit & Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

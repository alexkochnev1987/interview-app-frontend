import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react';

import type { PermissionStatus } from '@/components/take/types';
import type { TakeStage } from '@/components/take/types';
import { TAKE_MESSAGES } from './messages';

type ScreenTrackSettings = MediaTrackSettings & { displaySurface?: string };

type InterviewDisplayMediaOptions = DisplayMediaStreamOptions & {
  monitorTypeSurfaces?: 'include' | 'exclude';
  selfBrowserSurface?: 'include' | 'exclude';
  surfaceSwitching?: 'include' | 'exclude';
  systemAudio?: 'include' | 'exclude';
};

const INTERVIEW_DISPLAY_MEDIA_OPTIONS: InterviewDisplayMediaOptions = {
  video: true,
  audio: true,
  monitorTypeSurfaces: 'include',
  selfBrowserSurface: 'exclude',
  surfaceSwitching: 'include',
  systemAudio: 'include',
};

function readDisplaySurface(screenTrack: MediaStreamTrack): string {
  return (screenTrack.getSettings() as ScreenTrackSettings).displaySurface ?? 'unknown';
}

function isAcceptedInterviewDisplaySurface(displaySurface: string): boolean {
  return displaySurface === 'monitor';
}

function logInterviewDisplaySurfaceRejected(context: string, displaySurface: string) {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[take:screen] Rejected capture: expected displaySurface "monitor".', {
      context,
      displaySurface,
    });
  }
}

interface UseTakePermissionsParams {
  setSetupBusy: (value: boolean) => void;
  setSetupError: (value: string) => void;
  setCameraStatus: (value: PermissionStatus) => void;
  setScreenStatus: (value: PermissionStatus) => void;
  setScreenSurface: (value: string) => void;
  setStage: Dispatch<SetStateAction<TakeStage>>;
  clearRecordingArtifacts: () => void;
  releaseCaptureStreams: () => void;
  releaseLobbyCameraOnly: () => void;
  attachCameraPreview: (stream: MediaStream) => void;
  stopMediaStream: (stream: MediaStream | null) => void;
  getPermissionErrorMessage: (error: unknown, requiresEntireScreen?: boolean) => string;
  screenStreamRef: MutableRefObject<MediaStream | null>;
  cameraStreamRef: MutableRefObject<MediaStream | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
}

export function useTakePermissions({
  setSetupBusy,
  setSetupError,
  setCameraStatus,
  setScreenStatus,
  setScreenSurface,
  setStage,
  clearRecordingArtifacts,
  releaseCaptureStreams,
  releaseLobbyCameraOnly,
  attachCameraPreview,
  stopMediaStream,
  getPermissionErrorMessage,
  screenStreamRef,
  cameraStreamRef,
  screenVideoRef,
}: UseTakePermissionsParams) {
  async function restartFullInterviewCapture() {
    if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.getDisplayMedia) {
      setSetupError(TAKE_MESSAGES.browserUnsupported);
      return;
    }

    let cameraGranted = false;

    try {
      setSetupBusy(true);
      setSetupError('');
      setCameraStatus('pending');
      setScreenStatus('idle');
      setScreenSurface('');
      clearRecordingArtifacts();
      releaseCaptureStreams();

      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 854, height: 480 },
        audio: true,
      });
      attachCameraPreview(cameraStream);
      cameraGranted = true;
      setCameraStatus('granted');
      setScreenStatus('pending');

      const screenStream = await navigator.mediaDevices.getDisplayMedia(INTERVIEW_DISPLAY_MEDIA_OPTIONS);

      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) {
        stopMediaStream(screenStream);
        throw new Error('Screen sharing did not provide a video track.');
      }

      const displaySurface = readDisplaySurface(screenTrack);
      if (!isAcceptedInterviewDisplaySurface(displaySurface)) {
        logInterviewDisplaySurfaceRejected('restartFullInterviewCapture', displaySurface);
        setScreenStatus('denied');
        setScreenSurface(displaySurface);
        stopMediaStream(screenStream);
        releaseCaptureStreams();
        setSetupError(getPermissionErrorMessage(new Error('wrong-surface'), true));
        return;
      }

      screenStreamRef.current = screenStream;
      setScreenSurface(displaySurface);
      setScreenStatus('granted');
      setStage('interview');
    } catch (err) {
      setCameraStatus(cameraGranted ? 'granted' : 'denied');
      setScreenStatus('denied');
      setScreenSurface('');
      releaseCaptureStreams();
      setSetupError(getPermissionErrorMessage(err));
    } finally {
      setSetupBusy(false);
    }
  }

  async function prepareLobbyDevices() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setSetupError(TAKE_MESSAGES.browserUnsupported);
      return;
    }

    try {
      setSetupBusy(true);
      setSetupError('');
      setCameraStatus('pending');

      releaseLobbyCameraOnly();
      clearRecordingArtifacts();

      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 854, height: 480 },
        audio: true,
      });

      attachCameraPreview(cameraStream);
      setCameraStatus('granted');
    } catch (err) {
      setCameraStatus('denied');
      setSetupError(getPermissionErrorMessage(err));
    } finally {
      setSetupBusy(false);
    }
  }

  async function attachLobbyScreenShare() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setSetupError(TAKE_MESSAGES.browserUnsupported);
      return;
    }

    const liveTracks =
      cameraStreamRef.current?.getTracks().filter((t) => t.readyState === 'live') ?? [];
    if (liveTracks.length === 0) {
      setSetupError(TAKE_MESSAGES.lobbyEnableCameraMicFirst);
      return;
    }

    if (screenStreamRef.current) {
      stopMediaStream(screenStreamRef.current);
      screenStreamRef.current = null;
      setScreenStatus('idle');
      setScreenSurface('');
    }

    try {
      setSetupBusy(true);
      setSetupError('');
      setScreenStatus('pending');

      const screenStream = await navigator.mediaDevices.getDisplayMedia(INTERVIEW_DISPLAY_MEDIA_OPTIONS);

      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) {
        stopMediaStream(screenStream);
        throw new Error('Screen sharing did not provide a video track.');
      }

      const displaySurface = readDisplaySurface(screenTrack);
      if (!isAcceptedInterviewDisplaySurface(displaySurface)) {
        logInterviewDisplaySurfaceRejected('attachLobbyScreenShare', displaySurface);
        setScreenStatus('denied');
        setScreenSurface(displaySurface);
        stopMediaStream(screenStream);
        setSetupError(getPermissionErrorMessage(new Error('wrong-surface'), true));
        return;
      }

      screenStreamRef.current = screenStream;
      setScreenSurface(displaySurface);
      setScreenStatus('granted');
    } catch (err) {
      setScreenStatus('denied');
      setScreenSurface('');
      setSetupError(getPermissionErrorMessage(err, true));
    } finally {
      setSetupBusy(false);
    }
  }

  function enterInterviewFromLobby(): boolean {
    const cam = cameraStreamRef.current;
    if (!cam?.getTracks().some((t) => t.readyState === 'live')) {
      setSetupError(TAKE_MESSAGES.lobbyInterviewStartBlocked);
      return false;
    }
    const screen = screenStreamRef.current;
    const screenTrack = screen?.getVideoTracks()[0];
    if (!screen?.active || !screenTrack || screenTrack.readyState !== 'live') {
      setSetupError(TAKE_MESSAGES.lobbyInterviewStartBlocked);
      return false;
    }
    const displaySurface = readDisplaySurface(screenTrack);
    if (!isAcceptedInterviewDisplaySurface(displaySurface)) {
      logInterviewDisplaySurfaceRejected('enterInterviewFromLobby', displaySurface);
      setSetupError(getPermissionErrorMessage(new Error('wrong-surface'), true));
      return false;
    }
    setSetupError('');
    setStage('interview');
    return true;
  }

  return {
    restartFullInterviewCapture,
    prepareLobbyDevices,
    attachLobbyScreenShare,
    enterInterviewFromLobby,
  };
}

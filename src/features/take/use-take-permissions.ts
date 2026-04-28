import type { MutableRefObject } from 'react';
import type { PermissionStatus } from '@/components/take/types';

type ScreenTrackSettings = MediaTrackSettings & { displaySurface?: string };
type InterviewDisplayMediaOptions = DisplayMediaStreamOptions & {
  monitorTypeSurfaces?: 'include' | 'exclude';
  selfBrowserSurface?: 'include' | 'exclude';
  surfaceSwitching?: 'include' | 'exclude';
  systemAudio?: 'include' | 'exclude';
};

interface UseTakePermissionsParams {
  setSetupBusy: (value: boolean) => void;
  setSetupError: (value: string) => void;
  setCameraStatus: (value: PermissionStatus) => void;
  setScreenStatus: (value: PermissionStatus) => void;
  setScreenSurface: (value: string) => void;
  setStage: (value: 'interview') => void;
  clearRecordingArtifacts: () => void;
  releaseCaptureStreams: () => void;
  attachCameraPreview: (stream: MediaStream) => void;
  stopMediaStream: (stream: MediaStream | null) => void;
  resetInterviewSetup: (message: string) => void;
  getPermissionErrorMessage: (error: unknown, requiresEntireScreen?: boolean) => string;
  screenStreamRef: MutableRefObject<MediaStream | null>;
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
  attachCameraPreview,
  stopMediaStream,
  resetInterviewSetup,
  getPermissionErrorMessage,
  screenStreamRef,
}: UseTakePermissionsParams) {
  async function handleStartInterview() {
    if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.getDisplayMedia) {
      setSetupError('This browser must support camera, microphone, and full-screen sharing.');
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

      const displayMediaOptions: InterviewDisplayMediaOptions = {
        video: true,
        audio: true,
        monitorTypeSurfaces: 'include',
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'include',
        systemAudio: 'include',
      };

      const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) {
        stopMediaStream(screenStream);
        throw new Error('Screen sharing did not provide a video track.');
      }

      const displaySurface = (screenTrack.getSettings() as ScreenTrackSettings).displaySurface ?? 'unknown';
      if (displaySurface !== 'monitor') {
        setScreenStatus('denied');
        setScreenSurface(displaySurface);
        stopMediaStream(screenStream);
        releaseCaptureStreams();
        setSetupError(getPermissionErrorMessage(new Error('wrong-surface'), true));
        return;
      }

      screenTrack.onended = () => {
        resetInterviewSetup('Screen sharing stopped. Start the setup again to continue the interview.');
      };

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

  return { handleStartInterview };
}

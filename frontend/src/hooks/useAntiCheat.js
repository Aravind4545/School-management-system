import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

export function useAntiCheat(attemptId, examType = 'quiz', onAutoSubmit) {
  const [violations, setViolations] = useState(0);
  const [warning, setWarning] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreen(true);
    } catch {
      setWarning('Please enable fullscreen to continue the exam.');
    }
  }, []);

  const reportViolation = useCallback(async () => {
    const endpoint = examType === 'mock' ? `/mock/${attemptId}/violation` : `/quiz/${attemptId}/violation`;
    try {
      const { data } = await api.post(endpoint, { timeSpentSec: 0 });
      setViolations(data.violations);
      if (data.autoSubmitted && onAutoSubmit) {
        onAutoSubmit(data.result);
      } else {
        setWarning(`Tab/window switch detected (${data.violations}/3). Further violations will auto-submit.`);
        setTimeout(() => setWarning(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  }, [attemptId, examType, onAutoSubmit]);

  useEffect(() => {
    if (!attemptId) return;

    const handleVisibility = () => {
      if (document.hidden) reportViolation();
    };
    const handleBlur = () => reportViolation();
    const handleContext = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreen) {
        setWarning('Fullscreen exited. Return to fullscreen or risk violation.');
        reportViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);
    document.addEventListener('paste', handleCopy);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
      document.removeEventListener('paste', handleCopy);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [attemptId, fullscreen, reportViolation]);

  return { violations, warning, fullscreen, enterFullscreen, setWarning };
}

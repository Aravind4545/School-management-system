import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(initialSeconds, onExpire, active = true) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (active) setSeconds(initialSeconds);
  }, [initialSeconds, active]);

  useEffect(() => {
    if (!active) return;
    if (seconds <= 0) {
      onExpireRef.current?.();
      return;
    }
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds, active]);

  const format = useCallback(() => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [seconds]);

  return { seconds, formatted: format(), setSeconds };
}

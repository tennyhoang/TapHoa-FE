import { useEffect, useRef, useState } from 'react';

export interface CountdownResult {
  hours: string;
  minutes: string;
  seconds: string;
  isExpired: boolean;
}

export function useFlashSaleCountdown(
  endTimeIso: string | undefined,
  onExpire: () => void,
): CountdownResult {
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const onExpireRef = useRef(onExpire);

  // Update the ref after each render instead of during render
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!endTimeIso) return;

    const endMs = new Date(endTimeIso).getTime();

    const tick = () => {
      const remaining = endMs - Date.now();
      if (remaining <= 0) {
        setRemainingMs(0);
        onExpireRef.current();
        return;
      }
      setRemainingMs(remaining);
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [endTimeIso]);

  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));

  return {
    hours:     String(Math.floor(totalSeconds / 3600)).padStart(2, '0'),
    minutes:   String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
    seconds:   String(totalSeconds % 60).padStart(2, '0'),
    isExpired: !endTimeIso || remainingMs <= 0,
  };
}

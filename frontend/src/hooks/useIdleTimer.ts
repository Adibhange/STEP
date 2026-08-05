'use client';

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

const IDLE_DETECTION_DELAY_MS = 30 * 1000; // 30 seconds idle threshold
const COUNTDOWN_DURATION_SEC = 15 * 60; // 15 minutes = 900 seconds

interface IdleTimerContextType {
  isIdle: boolean;
  remainingSeconds: number;
  formattedTime: string;
  resetTimer: () => void;
}

export const IdleTimerContext = createContext<IdleTimerContextType>({
  isIdle: false,
  remainingSeconds: COUNTDOWN_DURATION_SEC,
  formattedTime: '15:00',
  resetTimer: () => {},
});

export const useIdleTimerContext = () => useContext(IdleTimerContext);

interface UseIdleTimerOptions {
  enabled?: boolean;
}

export function useIdleTimer({ enabled = true }: UseIdleTimerOptions = {}) {
  const router = useRouter();

  // State
  const [isIdle, setIsIdle] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(COUNTDOWN_DURATION_SEC);

  // Refs to avoid stale closures
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isIdleRef = useRef(false);

  // Reset countdown and idle status
  const resetTimer = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      setRemainingSeconds(COUNTDOWN_DURATION_SEC);
    } else {
      setRemainingSeconds(COUNTDOWN_DURATION_SEC);
    }

    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    if (enabled) {
      idleTimeoutRef.current = setTimeout(() => {
        isIdleRef.current = true;
        setIsIdle(true);

        // Start 15-minute countdown interval
        countdownIntervalRef.current = setInterval(() => {
          setRemainingSeconds((prev) => {
            if (prev <= 1) {
              // Time's up! Logout user
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              if (typeof window !== 'undefined') {
                localStorage.removeItem('step_token');
                localStorage.removeItem('step_refresh_token');
              }
              setIsIdle(false);
              router.push('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, IDLE_DETECTION_DELAY_MS);
    }
  }, [enabled, router]);

  // Global activity event listeners
  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [enabled, resetTimer]);

  // Format seconds into MM:SS string
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isIdle,
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    resetTimer,
  };
}

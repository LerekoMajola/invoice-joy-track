import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';

interface TimerContextValue {
  isRunning: boolean;
  timerCaseId: string;
  elapsed: number;
  startTimer: (caseId: string) => void;
  stopTimer: () => { caseId: string; hours: number } | null;
  formatElapsed: () => string;
}

const TimerContext = createContext<TimerContextValue | null>(null);

const LS_START = 'legal_timer_start';
const LS_CASE = 'legal_timer_case_id';

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timerStart, setTimerStart] = useState<number | null>(() => {
    const stored = localStorage.getItem(LS_START);
    return stored ? Number(stored) : null;
  });
  const [timerCaseId, setTimerCaseId] = useState<string>(() => {
    return localStorage.getItem(LS_CASE) || '';
  });
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isRunning = timerStart !== null;

  useEffect(() => {
    if (timerStart) {
      setElapsed(Math.floor((Date.now() - timerStart) / 1000));
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - timerStart) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStart]);

  const startTimer = useCallback((caseId: string) => {
    const now = Date.now();
    setTimerStart(now);
    setTimerCaseId(caseId);
    localStorage.setItem(LS_START, String(now));
    localStorage.setItem(LS_CASE, caseId);
  }, []);

  const stopTimer = useCallback(() => {
    if (!timerStart) return null;
    const hours = (Date.now() - timerStart) / 3600000;
    const caseId = timerCaseId;
    setTimerStart(null);
    setTimerCaseId('');
    localStorage.removeItem(LS_START);
    localStorage.removeItem(LS_CASE);
    return { caseId, hours };
  }, [timerStart, timerCaseId]);

  const formatElapsed = useCallback(() => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [elapsed]);

  return (
    <TimerContext.Provider value={{ isRunning, timerCaseId, elapsed, startTimer, stopTimer, formatElapsed }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}

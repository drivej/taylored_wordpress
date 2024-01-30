import { useEffect, useState } from 'react';

export const useStopWatch = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [offsetSeconds, setOffsetSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    const onTick = () => {
      setElapsedSeconds(offsetSeconds + (Date.now() - startTime) / 1000);
    };
    onTick();

    if (isRunning) {
      const timer = setInterval(onTick, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [startTime, isRunning]);

  const start = (t = Date.now()) => {
    setStartTime(t);
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    setIsRunning(true);
  };

  const reset = () => {
    setStartTime(Date.now());
  };

  return {
    isRunning,
    setStartTime,
    elapsedSeconds,
    pause,
    resume,
    start,
    reset
  };
};

import * as React from 'react';
import { Context, useContext, useEffect, useState } from 'react';
import { JobManager } from './JobManager';
import { JobRunner } from './JobRunner';
import { IJobContext, JobEventType, JobStatus } from './JobTypes';

export const JobContext = React.createContext<IJobContext>(null);

export function JobProvider<Input = unknown, Output = Input>({ children, manager }: { children: React.ReactNode; manager: JobManager<Input, Output> }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stageProgress, setStageProgress] = useState(0);
  const [status, setStatus] = useState<JobStatus>(JobStatus.NONE);
  const [stageIndex, setStageIndex] = useState(-1);
  const [currentStage, setCurrentStage] = useState<JobRunner>(null);
  const [output, setOutput] = useState<Output>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const start = (input: Input) => {
    setIsRunning(true);
    manager.start(input);
    setCurrentStage(manager.currentStage);
  };

  const reset = () => {
    setIsComplete(false);
    manager.reset();
  };

  const onStageComplete = (e) => {
    setCurrentStage(e.ref.currentStage);
  };

  const onProgress = (e: { type: JobEventType; ref: JobManager<Input, Output> }) => {
    setProgress(e.ref.progress);
    setStageProgress(e.ref.currentStage.progress);
    setStageIndex(e.ref.stageIndex);
  };

  const onStatus = (e: { type: JobEventType; ref: JobManager<Input, Output> }) => {
    setStatus(e.ref.status);
  };

  const onCompleted = (e: { type: JobEventType; ref: JobManager<Input, Output> }) => {
    console.log('onCompleted');
    setOutput(e.ref.output);
    setIsComplete(true);
    setIsRunning(false);
  };

  const onLog = (e: { type: JobEventType; ref: JobManager<Input, Output>; message: string }) => {
    setLogs(e.ref.logs);
  };

  useEffect(() => {
    manager.on(JobEventType.PROGRESS, onProgress);
    manager.on(JobEventType.STAGE_COMPLETED, onStageComplete);
    manager.on(JobEventType.STATUS, onStatus);
    manager.on(JobEventType.COMPLETED, onCompleted);
    manager.on(JobEventType.LOG, onLog);
    return () => {
      manager.off(JobEventType.PROGRESS, onProgress);
      manager.off(JobEventType.STAGE_COMPLETED, onStageComplete);
      manager.off(JobEventType.STATUS, onCompleted);
      manager.off(JobEventType.COMPLETED, onCompleted);
      manager.off(JobEventType.LOG, onLog);
    };
  }, []);

  return (
    <JobContext.Provider
      value={{
        start, //
        reset,
        progress,
        stageProgress,
        status,
        currentStage,
        manager,
        stageIndex,
        isRunning,
        isComplete,
        output,
        logs
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJob<I, O = I>() {
  return useContext<IJobContext<I, O>>(JobContext as Context<IJobContext<I, O>>);
}

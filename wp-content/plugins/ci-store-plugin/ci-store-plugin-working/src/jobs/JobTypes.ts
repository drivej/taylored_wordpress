import { JobManager } from './JobManager';
import { JobRunner } from './JobRunner';

export enum JobEventType {
  LOG = 'log',
  STATUS = 'status',
  PROGRESS = 'progress',
  COMPLETED = 'completed',
  PAUSE = 'pause',
  RESUME = 'resume',
  STAGE_COMPLETED = 'stagecompleted'
}

export enum JobStatus {
  NONE,
  RUNNING,
  PAUSED,
  COMPLETED,
  ERROR
}

export interface IJobContext<Input = unknown, Output = unknown> {
  progress: number;
  stageProgress: number;
  status: JobStatus;
  currentStage: JobRunner;
  manager: JobManager;
  start(input?: Partial<Input>): void;
  reset(): void;
  stageIndex: number;
  isComplete: boolean;
  isRunning: boolean;
  output: Output;
  logs: string[];
}

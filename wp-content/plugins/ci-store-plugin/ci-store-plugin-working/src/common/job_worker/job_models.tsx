export interface IJobWorker {
  key: string;
  started: string;
  stopped: string;
  completed: string;
  result: unknown;
  progress: number;
  is_running: boolean;
  is_complete: boolean;
  is_stopping: boolean;
  is_stalled: boolean;
}

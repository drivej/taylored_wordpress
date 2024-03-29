export interface IJobWorker<R = unknown> {
  key: string;
  started: string;
  stopped: string;
  completed: string;
  last_completed: string;
  result: R;
  progress: number;
  is_running: boolean;
  is_complete: boolean;
  is_stopping: boolean;
  is_stalled: boolean;
}

export interface IJobInfo {
  key: string;
  data_url: string;
  log_url: string;
}

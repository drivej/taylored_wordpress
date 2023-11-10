import { formatDuration } from '../utils/formatDuration';
import { EventEmitter } from './EventEmitter';
import { JobManager } from './JobManager';
import { JobEventType } from './JobTypes';

export class JobRunner<Input = unknown, Output = Input> extends EventEmitter<JobEventType, JobRunner> {
  name = 'JobRunner';
  key: string | number = -1;
  paused = false;
  running = false;
  progress = 0;
  completed = false;
  input: Input = null;
  output: Output = null;
  times: number[] = [];
  elapsedTime = 0;
  manager: JobManager = null;

  constructor(config: Partial<JobRunner> = {}) {
    super();
    Object.assign(this, config);
  }

  onProgress(progress: number) {
    progress = Math.max(0, Math.min(1, progress));
    this.progress = progress;
    this.elapsedTime = this.getElapsedTime();
    this.emit(JobEventType.PROGRESS);
  }

  getElapsedTime() {
    if (this.times.length > 0) {
      const t = this.times.length % 2 === 0 ? [...this.times] : [...this.times, Date.now()];
      let elapsedTime = 0;
      for (let i = 0; i < t.length; i += 2) {
        elapsedTime += t[i + 1] - t[i];
      }
      return elapsedTime;
    }
    return 0;
  }

  onComplete(output: Output = null) {
    if (this.completed === true) {
      this.log('complete called multiple times');
      return;
    }
    this.completed = true;
    this.log(`onComplete()`);
    this.output = output;
    this.running = false;
    this.paused = false;
    this.progress = 1;
    this.times.push(Date.now());
    this.elapsedTime = this.getElapsedTime();
    this.log(`Completed in ${formatDuration(this.elapsedTime / 1000)}`);
    this.emit(JobEventType.PROGRESS);
    this.emit(JobEventType.COMPLETED);
  }

  async run(input?: Input) {
    if (this.running) return;
    this.log(`run()`);
    this.progress = 0;
    this.paused = false;
    this.running = true;
    this.input = input;
    this.times = [Date.now()];
    return this.doRun();
  }

  async doRun() {}

  pause() {
    this.paused = true;
    this.emit(JobEventType.PAUSE);
    this.times.push(Date.now());
  }

  onResume() {
    this.times.push(Date.now());
  }

  log(message: string) {
    // console.log(message);
    this.emit(JobEventType.LOG, { message });
  }

  reset() {
    if (this.running) {
      this.paused = true;
    }

    this.completed = false;
    this.progress = 0;
    this.times = [];
    this.elapsedTime = 0;
    this.emit(JobEventType.PROGRESS);
    this.emit(JobEventType.LOG, { message: 'reset' });
  }

  resume() {
    this.paused = false;
    this.emit(JobEventType.RESUME);
    this.onResume();
  }
}

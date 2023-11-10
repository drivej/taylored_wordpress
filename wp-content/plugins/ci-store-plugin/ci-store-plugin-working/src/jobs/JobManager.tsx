import { EventEmitter } from './EventEmitter';
import { JobRunner } from './JobRunner';
import { JobEventType, JobStatus } from './JobTypes';

export class JobManager<Input = unknown, Output = Input> extends EventEmitter<JobEventType, JobManager> {
  name = 'Job Manager';
  description = '';
  stages: JobRunner[] = [];
  stageIndex = -1;
  status: JobStatus = JobStatus.NONE;
  progress = 0;
  input: Input = null;
  output: Output = null;
  startTime = 0;
  endTime = 0;
  elapsedTime = 0;
  logs = [];

  constructor(config: { stages: JobRunner[]; name?: string; description?:string }) {
    super();
    this.stages = config.stages;
    this.description = config?.description ?? '';
    if (config?.name) this.name = config.name;
    this.stages.forEach((stage) => {
      stage.manager = this;
      stage.on(JobEventType.PAUSE, (e) => this.onStagePause.bind(this));
      stage.on(JobEventType.PROGRESS, this.onStageProgress.bind(this));
      stage.on(JobEventType.RESUME, this.onStageResume.bind(this));
      stage.on(JobEventType.COMPLETED, this.onStageComplete.bind(this));
      stage.on(JobEventType.LOG, this.onStageLog.bind(this));
    });
  }

  get currentStage() {
    return this.stages?.[this.stageIndex] ?? null;
  }

  getRunner(key: string) {
    return this.stages.find((s) => s.key === key);
  }

  onStageLog(e: { type: JobEventType; ref: JobRunner; payload: { message: string } }) {
    this.logs.push(`${e.ref.name}: ${e.payload.message}`);
    this.emit(JobEventType.LOG);
  }

  onStageProgress(e: { type: JobEventType; ref: JobRunner }) {
    this.progress = this.stages.reduce((p, s) => p + s.progress, 0) / this.stages.length;
    this.emit(JobEventType.PROGRESS);
  }

  onStagePause() {
    this.setStatus(JobStatus.PAUSED);
  }

  onStageResume() {
    this.setStatus(JobStatus.RUNNING);
  }

  onStageComplete(e: { ref: JobRunner }) {
    if (this.stageIndex < this.stages.length - 1) {
      this.stageIndex++;
      this.output = e.ref.output as Output;
      this.stages[this.stageIndex].run(e.ref.output);
      this.emit(JobEventType.STAGE_COMPLETED);
    } else {
      this.endTime = Date.now();
      this.elapsedTime = this.endTime - this.startTime;
      this.output = e.ref.output as Output;
      this.emit(JobEventType.STAGE_COMPLETED);
      this.emit(JobEventType.COMPLETED);
    }
  }

  setStatus(s: JobStatus) {
    this.status = s;
    this.emit(JobEventType.STATUS);
  }

  start(input?: Input) {
    if (this.status === JobStatus.NONE) {
      this.input = input;
      this.startTime = Date.now();
      this.setStatus(JobStatus.RUNNING);
      this.stageIndex = 0;
      this.stages[0].run(input);
    }
  }

  pause() {
    if (this.status === JobStatus.RUNNING && this.stageIndex > -1) {
      this.setStatus(JobStatus.PAUSED);
      this.stages[this.stageIndex].pause();
      this.emit(JobEventType.PAUSE);
    }
  }

  resume() {
    if (this.status === JobStatus.PAUSED && this.stageIndex > -1) {
      this.setStatus(JobStatus.RUNNING);
      this.stages[this.stageIndex].resume();
      this.emit(JobEventType.RESUME);
    }
  }

  reset() {
    this.setStatus(JobStatus.NONE);
    this.stages.forEach((stage) => stage.reset());
    this.emit(JobEventType.PROGRESS);
    this.emit(JobEventType.STATUS);
  }
}

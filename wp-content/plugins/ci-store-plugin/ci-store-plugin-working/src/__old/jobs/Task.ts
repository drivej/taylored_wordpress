// interface ITask {
//     onProgress(progress:number):void
//     onLog(message:string):void
// }

import { EventEmitter } from "./EventEmitter";

export enum TaskEventType {
    LOG = 'log',
    STATUS = 'status',
    PROGRESS = 'progress',
    COMPLETED = 'completed',
    PAUSE = 'pause',
    RESUME = 'resume',
    STAGE_COMPLETED = 'stagecompleted'
  }

export class Task<Input = unknown, Output = unknown, Resume = unknown> extends EventEmitter<TaskEventType, Task> {
  parent: Task = null;
  tasks: Task[] = [];
  taskIndex = -1;
  config: Partial<Task>;
  progress = 0;
  input:Input = null;
  output:Output = null;

  constructor(config: Partial<Task>) {
    super();
    Object.assign(this, config);
  }

  action(config:{onProgress(progress:number):void; resumeInfo:Resume}) {
    // this.config.onProgress(p);
  }

  addTask(task: Task) {}

  play() {

  }

  pause() {}

  stop() {}

  resume() {}

  complete(){}
}

new Task({action:(config) => {
    config.onProgress(0);
}});

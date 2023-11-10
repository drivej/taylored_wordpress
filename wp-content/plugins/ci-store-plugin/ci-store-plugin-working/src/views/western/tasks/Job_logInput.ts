import { JobRunner } from '../../../jobs/JobRunner';

export class Job_logInput extends JobRunner {
  name = 'Job_logInput';

  async doRun() {
    console.log({ input: this.input });
    this.onComplete(this.input);
  }
}

import * as React from 'react';
import { Context, useContext } from 'react';
import { formatDuration } from '../utils/formatDuration';
import { JobContext } from './JobProvider';
import { IJobContext, JobStatus } from './JobTypes';

export function JobTitle() {
  const job = useContext(JobContext);
  return (
    <div>
      <h3 className='mb-1'>{job.manager.name}</h3>
      {job.manager.description ? <p className='m-0'>{job.manager.description}</p> : null}
    </div>
  );
}

export function JobUI<I, O = I>({ input }: { input?: I }) {
  const job = useContext<IJobContext<I, O>>(JobContext as Context<IJobContext<I, O>>);
  const startLogIndex = Math.max(0, job.logs.length - 20);

  return (
    <div className='d-flex flex-column gap-3'>
      {/* <div>
        <h3 className='mb-1'>{job.manager.name}</h3>
        {job.manager.description ? <p className='m-0'>{job.manager.description}</p> : null}
      </div> */}
      <section>
        <div className='d-flex gap-2'>
          {job.status === JobStatus.NONE ? (
            <button className='btn btn-secondary' onClick={() => job.start(input)}>
              start
            </button>
          ) : null}
          {job.isRunning && !job.isComplete && job.status !== JobStatus.PAUSED ? (
            <button className='btn btn-secondary' onClick={() => job.manager.pause()}>
              pause
            </button>
          ) : null}
          {job.status === JobStatus.PAUSED ? (
            <button className='btn btn-secondary' onClick={() => job.manager.resume()}>
              resume
            </button>
          ) : null}
          {job.status !== JobStatus.NONE ? (
            <button className='btn btn-secondary' onClick={() => job.reset()}>
              reset
            </button>
          ) : null}
        </div>
      </section>

      {job.stageIndex > -1 && (job.isRunning || job.isComplete) ? (
        <div style={{ position: 'relative', height: 30, borderRadius: 3, overflow: 'hidden', background: '#babade', color: '#000' }}>
          <div style={{ transition: 'width 1s', position: 'absolute', left: 0, top: 0, bottom: 0, width: `${job.progress * 100}%`, background: 'rgba(255,255,255,0.3)' }}></div>
          <div style={{ position: 'absolute', inset: 3 }}>
            <div style={{ transition: 'width 1s', position: 'absolute', left: 0, top: 0, bottom: 0, width: `${job.stageProgress * 100}%`, background: 'rgba(255,255,255,0.3)' }}></div>
          </div>
          <div style={{ paddingLeft: 10, position: 'absolute', inset: 0, lineHeight: 'inherit', display: 'flex', alignItems: 'center', textOverflow: 'ellipsis' }}>
            {job.isComplete ? (
              <>Completed in {formatDuration(job.manager.elapsedTime / 1000)}</>
            ) : (
              <>
                {job.stageIndex + 1}/{job.manager.stages.length} {job.currentStage?.name} {formatDuration((job.currentStage?.elapsedTime ?? 0) / 1000)}
              </>
            )}
          </div>
        </div>
      ) : null}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'min-content auto', columnGap: 15, rowGap: 1, width: '100%', fontFamily: 'monospace' }}>
          {job.logs.slice(-10).map((s, i) => (
            <React.Fragment key={`log${i}`}>
              <div>{startLogIndex + i}</div>
              <div>{s}</div>
            </React.Fragment>
          ))}
        </div>
        {/* <ol start={Math.max(0, job.logs.length - 20)}>
          {job.logs.slice(-10).map((s, i) => (
            <li className='m-0' key={`log${i}`} style={{ fontFamily: 'monospace' }}>
              {s}
            </li>
          ))}
        </ol> */}
      </div>
    </div>
  );
}

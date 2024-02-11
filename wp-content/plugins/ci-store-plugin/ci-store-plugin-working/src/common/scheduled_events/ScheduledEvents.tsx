import { UseQueryResult } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { IScheduledEvent, useScheduledEvents } from '../hooks/useScheduledEvents';

export const ScheduledEvents = () => {
  const [eventNameInput, setEventNameInput] = useState('');
  const [eventName, setEventName] = useState('');
  const [hookName, setHookName] = useState('');
  const [hookArgs, setHookArgs] = useState<string[]>(['']);
  const events = useScheduledEvents(eventName);
  const [newHook, setNewHook] = useState<IScheduledEvent & { delay: number }>({ args: [''], hash: '', name: '', timestamp: '', schedule: true, delay: 10 });

  const onChangeArg: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const index = parseInt(e.currentTarget.dataset.index);
    const value = e.currentTarget.value;

    setNewHook((evt) => {
      const e = { ...evt };
      e.args[index] = value;
      return e;
    });
  };

  const addArg = () => {
    setNewHook((evt) => {
      const e = { ...evt };
      e.args.push('');
      return e;
    });
  };

  const removeArg = (index) => {
    setNewHook((evt) => {
      const e = { ...evt };
      e.args.splice(index, 1);
      return e;
    });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const filter = f.get('filter') as string;
    setEventName(filter);
  };

  //   const [deletes, setDeletes] = useState(-1);
  //   const [canClean, setCanClean] = useState(false);

  const doClean = async () => {
    const deletes = await events.precleanEvents();
    // setDeletes(deletes.deleted);
    // setCanClean(deletes.deleted > 0);
    if (deletes.deleted > 0) {
      const ok = confirm(`Are you sure you want to delete ${deletes.deleted.toLocaleString()} completed events?`);
      if (ok) {
        const result = await events.cleanEvents();
        alert(`Deleted ${result.deleted.toLocaleString()} completed events.`);
        // setDeletes(result.deleted);
      }
    } else {
      alert(`There's nothing to delete.`);
    }
  };

  return (
    <div className='p-3 d-flex flex-column gap-3'>
      <form onSubmit={handleSubmit}>
        <h3>Scheduled Events</h3>
        <label className='form-label'>Search</label>
        <div className='input-group'>
          <input className='form-control' type='text' name='filter' value={eventNameInput} onChange={(e) => setEventNameInput(e.currentTarget.value)} />
          <button className='btn btn-outline-secondary' type='button' disabled={eventNameInput === ''} onClick={() => setEventName('')}>
            &times;
          </button>
          <button className='btn btn-outline-secondary' type='button' onClick={() => setEventName(eventNameInput)}>
            Search
          </button>
        </div>
      </form>

      {/* <div style={{ maxHeight: 300, overflow: 'auto' }}> */}
      <ScheduledEventsTable filter={eventName} />
      {/* </div> */}

      <div className='d-flex flex-column gap-2 p-3 rounded border'>
        <div>
          <label className='form-label'>Action Name</label>
          <input
            className='form-control'
            type='text'
            value={newHook.name}
            onChange={(e) => {
              const name = e.currentTarget.value;
              setNewHook((v) => ({ ...v, name }));
            }}
          />
        </div>
        <div>
          <label className='form-label'>Action Delay</label>
          <div className='input-group'>
            <input
              className='form-control'
              type='number'
              min={0}
              max={60}
              value={newHook.delay}
              onChange={(e) => {
                const delay = parseInt(e.currentTarget.value);
                setNewHook((v) => ({ ...v, delay }));
              }}
            />
            <span className='input-group-text'>seconds</span>
          </div>
        </div>
        <div>
          <label className='form-label'>Action Arguments</label>
          <div className='d-flex flex-column gap-2'>
            {newHook.args.map((v, i) => {
              return (
                <div className='input-group'>
                  <span className='input-group-text'>{i}</span>
                  <input className='form-control' type='text' data-index={i} value={v} onChange={onChangeArg} />
                  <button className='btn btn-primary btn-sm px-3' onClick={() => removeArg(i)}>
                    -
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <button className='btn btn-primary btn-sm px-3' onClick={addArg}>
            +
          </button>
        </div>
        <div>
          <button className='btn btn-primary btn-sm' onClick={() => setHookArgs((args) => [...args, ''])}>
            Create
          </button>
        </div>
      </div>

      <button className='btn btn-outline-secondary' onClick={doClean}>
        Clean up deleted events
      </button>
      {/* <pre>{JSON.stringify(events.data, null, 2)}</pre> */}
    </div>
  );
};

export const RefetchTimer = ({ query }: { query: UseQueryResult }) => {
  const [isWaiting, setIsWaiting] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(30000);
  const clockedTimes = React.useRef<number[]>([]);
  const progress = 100 * Math.min(1, elapsedTime / totalTime);

  useEffect(() => {
    if (query.isFetching) {
      if (startTime !== 0) {
        clockedTimes.current.push(Date.now() - startTime);
        setTotalTime(clockedTimes.current.reduce((s, n) => s + n) / clockedTimes.current.length);
      }
      setIsWaiting(false);
    } else {
      setIsWaiting(true);
      setStartTime(Date.now());
      setElapsedTime(0);
    }
  }, [query.isFetching]);

  useEffect(() => {
    if (isWaiting) {
      const timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 500);

      return () => {
        clearInterval(timer);
      };
    }
  }, [isWaiting]);

  return (
    <div className='progress rounded-0' role='progressbar' style={{ height: 4 }}>
      <div className={`progress-bar bg-info ${query.fetchStatus === 'idle' ? '' : 'progress-bar-striped progress-bar-animated'}`} style={{ width: progress + '%', transition: 'width 0.5s linear' }}></div>
    </div>
  );
};

export const ScheduledEventsTable = ({ filter = '' }: { filter: string }) => {
  const events = useScheduledEvents(filter);

  return (
    <div className='border'>
      <div>
        <div className='p-2 d-flex justify-content-between align-items-center'>
          <h5 className='m-0'>Scheduled Events</h5>
          <div className='btn-group'>
            {/* <button className='btn btn-primary btn-sm' onClick={events.empty}>
              Empty
            </button> */}
            <button className='btn btn-primary btn-sm' onClick={events.refresh}>
              Refresh
            </button>
          </div>
        </div>
        <RefetchTimer query={events} />
      </div>
      <table className='table table-sm Xtable-bordered w-100' style={{ fontSize: '12px' }}>
        <thead>
          {filter ? (
            <tr>
              <th colSpan={4} className='bg-light'>
                filter: {filter}
              </th>
            </tr>
          ) : null}
        </thead>

        <tbody>
          {events.data?.data?.map((line, i) => (
            <tr>
              <td style={{ width: '1%' }}>{events.data?.data.length - i}</td>
              <td style={{ width: 'auto' }} className='text-nowrap'>
                {line.name}
              </td>
              <td>{JSON.stringify(line.args)}</td>
              <td style={{ width: '1%' }}>
                <div onClick={() => events.unschedule(line)} style={{ cursor: 'pointer' }}>
                  Delete
                </div>
                {/* <button className='btn btn-secondary btn-sm' onClick={() => events.unschedule(line)}>
                &times;
              </button> */}
              </td>
            </tr>
          )) ?? null}
        </tbody>
      </table>
    </div>
  );
};

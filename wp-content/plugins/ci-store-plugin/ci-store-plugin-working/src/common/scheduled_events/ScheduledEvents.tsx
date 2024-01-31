import * as React from 'react';
import { useState } from 'react';
import { IScheduledEvent, useScheduledEvents } from '../job_worker/useScheduledEvents';

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

      <div style={{ maxHeight: 300, overflow: 'auto' }}>
        <ScheduledEventsTable filter={eventName} />
        {/* <table className='table table-sm table-bordered w-100' style={{ fontSize: '12px' }}>
          <tbody>
            {events.data?.data?.map((line, i) => (
              <tr>
                <td style={{ width: '1%' }}>{events.data?.data.length - i}</td>
                <td style={{ width: 'auto' }} className='text-nowrap'>
                  {line.name}
                </td>
                <td>{JSON.stringify(line.args)}</td>
                <td style={{ width: '1%' }}>
                  <button className='btn btn-primary btn-sm' onClick={() => events.unschedule(line)}>
                    &times;
                  </button>
                </td>
              </tr>
            )) ?? null}
          </tbody>
        </table> */}
      </div>

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

      {/* <pre>{JSON.stringify(events.data, null, 2)}</pre> */}
    </div>
  );
};

const ScheduledEventsTable = ({ filter = '' }: { filter: string }) => {
  const events = useScheduledEvents(filter);
  return (
    <table className='table table-sm table-bordered w-100' style={{ fontSize: '12px' }}>
      {filter ? (
        <thead>
          <tr>
            <th colSpan={4}>filter: {filter}</th>
          </tr>
        </thead>
      ) : null}
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
  );
};

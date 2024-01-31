import * as React from 'react';
import { ScheduledEvents } from '../common/scheduled_events/ScheduledEvents';

export const ManageEvents = () => {
  return (
    <div className='p-3'>
      <h3>Manage Events</h3>
      <ScheduledEvents />
    </div>
  );
};

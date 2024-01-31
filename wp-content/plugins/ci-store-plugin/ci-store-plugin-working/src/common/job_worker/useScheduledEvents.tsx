import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { IWordpressAjaxParams } from '../../views/jobs/Jobs';
import { fetchWordpressAjax } from '../utils/fetchWordpressAjax';
import { IQueryOptions } from './useJob';

export interface IScheduledEvent {
  name: string;
  hash: string;
  timestamp: string;
  schedule: boolean | string;
  args: (string | number)[];
}

export interface IScheduledEvents {
  data: IScheduledEvent[];
}

export const useScheduledEvents = (filter: string = '', options: IQueryOptions<IScheduledEvents> = {}) => {
  const queryClient = useQueryClient();

  const data = useQuery({
    queryKey: ['wp_ajax_scheduled_events_api', filter],
    queryFn: () => {
      return fetchWordpressAjax<IScheduledEvents, IWordpressAjaxParams & { filter: string }>({ action: 'scheduled_events_api', filter });
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
    ...options
  });

  const schedule = (event: IScheduledEvent) => {
    fetchWordpressAjax({
      action: 'scheduled_events_api', //
      cmd: 'schedule',
      hook_name: event.name,
      hook_args: JSON.stringify(event.args)
    }).then((res) => {
      alert(JSON.stringify(res));
    });
  };

  const unschedule = (event: IScheduledEvent) => {
    fetchWordpressAjax({
      action: 'scheduled_events_api', //
      cmd: 'unschedule',
      hook_name: event.name,
      hook_hash: event.hash,
      hook_timestamp: event.timestamp,
      hook_args: JSON.stringify(event.args)
    }).then((res) => {
      alert(JSON.stringify(res));
    });
  };

  const unscheduleAll = (hook_name: IScheduledEvent['name']) => {
    fetchWordpressAjax({
      action: 'scheduled_events_api', //
      cmd: 'unschedule',
      hook_name
    }).then((res) => {
      alert(JSON.stringify(res));
    });
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['wp_ajax_scheduled_events_api', filter] });
  };

  return { ...data, refresh, schedule, unschedule, unscheduleAll };
};

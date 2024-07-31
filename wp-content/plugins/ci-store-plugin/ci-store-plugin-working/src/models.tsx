import { UseQueryOptions } from '@tanstack/react-query';

export interface IWordpressAjaxParams {
  action: string;
  cmd?: string;
}

export interface ICronJobParams {
  job_id?: string;
  job_action?: string;
  job_args?: string;
}

export interface IAjaxQuery {
  action: string;
  cmd: string;
  [key: string]: unknown;
}

export type IQueryOptions<T = unknown> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;

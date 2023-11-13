import { useQuery } from '@tanstack/react-query';
import fetch from 'cross-fetch';
import type { WP_Post } from 'wp-types';

export interface CronJobPost extends Pick<WP_Post, 'ID' | 'post_title'> {
  meta: {
    action: string;
    completed: string;
    cadence: string;
    cursor: string;
    started: string;
  };
}

export const useCronJobs = () => {
  const getCronJobs = async () => {
    const res = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: new URLSearchParams({ action: 'ci_action', ci_action: 'select', 'post[post_type]': 'cronjob' }) });
    return res.json();
  };
  return useQuery<{ data: CronJobPost[] }>(['getCronJobs'], getCronJobs);
};

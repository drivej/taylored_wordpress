import { useQuery } from '@tanstack/react-query';
import fetch from 'cross-fetch';
import type { WP_Post } from 'wp-types';

interface CIMeta {
  _sku: string;
  _price: string;
}

export const usePost = (sku: string) => {
  const getPost = async () => {
    const res = await fetch('/wp-admin/admin-ajax.php', { method: 'POST', body: new URLSearchParams({ action: 'ci_wp_action', sku }) });
    return res.json();
  };
  return useQuery<WP_Post & { meta_input: CIMeta }>({ queryKey: ['getPost', sku], queryFn: getPost });
};

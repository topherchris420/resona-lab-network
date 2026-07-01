import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchProjectStats, type ProjectLiveStats } from '@/lib/socialApi';

type StatsHandler = (projectId: string, stats: ProjectLiveStats) => void;

/**
 * Subscribes to live inserts/deletes on resonances and forks and reconciles the
 * affected project's counts from the database. Reading authoritative counts (via
 * fetchProjectStats) means optimistic UI updates are never double-counted.
 */
export const useProjectRealtime = (currentUserId: string | null | undefined, onStats: StatsHandler) => {
  const handlerRef = useRef(onStats);
  handlerRef.current = onStats;

  useEffect(() => {
    let cancelled = false;

    const reconcile = async (projectId?: string | null) => {
      if (!projectId) return;
      try {
        const stats = await fetchProjectStats(projectId, currentUserId);
        if (!cancelled) handlerRef.current(projectId, stats);
      } catch (error) {
        console.error('Failed to reconcile live project stats:', error);
      }
    };

    const extractProjectId = (payload: any): string | null => {
      const row = payload.new && Object.keys(payload.new).length ? payload.new : payload.old;
      return row?.project_id ?? row?.source_project_id ?? null;
    };

    const channel = supabase
      .channel('project-interactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_resonances' }, (payload) => {
        reconcile(extractProjectId(payload));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_forks' }, (payload) => {
        reconcile(extractProjectId(payload));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);
};

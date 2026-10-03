import { useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';

export function useActivityLog() {
  const { session } = useAuth();

  const logActivity = useCallback(
    async (action: string, contentType: string, contentId?: string, details?: string) => {
      try {
        await supabase.from('activity_logs').insert({
          admin_name: session?.user?.email || 'admin',
          action,
          content_type: contentType,
          content_id: contentId,
          details,
        });
      } catch {
        // Silent fail — don't block the operation
      }
    },
    [session]
  );

  return { logActivity };
}

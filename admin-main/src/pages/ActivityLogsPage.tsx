import { useEffect, useState, useCallback } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ActivityLog } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { formatDateTime } from '@/lib/utils';

export default function ActivityLogsPage() {
  const [items, setItems] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) setItems([]);
    else setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<ActivityLog>[] = [
    { key: 'action', label: 'Action', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0"><Activity className="w-4 h-4 text-teal-400" /></div>
        <p className="font-medium text-white">{row.action}</p>
      </div>
    ) },
    { key: 'content_type', label: 'Content Type', sortable: true, render: (row) => <span className="badge bg-slate-700 text-slate-300">{row.content_type || '—'}</span> },
    { key: 'admin_name', label: 'Admin', render: (row) => <span className="text-slate-400">{row.admin_name || '—'}</span> },
    { key: 'details', label: 'Details', render: (row) => <span className="text-slate-500 text-xs truncate max-w-xs">{row.details || '—'}</span> },
    { key: 'created_at', label: 'Timestamp', sortable: true, render: (row) => <span className="text-xs text-slate-500">{formatDateTime(row.created_at)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Activity Logs" description="Track all admin actions across the CMS" />
      {items.length === 0 && !loading ? <EmptyState icon={Activity} title="No activity yet" description="Actions performed in the CMS will be logged here." /> : <DataTable data={items} columns={columns} loading={loading} searchFields={['action', 'content_type', 'admin_name']} searchPlaceholder="Search logs..." />}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Users, Loader2, ShieldCheck, Shield, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { AdminProfile } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { useToast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';

const roleIcons: Record<string, typeof Shield> = { super_admin: ShieldCheck, content_manager: Shield, editor: ShieldAlert };

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
    if (error) toast('Failed to load admin users', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const updateRole = async (item: AdminProfile, role: string) => {
    setUpdating(item.id);
    const { error } = await supabase.from('admin_profiles').update({ role }).eq('id', item.id);
    if (error) toast(error.message, 'error');
    else { toast('Role updated'); load(); }
    setUpdating(null);
  };

  const updateStatus = async (item: AdminProfile, status: string) => {
    setUpdating(item.id);
    const { error } = await supabase.from('admin_profiles').update({ status }).eq('id', item.id);
    if (error) toast(error.message, 'error');
    else { toast('Status updated'); load(); }
    setUpdating(null);
  };

  const columns: Column<AdminProfile>[] = [
    { key: 'name', label: 'Name', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4 text-teal-400" /></div>
        <p className="font-medium text-white">{row.name || 'Unnamed'}</p>
      </div>
    ) },
    { key: 'role', label: 'Role', sortable: true, render: (row) => {
      const Icon = roleIcons[row.role] || Shield;
      return <span className="flex items-center gap-1.5 text-slate-300"><Icon className="h-3.5 w-3.5" />{row.role.replace('_', ' ')}</span>;
    } },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: 'last_login', label: 'Last Login', render: (row) => <span className="text-xs text-slate-500">{formatDate(row.last_login)}</span> },
    { key: 'created_at', label: 'Created', sortable: true, render: (row) => <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span> },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex items-center gap-2">
        <select value={row.role} onChange={(e) => updateRole(row, e.target.value)} disabled={updating === row.id} className="input text-xs py-1 px-2 max-w-[120px]">
          <option value="super_admin">Super Admin</option>
          <option value="content_manager">Content Manager</option>
          <option value="editor">Editor</option>
        </select>
        <select value={row.status} onChange={(e) => updateStatus(row, e.target.value)} disabled={updating === row.id} className="input text-xs py-1 px-2 max-w-[100px]">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Admin Users" description="Manage administrator accounts and roles" />
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-400" /><span className="text-slate-300"><strong>Super Admin</strong> — Full access to all features</span></div>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" /><span className="text-slate-300"><strong>Content Manager</strong> — Content management only</span></div>
          <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-400" /><span className="text-slate-300"><strong>Editor</strong> — Create/edit, limited publishing</span></div>
        </div>
      </div>
      {items.length === 0 && !loading ? <EmptyState icon={Users} title="No admin users" description="Admin users appear here after they sign up." /> : <DataTable data={items} columns={columns} loading={loading} searchFields={['name', 'role']} searchPlaceholder="Search users..." />}
    </div>
  );
}

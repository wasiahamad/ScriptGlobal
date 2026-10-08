import { useEffect, useState, useCallback } from 'react';
import { Users, Loader2, ShieldCheck, Shield, ShieldAlert, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import type { AdminProfile } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { FormSection, Field } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';

const roleIcons: Record<string, typeof Shield> = { super_admin: ShieldCheck, content_manager: Shield, editor: ShieldAlert };

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'editor' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Array<Record<string, unknown>>>('/api/v1/admin/admin-users');
      setItems((data ?? []).map((item) => ({
        id: String(item._id || item.id),
        user_id: String(item._id || item.id),
        name: String(item.name || ''),
        email: String(item.email || ''),
        role: String(item.role || 'editor'),
        status: item.isActive === false ? 'inactive' : 'active',
        is_active: item.isActive !== false,
        last_login: (item.lastLoginAt as string | null) || null,
        created_at: String(item.createdAt || ''),
      })));
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to load admin users', 'error');
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const updateRole = async (item: AdminProfile, role: string) => {
    setUpdating(item.id);
    try { await apiRequest(`/api/v1/admin/admin-users/${item.id}`, { method: 'PUT', body: JSON.stringify({ role }) }); toast('Role updated'); await load(); }
    catch (error) { toast(error instanceof Error ? error.message : 'Role update failed', 'error'); }
    setUpdating(null);
  };

  const updateStatus = async (item: AdminProfile, status: string) => {
    setUpdating(item.id);
    try { await apiRequest(`/api/v1/admin/admin-users/${item.id}`, { method: 'PUT', body: JSON.stringify({ isActive: status === 'active' }) }); toast('Status updated'); await load(); }
    catch (error) { toast(error instanceof Error ? error.message : 'Status update failed', 'error'); }
    setUpdating(null);
  };

  const createUser = async () => {
    if (!newUser.name || !newUser.email || newUser.password.length < 8) {
      toast('Name, email and a password of at least 8 characters are required', 'error');
      return;
    }
    setCreating(true);
    try {
      await apiRequest('/api/v1/admin/admin-users', { method: 'POST', body: JSON.stringify(newUser) });
      toast('Admin user created');
      setShowCreate(false);
      setNewUser({ name: '', email: '', password: '', role: 'editor' });
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to create admin user', 'error');
    } finally { setCreating(false); }
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
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.is_active === false ? 'inactive' : 'active'} /> },
    { key: 'last_login', label: 'Last Login', render: (row) => <span className="text-xs text-slate-500">{formatDate(row.last_login)}</span> },
    { key: 'created_at', label: 'Created', sortable: true, render: (row) => <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span> },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex items-center gap-2">
        <select value={row.role} onChange={(e) => updateRole(row, e.target.value)} disabled={updating === row.id} className="input text-xs py-1 px-2 max-w-[120px]">
          <option value="super_admin">Super Admin</option>
          <option value="content_manager">Content Manager</option>
          <option value="editor">Editor</option>
        </select>
        <select value={row.is_active === false ? 'inactive' : 'active'} onChange={(e) => updateStatus(row, e.target.value)} disabled={updating === row.id} className="input text-xs py-1 px-2 max-w-[100px]">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Admin Users" description="Manage administrator accounts and roles" actions={<button onClick={() => setShowCreate(true)} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Admin User</button>} />
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-teal-400" /><span className="text-slate-300"><strong>Super Admin</strong> — Full access to all features</span></div>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" /><span className="text-slate-300"><strong>Content Manager</strong> — Content management only</span></div>
          <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-400" /><span className="text-slate-300"><strong>Editor</strong> — Create/edit, limited publishing</span></div>
        </div>
      </div>
      {items.length === 0 && !loading ? <EmptyState icon={Users} title="No admin users" description="Admin users appear here after they sign up." /> : <DataTable data={items} columns={columns} loading={loading} searchFields={['name', 'role']} searchPlaceholder="Search users..." />}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Admin User">
        <div className="space-y-4">
          <FormSection title="Account Details">
            <Field label="Name" required><input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="input" /></Field>
            <Field label="Email" required><input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="input" /></Field>
            <Field label="Password" required hint="Minimum 8 characters"><input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="input" /></Field>
            <Field label="Role"><select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="input"><option value="editor">Editor</option><option value="content_manager">Content Manager</option><option value="super_admin">Super Admin</option></select></Field>
          </FormSection>
          <button onClick={createUser} disabled={creating} className="btn btn-primary w-full">{creating && <Loader2 className="h-4 w-4 animate-spin" />} Create User</button>
        </div>
      </Modal>
    </div>
  );
}

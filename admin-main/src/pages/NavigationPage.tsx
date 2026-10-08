import { useEffect, useState, useCallback } from 'react';
import { Plus, Menu as MenuIcon, Trash2, Loader2, GripVertical } from 'lucide-react';
import { createBackendDataClient } from '@/lib/backendData';
import type { NavItem } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/ui';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';

const emptyItem: Partial<NavItem> = {
  label: '', url: '', nav_type: 'internal', parent_id: null, display_order: 0, enabled: true,
};

export default function NavigationPage() {
  const supabase = createBackendDataClient();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<NavItem> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('navigation').select('*').order('display_order', { ascending: true });
    if (error) toast('Failed to load navigation', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editing || !editing.label) { toast('Label is required', 'error'); return; }
    setSaving(true);
    if (editing.id) {
      const { error } = await supabase.from('navigation').update(editing).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('Navigation item updated'); await logActivity('Updated Navigation', 'navigation', editing.id); }
    } else {
      const { data, error } = await supabase.from('navigation').insert(editing).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Navigation item created'); await logActivity('Created Navigation', 'navigation', data.id); }
    }
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('navigation').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else { toast('Navigation item deleted'); await logActivity('Deleted Navigation', 'navigation', deleteId); }
    setDeleting(false); setDeleteId(null); load();
  };

  const toggleEnabled = async (item: NavItem) => {
    const { error } = await supabase.from('navigation').update({ enabled: !item.enabled }).eq('id', item.id);
    if (error) toast(error.message, 'error');
    else load();
  };

  const moveItem = async (item: NavItem, dir: 'up' | 'down') => {
    const sorted = [...items].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapItem = sorted[swapIdx];
    await Promise.all([
      supabase.from('navigation').update({ display_order: swapItem.display_order }).eq('id', item.id),
      supabase.from('navigation').update({ display_order: item.display_order }).eq('id', swapItem.id),
    ]);
    load();
  };

  const topLevel = items.filter((i) => !i.parent_id).sort((a, b) => a.display_order - b.display_order);
  const childrenOf = (parentId: string) => items.filter((i) => i.parent_id === parentId).sort((a, b) => a.display_order - b.display_order);

  return (
    <div>
      <PageHeader title="Navigation" description="Manage the public website navbar menu" actions={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Menu Item</button>} />
      {items.length === 0 && !loading ? <EmptyState icon={MenuIcon} title="No navigation items" description="Create menu items for the public website navbar." action={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Menu Item</button>} /> : (
        <div className="card p-4">
          {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />)}</div> : (
            <div className="space-y-1">
              {topLevel.map((item, idx) => (
                <div key={item.id}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 group">
                    <GripVertical className="h-4 w-4 text-slate-600" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.url || '—'} · {item.nav_type}</p>
                    </div>
                    <span className={`badge ${item.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>{item.enabled ? 'Enabled' : 'Disabled'}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveItem(item, 'up')} disabled={idx === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">↑</button>
                      <button onClick={() => moveItem(item, 'down')} disabled={idx === topLevel.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">↓</button>
                      <button onClick={() => toggleEnabled(item)} className="p-1 text-slate-400 hover:text-white">{item.enabled ? 'Disable' : 'Enable'}</button>
                      <button onClick={() => { setEditing(item); setShowForm(true); }} className="p-1 text-slate-400 hover:text-white">Edit</button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  {childrenOf(item.id).length > 0 && (
                    <div className="ml-8 space-y-1">
                      {childrenOf(item.id).map((child) => (
                        <div key={child.id} className="flex items-center gap-3 p-2 pl-4 rounded-lg hover:bg-slate-800/50 group">
                          <span className="text-slate-600">↳</span>
                          <div className="flex-1">
                            <p className="text-sm text-slate-200">{child.label}</p>
                            <p className="text-xs text-slate-500">{child.url || '—'}</p>
                          </div>
                          <span className={`badge ${child.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>{child.enabled ? 'Enabled' : 'Disabled'}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => toggleEnabled(child)} className="p-1 text-slate-400 hover:text-white">{child.enabled ? 'Disable' : 'Enable'}</button>
                            <button onClick={() => { setEditing(child); setShowForm(true); }} className="p-1 text-slate-400 hover:text-white">Edit</button>
                            <button onClick={() => setDeleteId(child.id)} className="p-1 text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing?.id ? 'Edit Menu Item' : 'New Menu Item'} size="md">
        {editing && (
          <div className="space-y-4">
            <FormSection title="Menu Item Details">
              <Field label="Label" required><input value={editing.label || ''} onChange={(e) => setEditing({ ...editing, label: e.target.value })} className="input" placeholder="Home" /></Field>
              <Field label="URL"><input value={editing.url || ''} onChange={(e) => setEditing({ ...editing, url: e.target.value })} className="input" placeholder="/about or https://..." /></Field>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Type"><select value={editing.nav_type || 'internal'} onChange={(e) => setEditing({ ...editing, nav_type: e.target.value })} className="input"><option value="internal">Internal Route</option><option value="external">External URL</option></select></Field>
                <Field label="Parent Item" hint="Leave empty for top-level"><select value={editing.parent_id || ''} onChange={(e) => setEditing({ ...editing, parent_id: e.target.value || null })} className="input"><option value="">None (Top Level)</option>{topLevel.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Display Order"><input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} className="input" /></Field>
                <Field label="Enabled"><select value={editing.enabled ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, enabled: e.target.value === 'true' })} className="input"><option value="true">Yes</option><option value="false">No</option></select></Field>
              </div>
            </FormSection>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!deleteId} title="Delete Menu Item?" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Plus, GraduationCap, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Expertise } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field, CharCounter } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';
import { slugify } from '@/lib/utils';

const emptyItem: Partial<Expertise> = {
  name: '', slug: '', short_description: '', detailed_description: '', icon: '',
  cover_image: null, gallery: [], related_services: [], related_projects: [],
  display_order: 0, featured: false, status: 'draft',
};

export default function ExpertisePage() {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [items, setItems] = useState<Expertise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Expertise> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('expertise').select('*').order('display_order', { ascending: true });
    if (error) toast('Failed to load expertise', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (publish = false) => {
    if (!editing || !editing.name || !editing.slug) { toast('Name and slug are required', 'error'); return; }
    setSaving(true);
    const payload = { ...editing, status: publish ? 'published' : editing.status || 'draft', gallery: editing.gallery || [], related_services: editing.related_services || [], related_projects: editing.related_projects || [], seo: editing.seo || {} };
    if (editing.id) {
      const { error } = await supabase.from('expertise').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('Expertise updated successfully'); await logActivity('Updated Expertise', 'expertise', editing.id); }
    } else {
      const { data, error } = await supabase.from('expertise').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Expertise created successfully'); await logActivity('Created Expertise', 'expertise', data.id); }
    }
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('expertise').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else { toast('Expertise deleted'); await logActivity('Deleted Expertise', 'expertise', deleteId); }
    setDeleting(false); setDeleteId(null); load();
  };

  const columns: Column<Expertise>[] = [
    { key: 'name', label: 'Name', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0"><GraduationCap className="w-4 h-4 text-blue-400" /></div>
        <div><p className="font-medium text-white">{row.name}</p><p className="text-xs text-slate-500">/{row.slug}</p></div>
      </div>
    ) },
    { key: 'short_description', label: 'Description', render: (row) => <p className="text-slate-400 truncate max-w-xs">{row.short_description || '—'}</p> },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: 'featured', label: 'Featured', render: (row) => row.featured ? <StatusBadge status="true" /> : <span className="text-slate-600">—</span> },
    { key: 'display_order', label: 'Order', sortable: true },
    { key: 'updated_at', label: 'Updated', sortable: true, render: (row) => <span className="text-xs text-slate-500">{new Date(row.updated_at).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Expertise" description="Manage subject expertise categories" actions={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Expertise</button>} />
      {items.length === 0 && !loading ? <EmptyState icon={GraduationCap} title="No expertise areas yet" description="Add your first subject expertise category." action={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Expertise</button>} /> : <DataTable data={items} columns={columns} loading={loading} onEdit={(row) => { setEditing(row); setShowForm(true); }} onDelete={(row) => setDeleteId(row.id)} searchFields={['name', 'slug']} searchPlaceholder="Search expertise..." />}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing?.id ? 'Edit Expertise' : 'New Expertise'} size="lg">
        {editing && (
          <div className="space-y-4">
            <FormSection title="Basic Information">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name" required><input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.slug || slugify(e.target.value) })} className="input" placeholder="Cancer Research" /></Field>
                <Field label="Slug" required><input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} className="input" placeholder="cancer-research" /></Field>
              </div>
              <Field label="Short Description"><input value={editing.short_description || ''} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} className="input" placeholder="Brief description..." /><CharCounter value={editing.short_description || ''} max={150} /></Field>
              <Field label="Detailed Description"><textarea value={editing.detailed_description || ''} onChange={(e) => setEditing({ ...editing, detailed_description: e.target.value })} className="input min-h-[120px]" /></Field>
              <Field label="Icon" hint="Lucide icon name"><input value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="input" placeholder="microscope" /></Field>
            </FormSection>
            <FormSection title="Publishing">
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Display Order"><input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} className="input" /></Field>
                <Field label="Featured"><select value={editing.featured ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, featured: e.target.value === 'true' })} className="input"><option value="false">No</option><option value="true">Yes</option></select></Field>
                <Field label="Status"><select value={editing.status || 'draft'} onChange={(e) => setEditing({ ...editing, status: e.target.value as 'draft' | 'published' | 'archived' })} className="input"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
              </div>
            </FormSection>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn btn-secondary">Cancel</button>
              <button onClick={() => handleSave(false)} disabled={saving} className="btn btn-secondary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Draft</button>
              <button onClick={() => handleSave(true)} disabled={saving} className="btn btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Publish</button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!deleteId} title="Delete Expertise?" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { createBackendDataClient } from '@/lib/backendData';
import type { Testimonial } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';

const emptyItem: Partial<Testimonial> = {
  name: '', designation: '', organization: '', profile_image: null, testimonial: '',
  linkedin_url: '', website: '', display_order: 0, featured: false, status: 'draft',
};

export default function TestimonialsPage() {
  const supabase = createBackendDataClient();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('testimonials').select('*').order('display_order', { ascending: true });
    if (error) toast('Failed to load testimonials', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (publish = false) => {
    if (!editing || !editing.name) { toast('Name is required', 'error'); return; }
    setSaving(true);
    const payload = { ...editing, status: publish ? 'published' : editing.status || 'draft' };
    if (editing.id) {
      const { error } = await supabase.from('testimonials').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('Testimonial updated successfully'); await logActivity('Updated Testimonial', 'testimonial', editing.id); }
    } else {
      const { data, error } = await supabase.from('testimonials').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Testimonial created successfully'); await logActivity('Created Testimonial', 'testimonial', data.id); }
    }
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('testimonials').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else { toast('Testimonial deleted'); await logActivity('Deleted Testimonial', 'testimonial', deleteId); }
    setDeleting(false); setDeleteId(null); load();
  };

  const columns: Column<Testimonial>[] = [
    { key: 'name', label: 'Name', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center flex-shrink-0"><MessageSquare className="w-4 h-4 text-slate-400" /></div>
        <div><p className="font-medium text-white">{row.name}</p><p className="text-xs text-slate-500">{row.designation || ''} {row.organization ? `at ${row.organization}` : ''}</p></div>
      </div>
    ) },
    { key: 'testimonial', label: 'Testimonial', render: (row) => <p className="text-slate-400 truncate max-w-xs">{row.testimonial || '—'}</p> },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: 'featured', label: 'Featured', render: (row) => row.featured ? <StatusBadge status="true" /> : <span className="text-slate-600">—</span> },
    { key: 'updated_at', label: 'Updated', sortable: true, render: (row) => <span className="text-xs text-slate-500">{new Date(row.updated_at).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Testimonials" description="Manage client testimonials" actions={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Testimonial</button>} />
      {items.length === 0 && !loading ? <EmptyState icon={MessageSquare} title="No testimonials yet" description="Add real testimonials from clients. Never create fake testimonials." action={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Testimonial</button>} /> : <DataTable data={items} columns={columns} loading={loading} onEdit={(row) => { setEditing(row); setShowForm(true); }} onDelete={(row) => setDeleteId(row.id)} searchFields={['name', 'organization']} searchPlaceholder="Search testimonials..." />}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing?.id ? 'Edit Testimonial' : 'New Testimonial'} size="lg">
        {editing && (
          <div className="space-y-4">
            <FormSection title="Person Information">
              <Field label="Name" required><input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input" placeholder="Dr. Jane Smith" /></Field>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Designation"><input value={editing.designation || ''} onChange={(e) => setEditing({ ...editing, designation: e.target.value })} className="input" placeholder="Research Scientist" /></Field>
                <Field label="Organization"><input value={editing.organization || ''} onChange={(e) => setEditing({ ...editing, organization: e.target.value })} className="input" placeholder="University Name" /></Field>
              </div>
            </FormSection>
            <FormSection title="Testimonial">
              <Field label="Testimonial Text" required><textarea value={editing.testimonial || ''} onChange={(e) => setEditing({ ...editing, testimonial: e.target.value })} className="input min-h-[120px]" placeholder="The scientific writing service was exceptional..." /></Field>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="LinkedIn URL"><input value={editing.linkedin_url || ''} onChange={(e) => setEditing({ ...editing, linkedin_url: e.target.value })} className="input" placeholder="https://linkedin.com/in/..." /></Field>
                <Field label="Website"><input value={editing.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })} className="input" placeholder="https://..." /></Field>
              </div>
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
      <ConfirmDialog open={!!deleteId} title="Delete Testimonial?" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

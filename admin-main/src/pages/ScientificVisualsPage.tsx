import { useEffect, useState, useCallback } from 'react';
import { Plus, Image, Loader2 } from 'lucide-react';
import { createBackendDataClient } from '@/lib/backendData';
import type { ScientificVisual } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field, CharCounter, ImageUploadField } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';
import { slugify } from '@/lib/utils';

const visualCategories = ['Molecular Mechanisms', 'Drug Delivery', 'Nanoparticle Systems', 'Disease Pathways', 'Graphical Abstracts', 'Study Design', 'PRISMA Flow Diagrams', 'Comparative Evidence Tables', 'Formulation & Characterization', 'Chemistry / Reaction Schemes'];

const emptyItem: Partial<ScientificVisual> = {
  title: '', slug: '', category: '', short_description: '', detailed_description: '',
  main_image: null, thumbnail: null, gallery: [], related_project: '', related_publication: '',
  related_expertise: '', alt_text: '', caption: '', display_order: 0, featured: false, status: 'draft',
};

export default function ScientificVisualsPage() {
  const supabase = createBackendDataClient();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [items, setItems] = useState<ScientificVisual[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ScientificVisual> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('scientific_visuals').select('*').order('display_order', { ascending: true });
    if (error) toast('Failed to load visuals', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (publish = false) => {
    if (!editing || !editing.title || !editing.slug) { toast('Title and slug are required', 'error'); return; }
    setSaving(true);
    const payload = { ...editing, status: publish ? 'published' : editing.status || 'draft', gallery: editing.gallery || [], seo: editing.seo || {} };
    if (editing.id) {
      const { error } = await supabase.from('scientific_visuals').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('Visual updated successfully'); await logActivity('Updated Visual', 'scientific_visual', editing.id); }
    } else {
      const { data, error } = await supabase.from('scientific_visuals').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Visual created successfully'); await logActivity('Created Visual', 'scientific_visual', data.id); }
    }
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('scientific_visuals').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else { toast('Visual deleted'); await logActivity('Deleted Visual', 'scientific_visual', deleteId); }
    setDeleting(false); setDeleteId(null); load();
  };

  const columns: Column<ScientificVisual>[] = [
    { key: 'title', label: 'Title', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0"><Image className="w-4 h-4 text-amber-400" /></div>
        <div><p className="font-medium text-white">{row.title}</p><p className="text-xs text-slate-500">{row.category || 'Uncategorized'}</p></div>
      </div>
    ) },
    { key: 'category', label: 'Category', sortable: true, render: (row) => <span className="text-slate-400">{row.category || '—'}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: 'featured', label: 'Featured', render: (row) => row.featured ? <StatusBadge status="true" /> : <span className="text-slate-600">—</span> },
    { key: 'display_order', label: 'Order', sortable: true },
    { key: 'updated_at', label: 'Updated', sortable: true, render: (row) => <span className="text-xs text-slate-500">{new Date(row.updated_at).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Scientific Visuals" description="Manage scientific illustrations and visual portfolio" actions={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Visual</button>} />
      {items.length === 0 && !loading ? <EmptyState icon={Image} title="No visuals yet" description="Add your first scientific visual to the portfolio." action={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Visual</button>} /> : <DataTable data={items} columns={columns} loading={loading} onEdit={(row) => { setEditing(row); setShowForm(true); }} onDelete={(row) => setDeleteId(row.id)} searchFields={['title', 'slug', 'category']} searchPlaceholder="Search visuals..." />}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing?.id ? 'Edit Visual' : 'New Scientific Visual'} size="xl">
        {editing && (
          <div className="space-y-4">
            <FormSection title="Basic Information">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Title" required><input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} className="input" placeholder="Nanoparticle Drug Delivery Diagram" /></Field>
                <Field label="Slug" required><input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} className="input" placeholder="nanoparticle-drug-delivery" /></Field>
              </div>
              <Field label="Category"><select value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input"><option value="">Select category</option>{visualCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field label="Short Description"><input value={editing.short_description || ''} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} className="input" /><CharCounter value={editing.short_description || ''} max={150} /></Field>
              <Field label="Detailed Description"><textarea value={editing.detailed_description || ''} onChange={(e) => setEditing({ ...editing, detailed_description: e.target.value })} className="input min-h-[100px]" /></Field>
            </FormSection>
            <FormSection title="Image Accessibility">
              <ImageUploadField label="Main visual image" category="Scientific Visuals" value={editing.main_image?.url || null} onChange={(url) => setEditing({ ...editing, main_image: { url, alt: editing.alt_text || editing.title || '' } })} />
              <Field label="Alt Text" required hint="Describe the image for accessibility and SEO"><textarea value={editing.alt_text || ''} onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })} className="input min-h-[60px]" placeholder="Scientific illustration of targeted nanoparticle drug delivery for cancer therapy" /><CharCounter value={editing.alt_text || ''} max={160} /></Field>
              <Field label="Caption"><input value={editing.caption || ''} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} className="input" placeholder="Figure 1: Nanoparticle drug delivery mechanism" /></Field>
            </FormSection>
            <FormSection title="Relations">
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Related Project"><input value={editing.related_project || ''} onChange={(e) => setEditing({ ...editing, related_project: e.target.value })} className="input" /></Field>
                <Field label="Related Publication"><input value={editing.related_publication || ''} onChange={(e) => setEditing({ ...editing, related_publication: e.target.value })} className="input" /></Field>
                <Field label="Related Expertise"><input value={editing.related_expertise || ''} onChange={(e) => setEditing({ ...editing, related_expertise: e.target.value })} className="input" /></Field>
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
      <ConfirmDialog open={!!deleteId} title="Delete Visual?" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Plus, BookOpen, Loader2 } from 'lucide-react';
import { createBackendDataClient } from '@/lib/backendData';
import type { Research } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field, StringListEditor } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';
import { slugify } from '@/lib/utils';

const researchTypes = ['Research Article', 'Review Article', 'Book', 'Book Chapter', 'Thesis', 'Dissertation', 'Research Project'];

const emptyItem: Partial<Research> = {
  title: '', slug: '', research_type: '', research_area: '', description: '', long_description: '',
  featured_image: null, gallery: [], scientific_visuals: [], contribution: '', methods: [],
  ref_list: [], doi: '', pubmed_url: '', publisher_url: '', external_evidence_url: '',
  publication_date: null, author_role: '', status: 'draft', featured: false, display_order: 0,
};

export default function ResearchPage() {
  const supabase = createBackendDataClient();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [items, setItems] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Research> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('research').select('*').order('display_order', { ascending: true });
    if (error) toast('Failed to load research', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (publish = false) => {
    if (!editing || !editing.title || !editing.slug) { toast('Title and slug are required', 'error'); return; }
    setSaving(true);
    const payload = { ...editing, status: publish ? 'published' : editing.status || 'draft', gallery: editing.gallery || [], scientific_visuals: editing.scientific_visuals || [], methods: editing.methods || [], ref_list: editing.ref_list || [], seo: editing.seo || {} };
    if (editing.id) {
      const { error } = await supabase.from('research').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('Research updated successfully'); await logActivity('Updated Research', 'research', editing.id); }
    } else {
      const { data, error } = await supabase.from('research').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Research created successfully'); await logActivity('Created Research', 'research', data.id); }
    }
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('research').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else { toast('Research deleted'); await logActivity('Deleted Research', 'research', deleteId); }
    setDeleting(false); setDeleteId(null); load();
  };

  const columns: Column<Research>[] = [
    { key: 'title', label: 'Title', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0"><BookOpen className="w-4 h-4 text-teal-400" /></div>
        <div><p className="font-medium text-white truncate max-w-xs">{row.title}</p><p className="text-xs text-slate-500">{row.research_type || '—'}</p></div>
      </div>
    ) },
    { key: 'research_area', label: 'Research Area', render: (row) => <span className="text-slate-400">{row.research_area || '—'}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: 'featured', label: 'Featured', render: (row) => row.featured ? <StatusBadge status="true" /> : <span className="text-slate-600">—</span> },
    { key: 'publication_date', label: 'Pub. Date', sortable: true, render: (row) => <span className="text-xs text-slate-500">{row.publication_date || '—'}</span> },
    { key: 'updated_at', label: 'Updated', sortable: true, render: (row) => <span className="text-xs text-slate-500">{new Date(row.updated_at).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Research" description="Manage research entries" actions={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Research</button>} />
      {items.length === 0 && !loading ? <EmptyState icon={BookOpen} title="No research entries yet" description="Add your first research entry." action={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Research</button>} /> : <DataTable data={items} columns={columns} loading={loading} onEdit={(row) => { setEditing(row); setShowForm(true); }} onDelete={(row) => setDeleteId(row.id)} searchFields={['title', 'slug', 'research_area']} searchPlaceholder="Search research..." />}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing?.id ? 'Edit Research' : 'New Research'} size="xl">
        {editing && (
          <div className="space-y-4">
            <FormSection title="Basic Information">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Title" required><input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} className="input" placeholder="Research title" /></Field>
                <Field label="Slug" required><input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} className="input" /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Research Type"><select value={editing.research_type || ''} onChange={(e) => setEditing({ ...editing, research_type: e.target.value })} className="input"><option value="">Select type</option>{researchTypes.map((t) => <option key={t}>{t}</option>)}</select></Field>
                <Field label="Research Area"><input value={editing.research_area || ''} onChange={(e) => setEditing({ ...editing, research_area: e.target.value })} className="input" placeholder="Cancer / Nanotechnology" /></Field>
              </div>
              <Field label="Description"><textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input min-h-[80px]" /></Field>
              <Field label="Long Description"><textarea value={editing.long_description || ''} onChange={(e) => setEditing({ ...editing, long_description: e.target.value })} className="input min-h-[120px]" /></Field>
              <Field label="Contribution"><textarea value={editing.contribution || ''} onChange={(e) => setEditing({ ...editing, contribution: e.target.value })} className="input min-h-[80px]" /></Field>
            </FormSection>
            <FormSection title="Methods & References">
              <StringListEditor label="Methods / Workflow" value={editing.methods || []} onChange={(methods) => setEditing({ ...editing, methods })} placeholder="Method step..." />
              <div className="mt-4"><StringListEditor label="References" value={editing.ref_list || []} onChange={(ref_list) => setEditing({ ...editing, ref_list })} placeholder="Reference..." /></div>
            </FormSection>
            <FormSection title="Links & Identifiers">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="DOI" hint="Leave empty if not available"><input value={editing.doi || ''} onChange={(e) => setEditing({ ...editing, doi: e.target.value })} className="input" /></Field>
                <Field label="Publication Date"><input type="date" value={editing.publication_date || ''} onChange={(e) => setEditing({ ...editing, publication_date: e.target.value })} className="input" /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="PubMed URL"><input value={editing.pubmed_url || ''} onChange={(e) => setEditing({ ...editing, pubmed_url: e.target.value })} className="input" /></Field>
                <Field label="Publisher URL"><input value={editing.publisher_url || ''} onChange={(e) => setEditing({ ...editing, publisher_url: e.target.value })} className="input" /></Field>
              </div>
              <Field label="External Evidence URL"><input value={editing.external_evidence_url || ''} onChange={(e) => setEditing({ ...editing, external_evidence_url: e.target.value })} className="input" /></Field>
              <Field label="Author Role"><input value={editing.author_role || ''} onChange={(e) => setEditing({ ...editing, author_role: e.target.value })} className="input" placeholder="First author, corresponding author..." /></Field>
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
      <ConfirmDialog open={!!deleteId} title="Delete Research?" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

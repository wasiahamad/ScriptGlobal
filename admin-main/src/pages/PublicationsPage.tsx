import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Publication } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';

const emptyPub: Partial<Publication> = {
  title: '', publication_type: '', authors: '', author_role: '', journal_publisher: '',
  year: null, abstract: '', description: '', doi: '', pubmed_url: '', publisher_url: '',
  google_scholar_url: '', pdf_url: '', cover_image: null, evidence_link: '',
  contribution: '', featured: false, status: 'draft', display_order: 0,
};

export default function PublicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Publication> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('publications').select('*').order('display_order', { ascending: true });
    if (error) toast('Failed to load publications', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
    if (searchParams.get('action') === 'new') { setEditing(emptyPub); setShowForm(true); searchParams.delete('action'); setSearchParams(searchParams); }
  }, [load]);

  const handleSave = async (publish = false) => {
    if (!editing || !editing.title) { toast('Title is required', 'error'); return; }
    setSaving(true);
    const payload = { ...editing, status: publish ? 'published' : editing.status || 'draft', seo: editing.seo || {} };
    if (editing.id) {
      const { error } = await supabase.from('publications').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('Publication updated successfully'); await logActivity('Updated Publication', 'publication', editing.id); }
    } else {
      const { data, error } = await supabase.from('publications').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Publication created successfully'); await logActivity('Created Publication', 'publication', data.id); }
    }
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('publications').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else { toast('Publication deleted'); await logActivity('Deleted Publication', 'publication', deleteId); }
    setDeleting(false); setDeleteId(null); load();
  };

  const columns: Column<Publication>[] = [
    { key: 'title', label: 'Title', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-emerald-400" /></div>
        <div><p className="font-medium text-white truncate max-w-xs">{row.title}</p><p className="text-xs text-slate-500">{row.journal_publisher || '—'} {row.year ? `(${row.year})` : ''}</p></div>
      </div>
    ) },
    { key: 'publication_type', label: 'Type', render: (row) => <span className="text-slate-400">{row.publication_type || '—'}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: 'featured', label: 'Featured', render: (row) => row.featured ? <StatusBadge status="true" /> : <span className="text-slate-600">—</span> },
    { key: 'year', label: 'Year', sortable: true },
    { key: 'updated_at', label: 'Updated', sortable: true, render: (row) => <span className="text-xs text-slate-500">{new Date(row.updated_at).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Publications" description="Manage research publications" actions={<button onClick={() => { setEditing(emptyPub); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Publication</button>} />
      {items.length === 0 && !loading ? <EmptyState icon={FileText} title="No publications yet" description="Add your first publication to get started." action={<button onClick={() => { setEditing(emptyPub); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Publication</button>} /> : <DataTable data={items} columns={columns} loading={loading} onEdit={(row) => { setEditing(row); setShowForm(true); }} onDelete={(row) => setDeleteId(row.id)} searchFields={['title', 'authors', 'journal_publisher']} searchPlaceholder="Search publications..." />}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing?.id ? 'Edit Publication' : 'New Publication'} size="xl">
        {editing && (
          <div className="space-y-4">
            <FormSection title="Basic Information">
              <Field label="Title" required><input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="input" placeholder="Publication title" /></Field>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Publication Type"><select value={editing.publication_type || ''} onChange={(e) => setEditing({ ...editing, publication_type: e.target.value })} className="input"><option value="">Select type</option><option>Research Article</option><option>Review Article</option><option>Book</option><option>Book Chapter</option><option>Conference Paper</option><option>Preprint</option></select></Field>
                <Field label="Year"><input type="number" value={editing.year ?? ''} onChange={(e) => setEditing({ ...editing, year: parseInt(e.target.value) || null })} className="input" placeholder="2024" /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Authors"><input value={editing.authors || ''} onChange={(e) => setEditing({ ...editing, authors: e.target.value })} className="input" placeholder="Author names" /></Field>
                <Field label="Author Role"><input value={editing.author_role || ''} onChange={(e) => setEditing({ ...editing, author_role: e.target.value })} className="input" placeholder="First author, co-author..." /></Field>
              </div>
              <Field label="Journal / Publisher"><input value={editing.journal_publisher || ''} onChange={(e) => setEditing({ ...editing, journal_publisher: e.target.value })} className="input" placeholder="Journal name" /></Field>
            </FormSection>
            <FormSection title="Content">
              <Field label="Abstract"><textarea value={editing.abstract || ''} onChange={(e) => setEditing({ ...editing, abstract: e.target.value })} className="input min-h-[120px]" placeholder="Publication abstract..." /></Field>
              <Field label="Description"><textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input min-h-[80px]" /></Field>
              <Field label="Contribution"><textarea value={editing.contribution || ''} onChange={(e) => setEditing({ ...editing, contribution: e.target.value })} className="input min-h-[80px]" /></Field>
            </FormSection>
            <FormSection title="Links & Identifiers">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="DOI" hint="Leave empty if not available"><input value={editing.doi || ''} onChange={(e) => setEditing({ ...editing, doi: e.target.value })} className="input" placeholder="10.xxxx/xxxxx" /></Field>
                <Field label="PubMed URL"><input value={editing.pubmed_url || ''} onChange={(e) => setEditing({ ...editing, pubmed_url: e.target.value })} className="input" placeholder="https://pubmed.ncbi.nlm.nih.gov/..." /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Publisher URL"><input value={editing.publisher_url || ''} onChange={(e) => setEditing({ ...editing, publisher_url: e.target.value })} className="input" /></Field>
                <Field label="Google Scholar URL"><input value={editing.google_scholar_url || ''} onChange={(e) => setEditing({ ...editing, google_scholar_url: e.target.value })} className="input" /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="PDF URL"><input value={editing.pdf_url || ''} onChange={(e) => setEditing({ ...editing, pdf_url: e.target.value })} className="input" /></Field>
                <Field label="Evidence Link"><input value={editing.evidence_link || ''} onChange={(e) => setEditing({ ...editing, evidence_link: e.target.value })} className="input" /></Field>
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
      <ConfirmDialog open={!!deleteId} title="Delete Publication?" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Plus, HelpCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { FAQ } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';

const faqCategories = ['General', 'Scientific Writing', 'Editing', 'Publication', 'Thesis', 'Scientific Visuals', 'AI & Originality', 'Confidentiality'];

const emptyItem: Partial<FAQ> = {
  question: '', answer: '', category: 'General', display_order: 0, published: false, featured: false,
};

export default function FAQsPage() {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<FAQ> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('faqs').select('*').order('display_order', { ascending: true });
    if (error) toast('Failed to load FAQs', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (publish = false) => {
    if (!editing || !editing.question) { toast('Question is required', 'error'); return; }
    setSaving(true);
    const payload = { ...editing, published: publish ? true : editing.published };
    if (editing.id) {
      const { error } = await supabase.from('faqs').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('FAQ updated successfully'); await logActivity('Updated FAQ', 'faq', editing.id); }
    } else {
      const { data, error } = await supabase.from('faqs').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else { toast('FAQ created successfully'); await logActivity('Created FAQ', 'faq', data.id); }
    }
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('faqs').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else { toast('FAQ deleted'); await logActivity('Deleted FAQ', 'faq', deleteId); }
    setDeleting(false); setDeleteId(null); load();
  };

  const columns: Column<FAQ>[] = [
    { key: 'question', label: 'Question', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0"><HelpCircle className="w-4 h-4 text-red-400" /></div>
        <p className="font-medium text-white truncate max-w-md">{row.question}</p>
      </div>
    ) },
    { key: 'category', label: 'Category', sortable: true, render: (row) => <span className="badge bg-slate-700 text-slate-300">{row.category}</span> },
    { key: 'published', label: 'Status', sortable: true, render: (row) => row.published ? <StatusBadge status="published" /> : <StatusBadge status="draft" /> },
    { key: 'featured', label: 'Featured', render: (row) => row.featured ? <StatusBadge status="true" /> : <span className="text-slate-600">—</span> },
    { key: 'display_order', label: 'Order', sortable: true },
    { key: 'updated_at', label: 'Updated', sortable: true, render: (row) => <span className="text-xs text-slate-500">{new Date(row.updated_at).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <PageHeader title="FAQ" description="Manage frequently asked questions" actions={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add FAQ</button>} />
      {items.length === 0 && !loading ? <EmptyState icon={HelpCircle} title="No FAQs yet" description="Add your first frequently asked question." action={<button onClick={() => { setEditing(emptyItem); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add FAQ</button>} /> : <DataTable data={items} columns={columns} loading={loading} onEdit={(row) => { setEditing(row); setShowForm(true); }} onDelete={(row) => setDeleteId(row.id)} searchFields={['question', 'category']} searchPlaceholder="Search FAQs..." />}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing?.id ? 'Edit FAQ' : 'New FAQ'} size="lg">
        {editing && (
          <div className="space-y-4">
            <FormSection title="FAQ Content">
              <Field label="Question" required><input value={editing.question || ''} onChange={(e) => setEditing({ ...editing, question: e.target.value })} className="input" placeholder="What scientific writing services do you offer?" /></Field>
              <Field label="Answer"><textarea value={editing.answer || ''} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} className="input min-h-[120px]" placeholder="Detailed answer..." /></Field>
            </FormSection>
            <FormSection title="Organization">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Category"><select value={editing.category || 'General'} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input">{faqCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
                <Field label="Display Order"><input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} className="input" /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Featured"><select value={editing.featured ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, featured: e.target.value === 'true' })} className="input"><option value="false">No</option><option value="true">Yes</option></select></Field>
                <Field label="Published"><select value={editing.published ? 'true' : 'false'} onChange={(e) => setEditing({ ...editing, published: e.target.value === 'true' })} className="input"><option value="false">Draft</option><option value="true">Published</option></select></Field>
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
      <ConfirmDialog open={!!deleteId} title="Delete FAQ?" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

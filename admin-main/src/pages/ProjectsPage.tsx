import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, FolderKanban, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field, StringListEditor, ImageUploadField } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';
import { slugify } from '@/lib/utils';

const emptyProject: Partial<Project> = {
  title: '', slug: '', project_type: '', research_area: '', short_summary: '',
  full_overview: '', scientific_context: '', challenge: '', contribution: '',
  workflow: [], deliverables: [], outcome: '', featured_image: null, gallery: [],
  scientific_visuals: [], ref_list: [], external_links: [], related_services: [],
  related_expertise: [], featured: false, status: 'draft', display_order: 0,
};

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
    if (error) toast('Failed to load projects', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
    if (searchParams.get('action') === 'new') { setEditing(emptyProject); setShowForm(true); searchParams.delete('action'); setSearchParams(searchParams); }
  }, [load]);

  const handleSave = async (publish = false) => {
    if (!editing || !editing.title || !editing.slug) { toast('Title and slug are required', 'error'); return; }
    setSaving(true);
    const payload = { ...editing, status: publish ? 'published' : editing.status || 'draft', workflow: editing.workflow || [], deliverables: editing.deliverables || [], gallery: editing.gallery || [], scientific_visuals: editing.scientific_visuals || [], ref_list: editing.ref_list || [], external_links: editing.external_links || [], related_services: editing.related_services || [], related_expertise: editing.related_expertise || [], seo: editing.seo || {} };
    if (editing.id) {
      const { error } = await supabase.from('projects').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else { toast('Project updated successfully'); await logActivity('Updated Project', 'project', editing.id); }
    } else {
      const { data, error } = await supabase.from('projects').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Project created successfully'); await logActivity('Created Project', 'project', data.id); }
    }
    setSaving(false); setShowForm(false); setEditing(null); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('projects').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else { toast('Project deleted'); await logActivity('Deleted Project', 'project', deleteId); }
    setDeleting(false); setDeleteId(null); load();
  };

  const columns: Column<Project>[] = [
    { key: 'title', label: 'Title', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0"><FolderKanban className="w-4 h-4 text-purple-400" /></div>
        <div><p className="font-medium text-white">{row.title}</p><p className="text-xs text-slate-500">/{row.slug}</p></div>
      </div>
    ) },
    { key: 'research_area', label: 'Research Area', render: (row) => <span className="text-slate-400">{row.research_area || '—'}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: 'featured', label: 'Featured', render: (row) => row.featured ? <StatusBadge status="true" /> : <span className="text-slate-600">—</span> },
    { key: 'updated_at', label: 'Updated', sortable: true, render: (row) => <span className="text-xs text-slate-500">{new Date(row.updated_at).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Projects" description="Manage selected work and case studies" actions={<button onClick={() => { setEditing(emptyProject); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Project</button>} />
      {items.length === 0 && !loading ? <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first case study or selected work." action={<button onClick={() => { setEditing(emptyProject); setShowForm(true); }} className="btn btn-primary"><Plus className="h-4 w-4" /> Add Project</button>} /> : <DataTable data={items} columns={columns} loading={loading} onEdit={(row) => { setEditing(row); setShowForm(true); }} onDelete={(row) => setDeleteId(row.id)} searchFields={['title', 'slug', 'research_area']} searchPlaceholder="Search projects..." />}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing?.id ? 'Edit Project' : 'New Project'} size="xl">
        {editing && (
          <div className="space-y-4">
            <FormSection title="Basic Information">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Project Title" required><input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} className="input" placeholder="Targeted Nanocarrier Systems" /></Field>
                <Field label="Slug" required><input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} className="input" placeholder="targeted-nanocarrier-systems" /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Project Type"><input value={editing.project_type || ''} onChange={(e) => setEditing({ ...editing, project_type: e.target.value })} className="input" placeholder="Research Project" /></Field>
                <Field label="Research Area"><input value={editing.research_area || ''} onChange={(e) => setEditing({ ...editing, research_area: e.target.value })} className="input" placeholder="Cancer / Nanotechnology" /></Field>
              </div>
              <Field label="Short Summary"><textarea value={editing.short_summary || ''} onChange={(e) => setEditing({ ...editing, short_summary: e.target.value })} className="input min-h-[80px]" placeholder="Brief summary..." /></Field>
            </FormSection>
            <FormSection title="Detailed Content">
              <ImageUploadField label="Featured project image" category="Projects" value={editing.featured_image?.url || null} onChange={(url) => setEditing({ ...editing, featured_image: { url, alt: editing.title || '' } })} />
              <Field label="Full Overview"><textarea value={editing.full_overview || ''} onChange={(e) => setEditing({ ...editing, full_overview: e.target.value })} className="input min-h-[120px]" placeholder="Complete project overview..." /></Field>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Scientific Context"><textarea value={editing.scientific_context || ''} onChange={(e) => setEditing({ ...editing, scientific_context: e.target.value })} className="input min-h-[80px]" /></Field>
                <Field label="Challenge"><textarea value={editing.challenge || ''} onChange={(e) => setEditing({ ...editing, challenge: e.target.value })} className="input min-h-[80px]" /></Field>
              </div>
              <Field label="Contribution"><textarea value={editing.contribution || ''} onChange={(e) => setEditing({ ...editing, contribution: e.target.value })} className="input min-h-[80px]" /></Field>
              <Field label="Outcome"><textarea value={editing.outcome || ''} onChange={(e) => setEditing({ ...editing, outcome: e.target.value })} className="input min-h-[80px]" /></Field>
            </FormSection>
            <FormSection title="Workflow & Deliverables">
              <StringListEditor label="Workflow Steps" value={editing.workflow || []} onChange={(workflow) => setEditing({ ...editing, workflow })} placeholder="Workflow step..." />
              <div className="mt-4"><StringListEditor label="Deliverables" value={editing.deliverables || []} onChange={(deliverables) => setEditing({ ...editing, deliverables })} placeholder="Deliverable..." /></div>
              <div className="mt-4"><StringListEditor label="References" value={editing.ref_list || []} onChange={(ref_list) => setEditing({ ...editing, ref_list })} placeholder="Reference..." /></div>
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
      <ConfirmDialog open={!!deleteId} title="Delete Project?" message="This action cannot be undone. The project will be permanently removed." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

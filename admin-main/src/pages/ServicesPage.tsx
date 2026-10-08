import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Briefcase, Loader2 } from 'lucide-react';
import { createBackendDataClient } from '@/lib/backendData';
import type { Service } from '@/lib/types';
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui';
import { DataTable, type Column } from '@/components/DataTable';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field, CharCounter, StringListEditor, ImageUploadField } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';
import { slugify } from '@/lib/utils';

const emptyService: Partial<Service> = {
  name: '',
  slug: '',
  short_description: '',
  full_description: '',
  icon: '',
  featured_image: null,
  gallery: [],
  benefits: [],
  process: [],
  deliverables: [],
  cta_text: '',
  cta_url: '',
  display_order: 0,
  featured: false,
  status: 'draft',
};

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await createBackendDataClient()
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) toast('Failed to load services', 'error');
    else setServices(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
    if (searchParams.get('action') === 'new') {
      setEditing(emptyService);
      setShowForm(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [load]);

  const handleSave = async (publish = false) => {
    if (!editing) return;
    if (!editing.name || !editing.slug) {
      toast('Name and slug are required', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...editing,
      status: publish ? 'published' : editing.status || 'draft',
      benefits: editing.benefits || [],
      process: editing.process || [],
      deliverables: editing.deliverables || [],
      gallery: editing.gallery || [],
      seo: editing.seo || {},
    };

    if (editing.id) {
      const { error } = await createBackendDataClient().from('services').update(payload).eq('id', editing.id);
      if (error) toast(error.message, 'error');
      else {
        toast('Service updated successfully');
        await logActivity('Updated Service', 'service', editing.id);
      }
    } else {
      const { data, error } = await createBackendDataClient().from('services').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else {
        toast('Service created successfully');
        await logActivity('Created Service', 'service', data.id);
      }
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await createBackendDataClient().from('services').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else {
      toast('Service deleted');
      await logActivity('Deleted Service', 'service', deleteId);
    }
    setDeleting(false);
    setDeleteId(null);
    load();
  };

  const handleDuplicate = async (row: Service) => {
    const { id, created_at, updated_at, ...rest } = row;
    const { data, error } = await createBackendDataClient()
      .from('services')
      .insert({ ...rest, name: `${row.name} (Copy)`, slug: `${row.slug}-copy`, status: 'draft' })
      .select()
      .single();
    if (error) toast(error.message, 'error');
    else {
      toast('Service duplicated');
      await logActivity('Duplicated Service', 'service', data.id);
      load();
    }
  };

  const columns: Column<Service>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <p className="font-medium text-white">{row.name}</p>
            <p className="text-xs text-slate-500">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'short_description',
      label: 'Description',
      render: (row) => <p className="text-slate-400 truncate max-w-xs">{row.short_description || '—'}</p>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => (row.featured ? <StatusBadge status="true" /> : <span className="text-slate-600">—</span>),
    },
    {
      key: 'display_order',
      label: 'Order',
      sortable: true,
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-500">{new Date(row.updated_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage scientific writing services"
        actions={
          <button
            onClick={() => { setEditing(emptyService); setShowForm(true); }}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        }
      />

      {services.length === 0 && !loading ? (
        <EmptyState
          icon={Briefcase}
          title="No services yet"
          description="Create your first scientific writing service to get started."
          action={
            <button onClick={() => { setEditing(emptyService); setShowForm(true); }} className="btn btn-primary">
              <Plus className="h-4 w-4" /> Add Service
            </button>
          }
        />
      ) : (
        <DataTable
          data={services}
          columns={columns}
          loading={loading}
          onEdit={(row) => { setEditing(row); setShowForm(true); }}
          onDelete={(row) => setDeleteId(row.id)}
          onDuplicate={handleDuplicate}
          searchFields={['name', 'slug', 'short_description']}
          searchPlaceholder="Search services..."
        />
      )}

      {/* Edit/Create Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing?.id ? 'Edit Service' : 'New Service'}
        size="xl"
      >
        {editing && (
          <div className="space-y-4">
            <FormSection title="Basic Information">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Service Name" required>
                  <input
                    value={editing.name || ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.slug || slugify(e.target.value) })}
                    className="input"
                    placeholder="Scientific Writing"
                  />
                </Field>
                <Field label="Slug" required hint="URL-friendly identifier">
                  <input
                    value={editing.slug || ''}
                    onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                    className="input"
                    placeholder="scientific-writing"
                  />
                </Field>
              </div>
              <Field label="Short Description" hint="Brief summary shown in lists">
                <input
                  value={editing.short_description || ''}
                  onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                  className="input"
                  placeholder="Professional scientific manuscript writing..."
                />
                <CharCounter value={editing.short_description || ''} max={150} />
              </Field>
              <Field label="Full Description">
                <textarea
                  value={editing.full_description || ''}
                  onChange={(e) => setEditing({ ...editing, full_description: e.target.value })}
                  className="input min-h-[120px] resize-y"
                  placeholder="Detailed description of the service..."
                />
              </Field>
              <Field label="Icon" hint="Lucide icon name (e.g. 'flask-conical')">
                <input
                  value={editing.icon || ''}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                  className="input"
                  placeholder="flask-conical"
                />
              </Field>
              <ImageUploadField
                label="Featured Image"
                category="Services"
                value={typeof editing.featured_image === 'object' && editing.featured_image ? editing.featured_image.url : null}
                onChange={(url) => setEditing({ ...editing, featured_image: { url, alt: editing.name || 'Service image' } })}
              />
            </FormSection>

            <FormSection title="Content">
              <StringListEditor
                label="Benefits"
                value={editing.benefits || []}
                onChange={(benefits) => setEditing({ ...editing, benefits })}
                placeholder="Benefit description..."
              />
              <div className="mt-4">
                <StringListEditor
                  label="Process Steps"
                  value={editing.process || []}
                  onChange={(process) => setEditing({ ...editing, process })}
                  placeholder="Process step..."
                />
              </div>
              <div className="mt-4">
                <StringListEditor
                  label="Deliverables"
                  value={editing.deliverables || []}
                  onChange={(deliverables) => setEditing({ ...editing, deliverables })}
                  placeholder="Deliverable..."
                />
              </div>
            </FormSection>

            <FormSection title="Call to Action">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="CTA Text">
                  <input
                    value={editing.cta_text || ''}
                    onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })}
                    className="input"
                    placeholder="Get Started"
                  />
                </Field>
                <Field label="CTA URL">
                  <input
                    value={editing.cta_url || ''}
                    onChange={(e) => setEditing({ ...editing, cta_url: e.target.value })}
                    className="input"
                    placeholder="/contact"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Publishing">
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Display Order">
                  <input
                    type="number"
                    value={editing.display_order ?? 0}
                    onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
                </Field>
                <Field label="Featured">
                  <select
                    value={editing.featured ? 'true' : 'false'}
                    onChange={(e) => setEditing({ ...editing, featured: e.target.value === 'true' })}
                    className="input"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={editing.status || 'draft'}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as 'draft' | 'published' | 'archived' })}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>
              </div>
            </FormSection>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleSave(false)} disabled={saving} className="btn btn-secondary">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Draft
              </button>
              <button onClick={() => handleSave(true)} disabled={saving} className="btn btn-primary">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Service?"
        message="This action cannot be undone. The service will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}

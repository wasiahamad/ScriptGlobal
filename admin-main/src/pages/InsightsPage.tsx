import { useEffect, useState } from 'react';
import { FileText, Plus, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { PageHeader, EmptyState } from '@/components/ui';
import { FormSection, Field, ImageUploadField } from '@/components/Form';
import { useToast } from '@/lib/toast';

type BlogPost = Record<string, unknown> & { id?: string };

function normalizePost(value: Record<string, unknown>): BlogPost {
  return {
    ...value,
    id: String(value._id || value.id || ''),
    featured_image: value.featuredImage || value.featured_image || '',
    seo_title: value.seoTitle || value.seo_title || '',
    meta_description: value.metaDescription || value.meta_description || '',
    canonical_url: value.canonicalUrl || value.canonical_url || '',
    published_at: value.publishedAt || value.published_at || null,
  };
}

function serializePost(post: BlogPost) {
  const { id: _id, featured_image, seo_title, meta_description, canonical_url, published_at: _publishedAt, ...rest } = post;
  return {
    ...rest,
    featuredImage: featured_image || '',
    seoTitle: seo_title || '',
    metaDescription: meta_description || '',
    canonicalUrl: canonical_url || '',
  };
}

const emptyPost: BlogPost = {
  title: '', slug: '', excerpt: '', content: '', author: '', category: '',
  featured_image: '', seo_title: '', meta_description: '', canonical_url: '',
  status: 'draft',
};

export default function InsightsPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Record<string, unknown>[]>('/api/v1/admin/blog-posts?limit=100');
      setPosts(data.map(normalizePost));
    }
    catch (error) { toast(error instanceof Error ? error.message : 'Unable to load Insights', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title || !editing.slug) { toast('Title and slug are required', 'error'); return; }
    setSaving(true);
    try {
      const path = editing.id ? `/api/v1/admin/blog-posts/${editing.id}` : '/api/v1/admin/blog-posts';
      await apiRequest(path, { method: editing.id ? 'PUT' : 'POST', body: JSON.stringify(serializePost(editing)) });
      toast('Insight saved successfully');
      setEditing(null);
      await load();
    } catch (error) { toast(error instanceof Error ? error.message : 'Unable to save Insight', 'error'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    try { await apiRequest(`/api/v1/admin/blog-posts/${id}`, { method: 'DELETE' }); toast('Insight deleted'); await load(); }
    catch (error) { toast(error instanceof Error ? error.message : 'Unable to delete Insight', 'error'); }
  };

  const update = (key: string, value: unknown) => setEditing((current) => current ? { ...current, [key]: value } : current);

  return (
    <div>
      <PageHeader title="Insights" description="Manage published scientific writing and research articles" actions={<button onClick={() => setEditing({ ...emptyPost })} className="btn btn-primary"><Plus className="h-4 w-4" /> New Insight</button>} />
      {editing && (
        <div className="space-y-4 mb-6">
          <FormSection title="Article Information">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Title"><input value={String(editing.title || '')} onChange={(event) => update('title', event.target.value)} className="input" /></Field>
              <Field label="Slug"><input value={String(editing.slug || '')} onChange={(event) => update('slug', event.target.value)} className="input" /></Field>
              <Field label="Author"><input value={String(editing.author || '')} onChange={(event) => update('author', event.target.value)} className="input" /></Field>
              <Field label="Category"><input value={String(editing.category || '')} onChange={(event) => update('category', event.target.value)} className="input" /></Field>
              <ImageUploadField
                label="Featured image"
                category="Insights"
                value={String(editing.featured_image || '') || null}
                onChange={(url) => update('featured_image', url)}
              />
              <Field label="Status"><select value={String(editing.status || 'draft')} onChange={(event) => update('status', event.target.value)} className="input"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
            </div>
            <Field label="Excerpt"><textarea value={String(editing.excerpt || '')} onChange={(event) => update('excerpt', event.target.value)} className="input min-h-[90px]" /></Field>
            <Field label="Article content"><textarea value={String(editing.content || '')} onChange={(event) => update('content', event.target.value)} className="input min-h-[260px]" /></Field>
          </FormSection>
          <FormSection title="SEO">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="SEO title"><input value={String(editing.seo_title || '')} onChange={(event) => update('seo_title', event.target.value)} className="input" /></Field>
              <Field label="Canonical URL"><input value={String(editing.canonical_url || '')} onChange={(event) => update('canonical_url', event.target.value)} className="input" /></Field>
            </div>
            <Field label="Meta description"><textarea value={String(editing.meta_description || '')} onChange={(event) => update('meta_description', event.target.value)} className="input min-h-[80px]" /></Field>
          </FormSection>
          <div className="flex gap-2"><button onClick={save} disabled={saving} className="btn btn-primary"><Save className="h-4 w-4" /> Save Insight</button><button onClick={() => setEditing(null)} className="btn btn-secondary">Cancel</button></div>
        </div>
      )}
      {loading ? <div className="text-slate-500 py-12 text-center">Loading Insights...</div> : posts.length === 0 ? <EmptyState title="No Insights yet" description="Create the first scientific writing insight." icon={FileText} /> : <div className="space-y-3">{posts.map((post) => <div key={String(post.id)} className="card p-4 flex items-center justify-between gap-4"><div><h3 className="font-semibold text-white">{String(post.title)}</h3><p className="text-xs text-slate-500">/{String(post.slug)} · {String(post.status || 'draft')}</p></div><div className="flex gap-2"><button onClick={() => setEditing({ ...post })} className="btn btn-secondary">Edit</button><button onClick={() => post.id && remove(post.id)} className="btn btn-ghost text-red-400"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Upload, Search, Trash2, Copy, ImageIcon, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MediaItem } from '@/lib/types';
import { PageHeader, EmptyState } from '@/components/ui';
import { ConfirmDialog, Modal } from '@/components/Modal';
import { FormSection, Field } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';
import { formatFileSize, formatDate } from '@/lib/utils';
import { apiUpload } from '@/lib/apiClient';

const mediaCategories = ['Hero', 'Profile', 'Services', 'Research', 'Projects', 'Scientific Visuals', 'Expertise', 'General'];

export default function MediaLibraryPage() {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    if (error) toast('Failed to load media', 'error');
    else setItems(data ?? []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) { toast(`${file.name} is not an image`, 'error'); continue; }
      if (file.size > 10 * 1024 * 1024) { toast(`${file.name} exceeds 10MB limit`, 'error'); continue; }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'General');
      try {
        const record = await apiUpload<MediaItem>('/api/v1/admin/media', formData);
        await logActivity('Uploaded Media', 'media', record.id);
      } catch (error) {
        toast(error instanceof Error ? error.message : 'Media upload failed', 'error');
      }
    }
    setUploading(false);
    toast('Upload complete');
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const item = items.find((i) => i.id === deleteId);
    setDeleting(true);
    const { error } = await supabase.from('media').delete().eq('id', deleteId);
    if (error) toast(error.message, 'error');
    else { toast('Media deleted'); await logActivity('Deleted Media', 'media', deleteId); }
    setDeleting(false); setDeleteId(null); load();
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from('media').update({
      alt_text: editing.alt_text,
      caption: editing.caption,
      category: editing.category,
      filename: editing.filename,
    }).eq('id', editing.id);
    if (error) toast(error.message, 'error');
    else { toast('Media updated'); await logActivity('Updated Media', 'media', editing.id); }
    setSaving(false); setEditing(null); load();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast('URL copied to clipboard');
  };

  const filtered = items.filter((item) => {
    const matchesSearch = !search || item.filename.toLowerCase().includes(search.toLowerCase()) || item.alt_text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <PageHeader title="Media Library" description="Upload and manage images for the public website" actions={
        <label className="btn btn-primary cursor-pointer">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
        </label>
      } />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className="input pl-10" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input max-w-xs">
          <option>All</option>
          {mediaCategories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 && !loading ? <EmptyState icon={ImageIcon} title="No media found" description="Upload images to use across the public website." /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-slate-800/50 animate-pulse" />) : filtered.map((item) => (
            <div key={item.id} className="group relative card overflow-hidden">
              <div className="aspect-square bg-slate-800 overflow-hidden">
                <img src={item.secure_url} alt={item.alt_text || item.filename} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-2">
                <p className="text-xs text-slate-300 truncate">{item.filename}</p>
                <p className="text-xs text-slate-500">{formatFileSize(item.size)} · {item.format.toUpperCase()}</p>
              </div>
              <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button onClick={() => setEditing(item)} className="btn btn-secondary text-xs w-full">Edit</button>
                <button onClick={() => copyUrl(item.secure_url)} className="btn btn-secondary text-xs w-full"><Copy className="h-3 w-3" /> Copy URL</button>
                <button onClick={() => setDeleteId(item.id)} className="btn btn-danger text-xs w-full"><Trash2 className="h-3 w-3" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Media" size="md">
        {editing && (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-slate-800">
              <img src={editing.secure_url} alt={editing.alt_text} className="w-full max-h-48 object-contain" />
            </div>
            <FormSection title="Details">
              <Field label="Filename"><input value={editing.filename} onChange={(e) => setEditing({ ...editing, filename: e.target.value })} className="input" /></Field>
              <Field label="Alt Text" required hint="Describe the image for accessibility and SEO"><textarea value={editing.alt_text} onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })} className="input min-h-[60px]" placeholder="Scientific illustration of nanoparticle drug delivery..." /></Field>
              <Field label="Caption"><input value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} className="input" /></Field>
              <Field label="Category"><select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input">{mediaCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <div className="text-xs text-slate-500 mt-2">
                <p>Size: {formatFileSize(editing.size)} · Format: {editing.format.toUpperCase()}</p>
                <p>Uploaded: {formatDate(editing.created_at)}</p>
              </div>
            </FormSection>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} className="btn btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Delete Media?" message="This will permanently remove the image from storage." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

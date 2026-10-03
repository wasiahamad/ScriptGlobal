import { useEffect, useState, useCallback } from 'react';
import { Save, Loader2, Search, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SEOSettings } from '@/lib/types';
import { PageHeader } from '@/components/ui';
import { FormSection, Field, CharCounter } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';

const seoPages = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'services', label: 'Services' },
  { key: 'expertise', label: 'Expertise' },
  { key: 'research', label: 'Research' },
  { key: 'publications', label: 'Publications' },
  { key: 'projects', label: 'Projects' },
  { key: 'scientific_visuals', label: 'Scientific Visuals' },
  { key: 'thesis', label: 'Thesis & Dissertation' },
  { key: 'editing', label: 'Editing & Originality' },
  { key: 'publication_support', label: 'Publication Support' },
  { key: 'peer_review', label: 'Peer Review' },
  { key: 'research_integrity', label: 'Research Integrity' },
  { key: 'faq', label: 'FAQ' },
  { key: 'contact', label: 'Contact' },
];

export default function PageSEOPage() {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [selectedPage, setSelectedPage] = useState('home');
  const [settings, setSettings] = useState<Partial<SEOSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('seo_settings').select('*').eq('page_key', selectedPage).maybeSingle();
    if (data) setSettings(data);
    else setSettings({ page_key: selectedPage });
    setLoading(false);
  }, [selectedPage]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...settings, page_key: selectedPage };
    if (settings.id) {
      const { error } = await supabase.from('seo_settings').update(payload).eq('id', settings.id);
      if (error) toast(error.message, 'error');
      else { toast('SEO settings saved'); await logActivity('Updated Page SEO', 'seo', settings.id, selectedPage); }
    } else {
      const { data, error } = await supabase.from('seo_settings').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else { toast('SEO settings saved'); await logActivity('Created Page SEO', 'seo', data.id, selectedPage); }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Page SEO" description="Edit SEO metadata for individual pages" actions={<button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</button>} />

      <div className="mb-4">
        <label className="label">Select Page</label>
        <select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)} className="input max-w-xs">
          {seoPages.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        <FormSection title="Meta Tags">
          <Field label="SEO Title" hint="Recommended: 50-60 characters"><input value={settings.seo_title || ''} onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })} className="input" /><CharCounter value={settings.seo_title || ''} max={60} /></Field>
          <Field label="Meta Description" hint="Recommended: 140-160 characters"><textarea value={settings.meta_description || ''} onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })} className="input min-h-[80px]" /><CharCounter value={settings.meta_description || ''} max={160} /></Field>
          <Field label="Canonical URL"><input value={settings.canonical_url || ''} onChange={(e) => setSettings({ ...settings, canonical_url: e.target.value })} className="input" placeholder="https://sciscript.com/about" /></Field>
          <Field label="Robots"><input value={settings.robots || 'index, follow'} onChange={(e) => setSettings({ ...settings, robots: e.target.value })} className="input" /></Field>
        </FormSection>
        <FormSection title="Open Graph">
          <Field label="OG Title"><input value={settings.og_title || ''} onChange={(e) => setSettings({ ...settings, og_title: e.target.value })} className="input" /></Field>
          <Field label="OG Description"><textarea value={settings.og_description || ''} onChange={(e) => setSettings({ ...settings, og_description: e.target.value })} className="input min-h-[60px]" /></Field>
        </FormSection>
        <FormSection title="Twitter Card">
          <Field label="Twitter Title"><input value={settings.twitter_title || ''} onChange={(e) => setSettings({ ...settings, twitter_title: e.target.value })} className="input" /></Field>
          <Field label="Twitter Description"><textarea value={settings.twitter_description || ''} onChange={(e) => setSettings({ ...settings, twitter_description: e.target.value })} className="input min-h-[60px]" /></Field>
        </FormSection>
        <FormSection title="Structured Data">
          <Field label="Schema JSON-LD" hint="Optional JSON-LD structured data"><textarea value={settings.schema_jsonld ? JSON.stringify(settings.schema_jsonld, null, 2) : ''} onChange={(e) => { try { setSettings({ ...settings, schema_jsonld: e.target.value ? JSON.parse(e.target.value) : null }); } catch { /* invalid JSON, keep as-is */ } }} className="input min-h-[120px] font-mono text-xs" placeholder='{"@context":"https://schema.org","@type":"Organization",...}' /></Field>
        </FormSection>
      </div>
    </div>
  );
}

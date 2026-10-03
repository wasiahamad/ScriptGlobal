import { useEffect, useState, useCallback } from 'react';
import { Save, Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SEOSettings } from '@/lib/types';
import { PageHeader } from '@/components/ui';
import { FormSection, Field, CharCounter } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';

const seoPages = ['home', 'about', 'services', 'expertise', 'research', 'publications', 'projects', 'scientific_visuals', 'thesis', 'editing', 'publication_support', 'peer_review', 'research_integrity', 'faq', 'contact'];

export default function GlobalSEOPage() {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [settings, setSettings] = useState<Partial<SEOSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('seo_settings').select('*').eq('page_key', 'home').maybeSingle();
    if (data) setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...settings, page_key: 'home' };
    if (settings.id) {
      const { error } = await supabase.from('seo_settings').update(payload).eq('id', settings.id);
      if (error) toast(error.message, 'error');
      else { toast('SEO settings saved'); await logActivity('Updated SEO', 'seo', settings.id); }
    } else {
      const { data, error } = await supabase.from('seo_settings').insert(payload).select().single();
      if (error) toast(error.message, 'error');
      else { toast('SEO settings saved'); await logActivity('Created SEO', 'seo', data.id); }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Global SEO" description="Default SEO settings applied across the website" actions={<button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</button>} />
      <div className="space-y-4">
        <FormSection title="Meta Tags">
          <Field label="Default SEO Title" hint="Recommended: 50-60 characters"><input value={settings.seo_title || ''} onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })} className="input" placeholder="SciScript - Global Scientific Writing Services" /><CharCounter value={settings.seo_title || ''} max={60} /></Field>
          <Field label="Default Meta Description" hint="Recommended: 140-160 characters"><textarea value={settings.meta_description || ''} onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })} className="input min-h-[80px]" placeholder="Professional scientific writing, editing, and publication support services..." /><CharCounter value={settings.meta_description || ''} max={160} /></Field>
          <Field label="Default Robots Directive"><input value={settings.robots || 'index, follow'} onChange={(e) => setSettings({ ...settings, robots: e.target.value })} className="input" /></Field>
        </FormSection>
        <FormSection title="Open Graph Defaults">
          <Field label="OG Title"><input value={settings.og_title || ''} onChange={(e) => setSettings({ ...settings, og_title: e.target.value })} className="input" /></Field>
          <Field label="OG Description"><textarea value={settings.og_description || ''} onChange={(e) => setSettings({ ...settings, og_description: e.target.value })} className="input min-h-[60px]" /></Field>
        </FormSection>
        <FormSection title="Twitter Card Defaults">
          <Field label="Twitter Title"><input value={settings.twitter_title || ''} onChange={(e) => setSettings({ ...settings, twitter_title: e.target.value })} className="input" /></Field>
          <Field label="Twitter Description"><textarea value={settings.twitter_description || ''} onChange={(e) => setSettings({ ...settings, twitter_description: e.target.value })} className="input min-h-[60px]" /></Field>
        </FormSection>
      </div>
    </div>
  );
}

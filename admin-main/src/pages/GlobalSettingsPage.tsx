import { useEffect, useState, useCallback } from 'react';
import { Save, Loader2, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { GlobalSettings } from '@/lib/types';
import { PageHeader } from '@/components/ui';
import { FormSection, Field } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';

export default function GlobalSettingsPage() {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [settings, setSettings] = useState<Partial<GlobalSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('global_settings').select('*').limit(1).maybeSingle();
    if (data) setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    if (settings.id) {
      const { error } = await supabase.from('global_settings').update(settings).eq('id', settings.id);
      if (error) toast(error.message, 'error');
      else { toast('Global settings saved'); await logActivity('Updated Global Settings', 'settings', settings.id); }
    } else {
      const { data, error } = await supabase.from('global_settings').insert(settings).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Global settings saved'); await logActivity('Created Global Settings', 'settings', data.id); }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Global Settings" description="Manage website-wide configuration" actions={<button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</button>} />
      <div className="space-y-4">
        <FormSection title="General">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Website Name"><input value={settings.website_name || ''} onChange={(e) => setSettings({ ...settings, website_name: e.target.value })} className="input" placeholder="SciScript" /></Field>
            <Field label="Tagline"><input value={settings.tagline || ''} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="input" placeholder="Global Scientific Writing Services" /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="Default Language"><input value={settings.default_language || 'en'} onChange={(e) => setSettings({ ...settings, default_language: e.target.value })} className="input" /></Field>
            <Field label="Timezone"><input value={settings.timezone || ''} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="input" placeholder="UTC" /></Field>
          </div>
        </FormSection>
        <FormSection title="Branding">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Primary Color"><input value={settings.primary_color || ''} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} className="input" placeholder="#0f766e" /></Field>
            <Field label="Accent Color"><input value={settings.accent_color || ''} onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })} className="input" placeholder="#14b8a6" /></Field>
          </div>
        </FormSection>
        <FormSection title="Social Links">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="LinkedIn"><input value={(settings.social as Record<string, string>)?.linkedin || ''} onChange={(e) => setSettings({ ...settings, social: { ...(settings.social as Record<string, string> || {}), linkedin: e.target.value } })} className="input" /></Field>
            <Field label="ORCID"><input value={(settings.social as Record<string, string>)?.orcid || ''} onChange={(e) => setSettings({ ...settings, social: { ...(settings.social as Record<string, string> || {}), orcid: e.target.value } })} className="input" /></Field>
            <Field label="Google Scholar"><input value={(settings.social as Record<string, string>)?.google_scholar || ''} onChange={(e) => setSettings({ ...settings, social: { ...(settings.social as Record<string, string> || {}), google_scholar: e.target.value } })} className="input" /></Field>
          </div>
        </FormSection>
        <FormSection title="Analytics" description="IDs only — secret keys are never exposed in frontend">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Google Analytics ID"><input value={(settings.analytics as Record<string, string>)?.google_analytics_id || ''} onChange={(e) => setSettings({ ...settings, analytics: { ...(settings.analytics as Record<string, string> || {}), google_analytics_id: e.target.value } })} className="input" placeholder="G-XXXXXXX" /></Field>
            <Field label="Search Console Verification"><input value={(settings.analytics as Record<string, string>)?.search_console || ''} onChange={(e) => setSettings({ ...settings, analytics: { ...(settings.analytics as Record<string, string> || {}), search_console: e.target.value } })} className="input" /></Field>
          </div>
        </FormSection>
      </div>
    </div>
  );
}

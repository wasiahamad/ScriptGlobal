import { useEffect, useState, useCallback } from 'react';
import { Save, Loader2, Globe } from 'lucide-react';
import { createBackendDataClient } from '@/lib/backendData';
import type { FooterSettings } from '@/lib/types';
import { PageHeader } from '@/components/ui';
import { FormSection, Field } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';

export default function FooterPage() {
  const supabase = createBackendDataClient();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [settings, setSettings] = useState<Partial<FooterSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('footer_settings').select('*').limit(1).maybeSingle();
    if (data) setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    if (settings.id) {
      const { error } = await supabase.from('footer_settings').update(settings).eq('id', settings.id);
      if (error) toast(error.message, 'error');
      else { toast('Footer settings saved'); await logActivity('Updated Footer', 'footer', settings.id); }
    } else {
      const { data, error } = await supabase.from('footer_settings').insert(settings).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Footer settings saved'); await logActivity('Created Footer', 'footer', data.id); }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Footer" description="Manage the public website footer" actions={<button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</button>} />
      <div className="space-y-4">
        <FormSection title="Footer Brand">
          <Field label="Brand Name"><input value={settings.brand_name || ''} onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })} className="input" placeholder="SciScript" /></Field>
          <Field label="Description"><textarea value={settings.description || ''} onChange={(e) => setSettings({ ...settings, description: e.target.value })} className="input min-h-[80px]" placeholder="Global Scientific Writing Services" /></Field>
          <Field label="Copyright Text"><input value={settings.copyright_text || ''} onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })} className="input" placeholder="© 2026 SciScript. All rights reserved." /></Field>
        </FormSection>
        <FormSection title="Social Links">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="LinkedIn"><input value={(settings.social_links as Record<string, string>)?.linkedin || ''} onChange={(e) => setSettings({ ...settings, social_links: { ...(settings.social_links as Record<string, string> || {}), linkedin: e.target.value } })} className="input" /></Field>
            <Field label="ORCID"><input value={(settings.social_links as Record<string, string>)?.orcid || ''} onChange={(e) => setSettings({ ...settings, social_links: { ...(settings.social_links as Record<string, string> || {}), orcid: e.target.value } })} className="input" /></Field>
          </div>
          <Field label="Google Scholar"><input value={(settings.social_links as Record<string, string>)?.google_scholar || ''} onChange={(e) => setSettings({ ...settings, social_links: { ...(settings.social_links as Record<string, string> || {}), google_scholar: e.target.value } })} className="input" /></Field>
        </FormSection>
        <FormSection title="Contact Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email"><input value={(settings.contact as Record<string, string>)?.email || ''} onChange={(e) => setSettings({ ...settings, contact: { ...(settings.contact as Record<string, string> || {}), email: e.target.value } })} className="input" /></Field>
            <Field label="Phone"><input value={(settings.contact as Record<string, string>)?.phone || ''} onChange={(e) => setSettings({ ...settings, contact: { ...(settings.contact as Record<string, string> || {}), phone: e.target.value } })} className="input" /></Field>
          </div>
          <Field label="Location"><input value={(settings.contact as Record<string, string>)?.location || ''} onChange={(e) => setSettings({ ...settings, contact: { ...(settings.contact as Record<string, string> || {}), location: e.target.value } })} className="input" /></Field>
        </FormSection>
        <FormSection title="Legal Links">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Privacy Policy URL"><input value={(settings.legal as Record<string, string>)?.privacy || ''} onChange={(e) => setSettings({ ...settings, legal: { ...(settings.legal as Record<string, string> || {}), privacy: e.target.value } })} className="input" placeholder="/privacy" /></Field>
            <Field label="Terms & Conditions URL"><input value={(settings.legal as Record<string, string>)?.terms || ''} onChange={(e) => setSettings({ ...settings, legal: { ...(settings.legal as Record<string, string> || {}), terms: e.target.value } })} className="input" placeholder="/terms" /></Field>
          </div>
          <Field label="Privacy Policy Content"><textarea value={(settings.legal as Record<string, string>)?.privacy_content || ''} onChange={(e) => setSettings({ ...settings, legal: { ...(settings.legal as Record<string, string> || {}), privacy_content: e.target.value } })} className="input min-h-[180px]" placeholder="Privacy policy content shown on the public Privacy page" /></Field>
          <Field label="Terms & Conditions Content"><textarea value={(settings.legal as Record<string, string>)?.terms_content || ''} onChange={(e) => setSettings({ ...settings, legal: { ...(settings.legal as Record<string, string> || {}), terms_content: e.target.value } })} className="input min-h-[180px]" placeholder="Terms and conditions shown on the public Terms page" /></Field>
        </FormSection>
      </div>
    </div>
  );
}

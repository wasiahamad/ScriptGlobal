import { useEffect, useState, useCallback } from 'react';
import { Save, Loader2, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ContactSettings } from '@/lib/types';
import { PageHeader } from '@/components/ui';
import { FormSection, Field } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';

export default function ContactPage() {
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [settings, setSettings] = useState<Partial<ContactSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('contact_settings').select('*').limit(1).maybeSingle();
    if (data) setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    if (settings.id) {
      const { error } = await supabase.from('contact_settings').update(settings).eq('id', settings.id);
      if (error) toast(error.message, 'error');
      else { toast('Contact settings saved'); await logActivity('Updated Contact', 'contact', settings.id); }
    } else {
      const { data, error } = await supabase.from('contact_settings').insert(settings).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Contact settings saved'); await logActivity('Created Contact', 'contact', data.id); }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Contact Information" description="Centralized contact settings — auto-populates contact page, footer, and structured data" actions={<button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</button>} />
      <div className="space-y-4">
        <FormSection title="Professional Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Professional Name"><input value={settings.professional_name || ''} onChange={(e) => setSettings({ ...settings, professional_name: e.target.value })} className="input" placeholder="Dr. Jane Doe" /></Field>
            <Field label="Role"><input value={settings.role || ''} onChange={(e) => setSettings({ ...settings, role: e.target.value })} className="input" placeholder="Scientific Writer & Editor" /></Field>
          </div>
        </FormSection>
        <FormSection title="Contact Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email"><input value={settings.email || ''} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="input" placeholder="contact@example.com" /></Field>
            <Field label="Phone"><input value={settings.phone || ''} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="input" placeholder="+1..." /></Field>
          </div>
          <Field label="Location"><input value={settings.location || ''} onChange={(e) => setSettings({ ...settings, location: e.target.value })} className="input" placeholder="City, Country" /></Field>
          <Field label="Google Maps URL"><input value={settings.google_maps_url || ''} onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })} className="input" placeholder="https://maps.google.com/..." /></Field>
        </FormSection>
        <FormSection title="Professional Links">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="LinkedIn"><input value={settings.linkedin_url || ''} onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })} className="input" /></Field>
            <Field label="ORCID"><input value={settings.orcid_url || ''} onChange={(e) => setSettings({ ...settings, orcid_url: e.target.value })} className="input" /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Field label="Google Scholar"><input value={settings.google_scholar_url || ''} onChange={(e) => setSettings({ ...settings, google_scholar_url: e.target.value })} className="input" /></Field>
            <Field label="Website"><input value={settings.website || ''} onChange={(e) => setSettings({ ...settings, website: e.target.value })} className="input" /></Field>
          </div>
        </FormSection>
      </div>
    </div>
  );
}

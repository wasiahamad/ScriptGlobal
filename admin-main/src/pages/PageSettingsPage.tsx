import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createBackendDataClient } from '@/lib/backendData';
import type { PageSettings } from '@/lib/types';
import { PageHeader } from '@/components/ui';
import { FormSection, Field, CharCounter, StringListEditor, ImageUploadField } from '@/components/Form';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';
import { apiRequest } from '@/lib/apiClient';

const pageTitles: Record<string, string> = {
  home: 'Home Page',
  about: 'About Page',
  founder: 'Founder / Profile',
  thesis: 'Thesis & Dissertation',
  editing: 'Editing & Originality',
  'publication-support': 'Publication Support',
  'peer-review': 'Peer Review',
  'research-integrity': 'Research Integrity',
};

export default function PageSettingsPage() {
  const supabase = createBackendDataClient();
  const { pageKey = 'home' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [page, setPage] = useState<PageSettings | null>(null);
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    if (pageKey === 'home' || pageKey === 'about' || pageKey === 'founder' || pageKey === 'publication-support') {
      try {
        const resource = pageKey === 'home'
          ? 'home'
          : pageKey === 'publication-support'
            ? 'publication-support'
            : 'profile';
        const data = await apiRequest<Record<string, unknown>>(`/api/v1/admin/${resource}`);
        setPage({ id: String(data._id || data.id || pageKey), page_key: pageKey, title: pageTitles[pageKey] || pageKey, content: {}, seo: {}, created_at: '', updated_at: '' });
        const metadataKeys = new Set([
          '_id', 'id', 'status', 'isActive', 'isDeleted', 'contentType', 'createdAt',
          'updatedAt', 'createdBy', 'updatedBy', 'publishedAt', 'displayOrder', 'slug', 'data',
        ]);
        const directContent = Object.fromEntries(
          Object.entries(data).filter(([key]) => !metadataKeys.has(key)),
        );
        const loaded = {
          ...directContent,
          ...((data.data as Record<string, unknown>) || {}),
        };
        if (pageKey === 'founder' && !loaded.founder) {
          setContent({ ...loaded, founder: loaded });
        } else {
          setContent(loaded);
        }
      } catch {
        setPage({ id: pageKey, page_key: pageKey, title: pageTitles[pageKey] || pageKey, content: {}, seo: {}, created_at: '', updated_at: '' });
        setContent(pageKey === 'founder' ? { founder: {} } : {});
      }
    } else {
      const { data } = await supabase.from('page_settings').select('*').eq('page_key', pageKey).maybeSingle();
      if (data) {
        setPage(data);
        setContent(data.content || {});
      } else {
        setPage(null);
        setContent({});
      }
    }
    setLoading(false);
  }, [pageKey]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    if (pageKey === 'home' || pageKey === 'about' || pageKey === 'founder' || pageKey === 'publication-support') {
      try {
        const resource = pageKey === 'home'
          ? 'home'
          : pageKey === 'publication-support'
            ? 'publication-support'
            : 'profile';
        await apiRequest(`/api/v1/admin/${resource}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'published', isActive: true, data: content }),
        });
        toast(`${pageTitles[pageKey] || pageKey} changes saved successfully`);
      } catch (error) {
        toast(error instanceof Error ? error.message : `Unable to save ${pageTitles[pageKey] || pageKey}`, 'error');
      }
    } else if (page) {
      const { error } = await supabase.from('page_settings').update({ content }).eq('id', page.id);
      if (error) toast(error.message, 'error');
      else { toast('Changes saved successfully'); await logActivity('Updated page', pageKey, page.id); }
    } else {
      const { data, error } = await supabase.from('page_settings').insert({ page_key: pageKey, title: pageTitles[pageKey] || pageKey, content }).select().single();
      if (error) toast(error.message, 'error');
      else { toast('Page created successfully'); await logActivity('Created page', pageKey, data.id); }
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" /></div>;

  const update = (key: string, value: unknown) => setContent({ ...content, [key]: value });

  return (
    <div>
      <PageHeader
        title={pageTitles[pageKey] || pageKey}
        description="Manage page content and settings"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="btn btn-secondary"><ArrowLeft className="h-4 w-4" /> Back</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes</button>
          </div>
        }
      />

      {pageKey === 'home' && <HomeEditor content={content} update={update} />}
      {pageKey === 'about' && <AboutEditor content={content} update={update} />}
      {pageKey === 'founder' && <FounderEditor content={content} update={update} />}
      {pageKey === 'thesis' && <ThesisEditor content={content} update={update} />}
      {pageKey === 'editing' && <EditingEditor content={content} update={update} />}
      {pageKey === 'publication-support' && <PublicationSupportEditor content={content} update={update} />}
      {pageKey === 'peer-review' && <PeerReviewEditor content={content} update={update} />}
      {pageKey === 'research-integrity' && <ResearchIntegrityEditor content={content} update={update} />}
    </div>
  );
}

interface EditorProps {
  content: Record<string, unknown>;
  update: (key: string, value: unknown) => void;
}

function HomeEditor({ content, update }: EditorProps) {
  const hero = (content.hero || {}) as Record<string, unknown>;
  const about = (content.about || {}) as Record<string, unknown>;
  const services = (content.services || {}) as Record<string, unknown>;
  const research = (content.research || {}) as Record<string, unknown>;
  const testimonials = (content.testimonials || {}) as Record<string, unknown>;
  const faq = (content.faq || {}) as Record<string, unknown>;
  const finalCta = (content.final_cta || {}) as Record<string, unknown>;
  const trustSignals = (content.trust_signals || []) as string[];
  const expertiseItems = (content.expertise_items || []) as Record<string, unknown>[];
  const missionText = typeof about.mission === 'string' ? about.mission : '';
  const workCovers = ((about.work_covers || []) as string[]).filter((item) => !/^our mission\s*:/i.test(item.trim()) && item.trim() !== missionText.trim());

  return (
    <div className="space-y-4">
      <FormSection title="Hero Section">
        <Field label="Eyebrow / Badge"><input value={(hero.eyebrow as string) || ''} onChange={(e) => update('hero', { ...hero, eyebrow: e.target.value })} className="input" placeholder="Scientific Writing Excellence" /></Field>
        <Field label="Main Heading"><input value={(hero.heading as string) || ''} onChange={(e) => update('hero', { ...hero, heading: e.target.value })} className="input" placeholder="Scientific Writing Services" /></Field>
        <Field label="Highlighted Heading Text"><input value={(hero.highlight as string) || ''} onChange={(e) => update('hero', { ...hero, highlight: e.target.value })} className="input" placeholder="for Researchers" /></Field>
        <Field label="Description"><textarea value={(hero.description as string) || ''} onChange={(e) => update('hero', { ...hero, description: e.target.value })} className="input min-h-[80px]" /><CharCounter value={(hero.description as string) || ''} max={200} /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Primary CTA Text"><input value={(hero.primary_cta_text as string) || ''} onChange={(e) => update('hero', { ...hero, primary_cta_text: e.target.value })} className="input" placeholder="Get Started" /></Field>
          <Field label="Primary CTA URL"><input value={(hero.primary_cta_url as string) || ''} onChange={(e) => update('hero', { ...hero, primary_cta_url: e.target.value })} className="input" placeholder="/contact" /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Secondary CTA Text"><input value={(hero.secondary_cta_text as string) || ''} onChange={(e) => update('hero', { ...hero, secondary_cta_text: e.target.value })} className="input" placeholder="View Services" /></Field>
          <Field label="Secondary CTA URL"><input value={(hero.secondary_cta_url as string) || ''} onChange={(e) => update('hero', { ...hero, secondary_cta_url: e.target.value })} className="input" placeholder="/services" /></Field>
        </div>
        <Field label="Enable Hero Section"><select value={hero.enabled === false ? 'false' : 'true'} onChange={(e) => update('hero', { ...hero, enabled: e.target.value === 'true' })} className="input"><option value="true">Enabled</option><option value="false">Disabled</option></select></Field>
      </FormSection>

      <FormSection title="Trust Signals" description="Statements shown below the Home hero">
        <StringListEditor value={trustSignals} onChange={(items) => update('trust_signals', items)} placeholder="Evidence-based approach" />
      </FormSection>

      <FormSection title="Expertise Strip" description="The repeated service labels shown below the trust bar">
        <div className="space-y-3">
          {expertiseItems.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <Field label="Label"><input value={(item.label as string) || ''} onChange={(e) => { const next = [...expertiseItems]; next[i] = { ...item, label: e.target.value }; update('expertise_items', next); }} className="input" /></Field>
              <Field label="Icon name"><input value={(item.icon as string) || ''} onChange={(e) => { const next = [...expertiseItems]; next[i] = { ...item, icon: e.target.value }; update('expertise_items', next); }} className="input" /></Field>
              <button onClick={() => update('expertise_items', expertiseItems.filter((_, index) => index !== i))} className="btn btn-ghost text-red-400 p-2">Remove</button>
            </div>
          ))}
          <button onClick={() => update('expertise_items', [...expertiseItems, { label: '', icon: '' }])} className="btn btn-secondary">+ Add Expertise Item</button>
        </div>
      </FormSection>

      <FormSection title="About Preview">
        <Field label="Eyebrow"><input value={(about.eyebrow as string) || ''} onChange={(e) => update('about', { ...about, eyebrow: e.target.value })} className="input" /></Field>
        <Field label="Heading"><input value={(about.heading as string) || ''} onChange={(e) => update('about', { ...about, heading: e.target.value })} className="input" /></Field>
        <Field label="Introduction"><textarea value={(about.intro as string) || ''} onChange={(e) => update('about', { ...about, intro: e.target.value })} className="input min-h-[80px]" /></Field>
        <Field label="Body"><textarea value={(about.body as string) || ''} onChange={(e) => update('about', { ...about, body: e.target.value })} className="input min-h-[80px]" /></Field>
        <Field label="Mission"><textarea value={(about.mission as string) || ''} onChange={(e) => update('about', { ...about, mission: e.target.value })} className="input min-h-[80px]" /></Field>
        <ImageUploadField label="About image" category="About" value={about.image_url as string} onChange={(url) => update('about', { ...about, image_url: url })} />
        <Field label="About image alt text"><input value={(about.image_alt as string) || ''} onChange={(e) => update('about', { ...about, image_alt: e.target.value })} className="input" /></Field>
        <Field label="Work covers"><StringListEditor value={workCovers} onChange={(items) => update('about', { ...about, work_covers: items })} placeholder="Research articles" /></Field>
      </FormSection>

      <FormSection title="Services Preview">
        <Field label="Eyebrow"><input value={(services.eyebrow as string) || ''} onChange={(e) => update('services', { ...services, eyebrow: e.target.value })} className="input" /></Field>
        <Field label="Heading"><input value={(services.heading as string) || ''} onChange={(e) => update('services', { ...services, heading: e.target.value })} className="input" /></Field>
        <Field label="Description"><textarea value={(services.description as string) || ''} onChange={(e) => update('services', { ...services, description: e.target.value })} className="input min-h-[80px]" /></Field>
      </FormSection>

      <FormSection title="Research Areas Preview">
        <Field label="Eyebrow"><input value={(research.eyebrow as string) || ''} onChange={(e) => update('research', { ...research, eyebrow: e.target.value })} className="input" /></Field>
        <Field label="Heading"><input value={(research.heading as string) || ''} onChange={(e) => update('research', { ...research, heading: e.target.value })} className="input" /></Field>
        <Field label="Description"><textarea value={(research.description as string) || ''} onChange={(e) => update('research', { ...research, description: e.target.value })} className="input min-h-[80px]" /></Field>
      </FormSection>

      <FormSection title="Testimonials Preview">
        <Field label="Eyebrow"><input value={(testimonials.eyebrow as string) || ''} onChange={(e) => update('testimonials', { ...testimonials, eyebrow: e.target.value })} className="input" /></Field>
        <Field label="Heading"><input value={(testimonials.heading as string) || ''} onChange={(e) => update('testimonials', { ...testimonials, heading: e.target.value })} className="input" /></Field>
        <Field label="Description"><textarea value={(testimonials.description as string) || ''} onChange={(e) => update('testimonials', { ...testimonials, description: e.target.value })} className="input min-h-[80px]" /></Field>
      </FormSection>

      <FormSection title="FAQ Preview">
        <Field label="Eyebrow"><input value={(faq.eyebrow as string) || ''} onChange={(e) => update('faq', { ...faq, eyebrow: e.target.value })} className="input" /></Field>
        <Field label="Heading"><input value={(faq.heading as string) || ''} onChange={(e) => update('faq', { ...faq, heading: e.target.value })} className="input" /></Field>
        <Field label="Description"><textarea value={(faq.description as string) || ''} onChange={(e) => update('faq', { ...faq, description: e.target.value })} className="input min-h-[80px]" /></Field>
      </FormSection>

      <FormSection title="Final CTA Section">
        <Field label="Heading"><input value={(finalCta.heading as string) || ''} onChange={(e) => update('final_cta', { ...finalCta, heading: e.target.value })} className="input" /></Field>
        <Field label="Description"><textarea value={(finalCta.description as string) || ''} onChange={(e) => update('final_cta', { ...finalCta, description: e.target.value })} className="input min-h-[80px]" /></Field>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Button Text"><input value={(finalCta.button_text as string) || ''} onChange={(e) => update('final_cta', { ...finalCta, button_text: e.target.value })} className="input" /></Field>
          <Field label="Button URL"><input value={(finalCta.button_url as string) || ''} onChange={(e) => update('final_cta', { ...finalCta, button_url: e.target.value })} className="input" /></Field>
        </div>
        <Field label="Enable Section"><select value={finalCta.enabled === false ? 'false' : 'true'} onChange={(e) => update('final_cta', { ...finalCta, enabled: e.target.value === 'true' })} className="input"><option value="true">Enabled</option><option value="false">Disabled</option></select></Field>
      </FormSection>
    </div>
  );
}

function AboutEditor({ content, update }: EditorProps) {
  const profile = (content.profile || {}) as Record<string, unknown>;
  const approach = (content.approach || {}) as Record<string, unknown>;
  const mission = (content.mission || {}) as Record<string, unknown>;
  const founder = (content.founder || {}) as Record<string, unknown>;
  const principlesSection = (content.principles_section || {}) as Record<string, unknown>;
  const capabilitiesSection = (content.capabilities_section || {}) as Record<string, unknown>;
  const workSection = (content.work_section || {}) as Record<string, unknown>;
  const cta = (content.cta || {}) as Record<string, unknown>;
  const focus = (content.focus || {}) as Record<string, unknown>;
  const contributions = (content.contributions || []) as Record<string, unknown>[];
  const principles = (content.principles || []) as Record<string, unknown>[];
  const capabilities = (content.capabilities || []) as Record<string, unknown>[];
  const workTypes = (content.work_types || []) as string[];

  return (
    <div className="space-y-4">
      <FormSection title="About Hero Section">
        <Field label="Eyebrow"><input value={(profile.eyebrow as string) || ''} onChange={(e) => update('profile', { ...profile, eyebrow: e.target.value })} className="input" placeholder="About Us" /></Field>
        <Field label="Main Heading"><input value={(profile.heading as string) || ''} onChange={(e) => update('profile', { ...profile, heading: e.target.value })} className="input" /></Field>
        <Field label="Description"><textarea value={(profile.description as string) || ''} onChange={(e) => update('profile', { ...profile, description: e.target.value })} className="input min-h-[120px]" /></Field>
      </FormSection>
      <FormSection title="Approach & Mission">
        <Field label="Approach Heading"><input value={(approach.heading as string) || ''} onChange={(e) => update('approach', { ...approach, heading: e.target.value })} className="input" placeholder="Our Approach" /></Field>
        <Field label="Approach Description"><textarea value={(approach.description as string) || ''} onChange={(e) => update('approach', { ...approach, description: e.target.value })} className="input min-h-[100px]" /></Field>
        <Field label="Mission Heading"><input value={(mission.heading as string) || ''} onChange={(e) => update('mission', { ...mission, heading: e.target.value })} className="input" placeholder="Our Mission" /></Field>
        <Field label="Mission Description"><textarea value={(mission.description as string) || ''} onChange={(e) => update('mission', { ...mission, description: e.target.value })} className="input min-h-[100px]" /></Field>
      </FormSection>
      <FormSection title="Founder / Profile Section">
        <Field label="Eyebrow"><input value={(founder.eyebrow as string) || ''} onChange={(e) => update('founder', { ...founder, eyebrow: e.target.value })} className="input" placeholder="Founder / Profile" /></Field>
        <Field label="Name"><input value={(founder.full_name as string) || ''} onChange={(e) => update('founder', { ...founder, full_name: e.target.value })} className="input" /></Field>
        <Field label="Professional Title"><input value={(founder.professional_title as string) || ''} onChange={(e) => update('founder', { ...founder, professional_title: e.target.value })} className="input" /></Field>
        <Field label="Biography"><textarea value={(founder.long_bio as string) || ''} onChange={(e) => update('founder', { ...founder, long_bio: e.target.value })} className="input min-h-[100px]" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email"><input value={(founder.email as string) || ''} onChange={(e) => update('founder', { ...founder, email: e.target.value })} className="input" /></Field>
          <Field label="Phone"><input value={(founder.phone as string) || ''} onChange={(e) => update('founder', { ...founder, phone: e.target.value })} className="input" /></Field>
        </div>
        <Field label="Location"><input value={(founder.location as string) || ''} onChange={(e) => update('founder', { ...founder, location: e.target.value })} className="input" /></Field>
        <ImageUploadField label="Profile Image" category="About" value={founder.image_url as string} onChange={(url) => update('founder', { ...founder, image_url: url })} />
        <Field label="Image Alt Text"><input value={(founder.image_alt as string) || ''} onChange={(e) => update('founder', { ...founder, image_alt: e.target.value })} className="input" /></Field>
      </FormSection>
      <FormSection title="Principles Section">
        <Field label="Heading"><input value={(principlesSection.heading as string) || ''} onChange={(e) => update('principles_section', { ...principlesSection, heading: e.target.value })} className="input" placeholder="Evidence-Based. Ethical. Author-Centered." /></Field>
        <Field label="Subtitle"><textarea value={(principlesSection.subtitle as string) || ''} onChange={(e) => update('principles_section', { ...principlesSection, subtitle: e.target.value })} className="input min-h-[70px]" /></Field>
      </FormSection>
      <FormSection title="Capabilities Section">
        <Field label="Heading"><input value={(capabilitiesSection.heading as string) || ''} onChange={(e) => update('capabilities_section', { ...capabilitiesSection, heading: e.target.value })} className="input" placeholder="What We Do" /></Field>
        <Field label="Subtitle"><textarea value={(capabilitiesSection.subtitle as string) || ''} onChange={(e) => update('capabilities_section', { ...capabilitiesSection, subtitle: e.target.value })} className="input min-h-[70px]" /></Field>
      </FormSection>
      <FormSection title="Scope of Work Section">
        <Field label="Heading"><input value={(workSection.heading as string) || ''} onChange={(e) => update('work_section', { ...workSection, heading: e.target.value })} className="input" placeholder="Document Types We Support" /></Field>
        <Field label="Subtitle"><textarea value={(workSection.subtitle as string) || ''} onChange={(e) => update('work_section', { ...workSection, subtitle: e.target.value })} className="input min-h-[70px]" /></Field>
      </FormSection>
      <FormSection title="Call to Action Section">
        <Field label="Heading"><input value={(cta.title as string) || ''} onChange={(e) => update('cta', { ...cta, title: e.target.value })} className="input" /></Field>
        <Field label="Description"><textarea value={(cta.subtitle as string) || ''} onChange={(e) => update('cta', { ...cta, subtitle: e.target.value })} className="input min-h-[80px]" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Primary Button Text"><input value={(cta.primary_label as string) || ''} onChange={(e) => update('cta', { ...cta, primary_label: e.target.value })} className="input" /></Field>
          <Field label="Primary Button URL"><input value={(cta.primary_to as string) || ''} onChange={(e) => update('cta', { ...cta, primary_to: e.target.value })} className="input" /></Field>
          <Field label="Secondary Button Text"><input value={(cta.secondary_label as string) || ''} onChange={(e) => update('cta', { ...cta, secondary_label: e.target.value })} className="input" /></Field>
          <Field label="Secondary Button URL"><input value={(cta.secondary_to as string) || ''} onChange={(e) => update('cta', { ...cta, secondary_to: e.target.value })} className="input" /></Field>
        </div>
      </FormSection>
      <FormSection title="Professional Focus">
        <Field label="Heading"><input value={(focus.heading as string) || ''} onChange={(e) => update('focus', { ...focus, heading: e.target.value })} className="input" /></Field>
        <Field label="Description"><textarea value={(focus.description as string) || ''} onChange={(e) => update('focus', { ...focus, description: e.target.value })} className="input min-h-[100px]" /></Field>
      </FormSection>
      <FormSection title="Principles" description="The evidence-based and ethical principles shown on the public About page">
        <div className="space-y-3">
          {principles.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-slate-800">
              <div className="flex-1 space-y-2">
                <input value={(item.title as string) || ''} onChange={(e) => { const next = [...principles]; next[i] = { ...item, title: e.target.value }; update('principles', next); }} className="input" placeholder="Principle title" />
                <textarea value={(item.description as string) || ''} onChange={(e) => { const next = [...principles]; next[i] = { ...item, description: e.target.value }; update('principles', next); }} className="input min-h-[60px]" placeholder="Principle description" />
              </div>
              <button onClick={() => update('principles', principles.filter((_, index) => index !== i))} className="btn btn-ghost text-red-400 p-2">Remove</button>
            </div>
          ))}
          <button onClick={() => update('principles', [...principles, { title: '', description: '' }])} className="btn btn-secondary">+ Add Principle</button>
        </div>
      </FormSection>
      <FormSection title="Capabilities" description="The capability cards shown on the public About page">
        <div className="space-y-3">
          {capabilities.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-slate-800">
              <div className="flex-1 space-y-2">
                <input value={(item.title as string) || ''} onChange={(e) => { const next = [...capabilities]; next[i] = { ...item, title: e.target.value }; update('capabilities', next); }} className="input" placeholder="Capability title" />
                <textarea value={(item.description as string) || ''} onChange={(e) => { const next = [...capabilities]; next[i] = { ...item, description: e.target.value }; update('capabilities', next); }} className="input min-h-[60px]" placeholder="Capability description" />
              </div>
              <button onClick={() => update('capabilities', capabilities.filter((_, index) => index !== i))} className="btn btn-ghost text-red-400 p-2">Remove</button>
            </div>
          ))}
          <button onClick={() => update('capabilities', [...capabilities, { title: '', description: '' }])} className="btn btn-secondary">+ Add Capability</button>
        </div>
      </FormSection>
      <FormSection title="Document Types We Support">
        <StringListEditor value={workTypes} onChange={(items) => update('work_types', items)} placeholder="Research articles" />
      </FormSection>
      <FormSection title="Contribution Philosophy" description="Add contribution items like Authored Research, Editorial Support, etc.">
        <div className="space-y-3">
          {contributions.map((item, i) => {
            const c = item;
            return (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-slate-800">
                <div className="flex-1 space-y-2">
                  <input value={(c.title as string) || ''} onChange={(e) => { const next = [...contributions]; next[i] = { ...c, title: e.target.value }; update('contributions', next); }} className="input" placeholder="Contribution title" />
                  <input value={(c.description as string) || ''} onChange={(e) => { const next = [...contributions]; next[i] = { ...c, description: e.target.value }; update('contributions', next); }} className="input" placeholder="Description" />
                </div>
                <button onClick={() => update('contributions', contributions.filter((_, idx) => idx !== i))} className="btn btn-ghost text-red-400 p-2 mt-1">Remove</button>
              </div>
            );
          })}
          <button onClick={() => update('contributions', [...contributions, { title: '', description: '', icon: '', display_order: contributions.length, active: true }])} className="btn btn-secondary">+ Add Contribution</button>
        </div>
      </FormSection>
    </div>
  );
}

function FounderEditor({ content, update }: EditorProps) {
  const f = (content.founder || content) as Record<string, unknown>;
  const updateFounder = (key: string, value: unknown) => update('founder', { ...f, [key]: value });
  return (
    <div className="space-y-4">
      <FormSection title="Personal Information">
        <Field label="Eyebrow"><input value={(f.eyebrow as string) || ''} onChange={(e) => updateFounder('eyebrow', e.target.value)} className="input" placeholder="Founder / Profile" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name"><input value={(f.full_name as string) || ''} onChange={(e) => updateFounder('full_name', e.target.value)} className="input" placeholder="Dr. Jane Doe" /></Field>
          <Field label="Professional Title"><input value={(f.professional_title as string) || ''} onChange={(e) => updateFounder('professional_title', e.target.value)} className="input" placeholder="Scientific Writer & Editor" /></Field>
        </div>
        <Field label="Short Bio"><textarea value={(f.short_bio as string) || ''} onChange={(e) => updateFounder('short_bio', e.target.value)} className="input min-h-[80px]" /></Field>
        <Field label="Long Biography"><textarea value={(f.long_bio as string) || ''} onChange={(e) => updateFounder('long_bio', e.target.value)} className="input min-h-[160px]" /></Field>
        <ImageUploadField label="Founder profile image" category="Profile" value={f.image_url as string} onChange={(url) => updateFounder('image_url', url)} />
        <Field label="Profile image alt text"><input value={(f.image_alt as string) || ''} onChange={(e) => updateFounder('image_alt', e.target.value)} className="input" /></Field>
      </FormSection>
      <FormSection title="Contact Information" description="These values populate the contact page, footer, and structured data. Do not hardcode in frontend.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Location"><input value={(f.location as string) || ''} onChange={(e) => updateFounder('location', e.target.value)} className="input" placeholder="City, Country" /></Field>
          <Field label="Phone"><input value={(f.phone as string) || ''} onChange={(e) => updateFounder('phone', e.target.value)} className="input" placeholder="+1..." /></Field>
        </div>
        <Field label="Email"><input value={(f.email as string) || ''} onChange={(e) => updateFounder('email', e.target.value)} className="input" placeholder="contact@example.com" /></Field>
      </FormSection>
      <FormSection title="Professional Links">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="LinkedIn"><input value={(f.linkedin as string) || ''} onChange={(e) => updateFounder('linkedin', e.target.value)} className="input" placeholder="https://linkedin.com/in/..." /></Field>
          <Field label="ORCID"><input value={(f.orcid as string) || ''} onChange={(e) => updateFounder('orcid', e.target.value)} className="input" placeholder="https://orcid.org/..." /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Google Scholar"><input value={(f.google_scholar as string) || ''} onChange={(e) => updateFounder('google_scholar', e.target.value)} className="input" placeholder="https://scholar.google.com/..." /></Field>
          <Field label="Website"><input value={(f.website as string) || ''} onChange={(e) => updateFounder('website', e.target.value)} className="input" placeholder="https://..." /></Field>
        </div>
      </FormSection>
    </div>
  );
}

function ThesisEditor({ content, update }: EditorProps) {
  const t = content;
  const items = (t.items || []) as string[];
  const workflow = (t.workflow || []) as string[];
  return (
    <div className="space-y-4">
      <FormSection title="Page Content">
        <Field label="Heading"><input value={(t.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} className="input" /></Field>
        <Field label="Introduction"><textarea value={(t.introduction as string) || ''} onChange={(e) => update('introduction', e.target.value)} className="input min-h-[80px]" /></Field>
        <Field label="Description"><textarea value={(t.description as string) || ''} onChange={(e) => update('description', e.target.value)} className="input min-h-[120px]" /></Field>
      </FormSection>
      <FormSection title="Support Items" description="e.g. Literature organization, Scientific structure, Chapter organization, Reference checking, Language editing, Formatting, Tables, Figures, Citation consistency">
        <StringListEditor value={items} onChange={(v) => update('items', v)} placeholder="Support item..." />
      </FormSection>
      <FormSection title="Workflow">
        <StringListEditor value={workflow} onChange={(v) => update('workflow', v)} placeholder="Workflow step..." />
      </FormSection>
      <FormSection title="Call to Action">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="CTA Text"><input value={((t.cta as Record<string, unknown>)?.text as string) || ''} onChange={(e) => update('cta', { ...(t.cta as Record<string, unknown> || {}), text: e.target.value })} className="input" /></Field>
          <Field label="CTA URL"><input value={((t.cta as Record<string, unknown>)?.url as string) || ''} onChange={(e) => update('cta', { ...(t.cta as Record<string, unknown> || {}), url: e.target.value })} className="input" /></Field>
        </div>
      </FormSection>
    </div>
  );
}

function EditingEditor({ content, update }: EditorProps) {
  const t = content;
  const blocks = (t.blocks || []) as Record<string, unknown>[];
  return (
    <div className="space-y-4">
      <FormSection title="Page Content">
        <Field label="Page Title"><input value={(t.page_title as string) || ''} onChange={(e) => update('page_title', e.target.value)} className="input" /></Field>
        <Field label="Intro"><textarea value={(t.intro as string) || ''} onChange={(e) => update('intro', e.target.value)} className="input min-h-[100px]" /></Field>
      </FormSection>
      <FormSection title="Content Blocks" description="Ethical scientific communication only. No AI detection bypass, plagiarism bypass, fake authorship, or fabricated citations.">
        <div className="space-y-3">
          {blocks.map((block, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-slate-800">
              <div className="flex-1 space-y-2">
                <input value={(block.title as string) || ''} onChange={(e) => { const next = [...blocks]; next[i] = { ...block, title: e.target.value }; update('blocks', next); }} className="input" placeholder="Block title (e.g. Scientific Language Improvement)" />
                <textarea value={(block.description as string) || ''} onChange={(e) => { const next = [...blocks]; next[i] = { ...block, description: e.target.value }; update('blocks', next); }} className="input min-h-[60px]" placeholder="Block description..." />
              </div>
              <button onClick={() => update('blocks', blocks.filter((_, idx) => idx !== i))} className="btn btn-ghost text-red-400 p-2 mt-1">Remove</button>
            </div>
          ))}
          <button onClick={() => update('blocks', [...blocks, { title: '', description: '' }])} className="btn btn-secondary">+ Add Content Block</button>
        </div>
      </FormSection>
    </div>
  );
}

function PublicationSupportEditor({ content, update }: EditorProps) {
  const t = content;
  const steps = (Array.isArray(t.steps) ? t.steps : []).map((step) =>
    typeof step === 'object' && step !== null
      ? step as Record<string, unknown>
      : { title: String(step || ''), description: '' },
  );
  const cta = (t.cta || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4">
      <FormSection title="Page Content">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Hero Eyebrow"><input value={(t.eyebrow as string) || ''} onChange={(e) => update('eyebrow', e.target.value)} className="input" placeholder="Publication Support" /></Field>
          <Field label="Heading"><input value={(t.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} className="input" /></Field>
          <Field label="Breadcrumb Home Label"><input value={(t.breadcrumb_home_label as string) || ''} onChange={(e) => update('breadcrumb_home_label', e.target.value)} className="input" placeholder="Home" /></Field>
          <Field label="Breadcrumb Label"><input value={(t.breadcrumb_label as string) || ''} onChange={(e) => update('breadcrumb_label', e.target.value)} className="input" placeholder="Publication Support" /></Field>
          <Field label="SEO Title"><input value={(t.seo_title as string) || ''} onChange={(e) => update('seo_title', e.target.value)} className="input" /></Field>
        </div>
        <Field label="SEO Description"><textarea value={(t.seo_description as string) || ''} onChange={(e) => update('seo_description', e.target.value)} className="input min-h-[80px]" /></Field>
        <Field label="Hero Description"><textarea value={(t.page_content as string) || ''} onChange={(e) => update('page_content', e.target.value)} className="input min-h-[120px]" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Process Eyebrow"><input value={(t.process_eyebrow as string) || ''} onChange={(e) => update('process_eyebrow', e.target.value)} className="input" /></Field>
          <Field label="Process Heading"><input value={(t.process_heading as string) || ''} onChange={(e) => update('process_heading', e.target.value)} className="input" /></Field>
        </div>
        <Field label="Process Description"><textarea value={(t.process_description as string) || ''} onChange={(e) => update('process_description', e.target.value)} className="input min-h-[80px]" /></Field>
      </FormSection>
      <FormSection title="Service Steps" description="Manage the title and description shown in each publication support step.">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="grid sm:grid-cols-[150px_1fr_1fr_auto] gap-2 items-start">
              <select value={(step.icon as string) || 'file-text'} onChange={(e) => { const next = [...steps]; next[index] = { ...step, icon: e.target.value }; update('steps', next); }} className="input">
                <option value="file-text">File</option>
                <option value="book-open">Book</option>
                <option value="check-circle">Check</option>
                <option value="send">Send</option>
              </select>
              <input value={(step.title as string) || ''} onChange={(e) => { const next = [...steps]; next[index] = { ...step, title: e.target.value }; update('steps', next); }} className="input" placeholder="Step title" />
              <input value={(step.description as string) || ''} onChange={(e) => { const next = [...steps]; next[index] = { ...step, description: e.target.value }; update('steps', next); }} className="input" placeholder="Step description" />
              <button onClick={() => update('steps', steps.filter((_, i) => i !== index))} className="btn btn-ghost text-red-400">Remove</button>
            </div>
          ))}
          <button onClick={() => update('steps', [...steps, { icon: 'file-text', title: '', description: '' }])} className="btn btn-secondary">+ Add Step</button>
        </div>
      </FormSection>
      <FormSection title="Research Outputs Section">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Eyebrow"><input value={(t.publications_eyebrow as string) || ''} onChange={(e) => update('publications_eyebrow', e.target.value)} className="input" /></Field>
          <Field label="Heading"><input value={(t.publications_heading as string) || ''} onChange={(e) => update('publications_heading', e.target.value)} className="input" /></Field>
        </div>
        <Field label="Description"><textarea value={(t.publications_description as string) || ''} onChange={(e) => update('publications_description', e.target.value)} className="input min-h-[70px]" /></Field>
        <Field label="DOI Link Label"><input value={(t.doi_label as string) || ''} onChange={(e) => update('doi_label', e.target.value)} className="input" placeholder="DOI" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Empty State Title"><input value={(t.empty_title as string) || ''} onChange={(e) => update('empty_title', e.target.value)} className="input" /></Field>
          <Field label="Empty State Description"><input value={(t.empty_description as string) || ''} onChange={(e) => update('empty_description', e.target.value)} className="input" /></Field>
        </div>
      </FormSection>
      <FormSection title="Call to Action">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="CTA Title"><input value={(t.cta_title as string) || ''} onChange={(e) => update('cta_title', e.target.value)} className="input" /></Field>
          <Field label="CTA Description"><textarea value={(t.cta_description as string) || ''} onChange={(e) => update('cta_description', e.target.value)} className="input min-h-[70px]" /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Primary CTA Text"><input value={(cta.text as string) || ''} onChange={(e) => update('cta', { ...cta, text: e.target.value })} className="input" /></Field>
          <Field label="Primary CTA URL"><input value={(cta.url as string) || ''} onChange={(e) => update('cta', { ...cta, url: e.target.value })} className="input" /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Secondary CTA Text"><input value={(t.secondary_cta_text as string) || ''} onChange={(e) => update('secondary_cta_text', e.target.value)} className="input" /></Field>
          <Field label="Secondary CTA URL"><input value={(t.secondary_cta_url as string) || ''} onChange={(e) => update('secondary_cta_url', e.target.value)} className="input" /></Field>
        </div>
      </FormSection>
    </div>
  );
}

function PeerReviewEditor({ content, update }: EditorProps) {
  const t = content;
  const areas = (t.areas || []) as string[];
  const processSteps = (t.process_steps || []) as string[];
  return (
    <div className="space-y-4">
      <FormSection title="Page Content">
        <Field label="Heading"><input value={(t.heading as string) || ''} onChange={(e) => update('heading', e.target.value)} className="input" /></Field>
        <Field label="Description"><textarea value={(t.description as string) || ''} onChange={(e) => update('description', e.target.value)} className="input min-h-[100px]" /></Field>
      </FormSection>
      <FormSection title="Peer Review Areas">
        <StringListEditor value={areas} onChange={(v) => update('areas', v)} placeholder="Review area..." />
      </FormSection>
      <FormSection title="Process Steps">
        <StringListEditor value={processSteps} onChange={(v) => update('process_steps', v)} placeholder="Process step..." />
      </FormSection>
      <FormSection title="Call to Action">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="CTA Text"><input value={((t.cta as Record<string, unknown>)?.text as string) || ''} onChange={(e) => update('cta', { ...(t.cta as Record<string, unknown> || {}), text: e.target.value })} className="input" /></Field>
          <Field label="CTA URL"><input value={((t.cta as Record<string, unknown>)?.url as string) || ''} onChange={(e) => update('cta', { ...(t.cta as Record<string, unknown> || {}), url: e.target.value })} className="input" /></Field>
        </div>
      </FormSection>
    </div>
  );
}

function ResearchIntegrityEditor({ content, update }: EditorProps) {
  const principles = (content.principles || []) as Record<string, unknown>[];
  return (
    <div className="space-y-4">
      <FormSection title="Integrity Principles" description="e.g. Accurate Attribution, No Fabricated Information, Responsible AI Use, Confidentiality, Ethical Originality">
        <div className="space-y-3">
          {principles.map((p, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-slate-800">
              <div className="flex-1 space-y-2">
                <input value={(p.title as string) || ''} onChange={(e) => { const next = [...principles]; next[i] = { ...p, title: e.target.value }; update('principles', next); }} className="input" placeholder="Principle title" />
                <textarea value={(p.description as string) || ''} onChange={(e) => { const next = [...principles]; next[i] = { ...p, description: e.target.value }; update('principles', next); }} className="input min-h-[60px]" placeholder="Principle description..." />
                <input value={(p.icon as string) || ''} onChange={(e) => { const next = [...principles]; next[i] = { ...p, icon: e.target.value }; update('principles', next); }} className="input" placeholder="Icon name (lucide)" />
              </div>
              <button onClick={() => update('principles', principles.filter((_, idx) => idx !== i))} className="btn btn-ghost text-red-400 p-2 mt-1">Remove</button>
            </div>
          ))}
          <button onClick={() => update('principles', [...principles, { title: '', description: '', icon: '', display_order: principles.length, active: true }])} className="btn btn-secondary">+ Add Principle</button>
        </div>
      </FormSection>
    </div>
  );
}

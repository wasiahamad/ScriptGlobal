import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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
    if (pageKey === 'home') {
      try {
        const data = await apiRequest<Record<string, unknown>>('/api/v1/admin/home');
        setPage({ id: String(data._id || data.id || 'home'), page_key: 'home', title: 'Home Page', content: {}, seo: {}, created_at: '', updated_at: '' });
        setContent((data.data as Record<string, unknown>) || {});
      } catch {
        setPage(null);
        setContent({});
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
    if (pageKey === 'home') {
      try {
        await apiRequest('/api/v1/admin/home', {
          method: 'PUT',
          body: JSON.stringify({ status: 'published', isActive: true, data: content }),
        });
        toast('Home page changes saved successfully');
      } catch (error) {
        toast(error instanceof Error ? error.message : 'Unable to save Home page', 'error');
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
  const workCovers = (about.work_covers || []) as string[];

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
  const focus = (content.focus || {}) as Record<string, unknown>;
  const contributions = (content.contributions || []) as Record<string, unknown>[];
  const principles = (content.principles || []) as Record<string, unknown>[];
  const capabilities = (content.capabilities || []) as Record<string, unknown>[];
  const workTypes = (content.work_types || []) as string[];

  return (
    <div className="space-y-4">
      <FormSection title="Professional Profile">
        <Field label="Heading"><input value={(profile.heading as string) || ''} onChange={(e) => update('profile', { ...profile, heading: e.target.value })} className="input" /></Field>
        <Field label="Description"><textarea value={(profile.description as string) || ''} onChange={(e) => update('profile', { ...profile, description: e.target.value })} className="input min-h-[120px]" /></Field>
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
  const f = content;
  return (
    <div className="space-y-4">
      <FormSection title="Personal Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name"><input value={(f.full_name as string) || ''} onChange={(e) => update('full_name', e.target.value)} className="input" placeholder="Dr. Jane Doe" /></Field>
          <Field label="Professional Title"><input value={(f.professional_title as string) || ''} onChange={(e) => update('professional_title', e.target.value)} className="input" placeholder="Scientific Writer & Editor" /></Field>
        </div>
        <Field label="Short Bio"><textarea value={(f.short_bio as string) || ''} onChange={(e) => update('short_bio', e.target.value)} className="input min-h-[80px]" /></Field>
        <Field label="Long Biography"><textarea value={(f.long_bio as string) || ''} onChange={(e) => update('long_bio', e.target.value)} className="input min-h-[160px]" /></Field>
        <ImageUploadField label="Founder profile image" category="Profile" value={f.image_url as string} onChange={(url) => update('image_url', url)} />
        <Field label="Profile image alt text"><input value={(f.image_alt as string) || ''} onChange={(e) => update('image_alt', e.target.value)} className="input" /></Field>
      </FormSection>
      <FormSection title="Contact Information" description="These values populate the contact page, footer, and structured data. Do not hardcode in frontend.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Location"><input value={(f.location as string) || ''} onChange={(e) => update('location', e.target.value)} className="input" placeholder="City, Country" /></Field>
          <Field label="Phone"><input value={(f.phone as string) || ''} onChange={(e) => update('phone', e.target.value)} className="input" placeholder="+1..." /></Field>
        </div>
        <Field label="Email"><input value={(f.email as string) || ''} onChange={(e) => update('email', e.target.value)} className="input" placeholder="contact@example.com" /></Field>
      </FormSection>
      <FormSection title="Professional Links">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="LinkedIn"><input value={(f.linkedin as string) || ''} onChange={(e) => update('linkedin', e.target.value)} className="input" placeholder="https://linkedin.com/in/..." /></Field>
          <Field label="ORCID"><input value={(f.orcid as string) || ''} onChange={(e) => update('orcid', e.target.value)} className="input" placeholder="https://orcid.org/..." /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Google Scholar"><input value={(f.google_scholar as string) || ''} onChange={(e) => update('google_scholar', e.target.value)} className="input" placeholder="https://scholar.google.com/..." /></Field>
          <Field label="Website"><input value={(f.website as string) || ''} onChange={(e) => update('website', e.target.value)} className="input" placeholder="https://..." /></Field>
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
  const steps = (t.steps || []) as string[];
  return (
    <div className="space-y-4">
      <FormSection title="Page Content">
        <Field label="Page Content"><textarea value={(t.page_content as string) || ''} onChange={(e) => update('page_content', e.target.value)} className="input min-h-[120px]" /></Field>
      </FormSection>
      <FormSection title="Service Steps" description="e.g. 1. Manuscript Review, 2. Structure & Language, 3. References, 4. Figures & Tables, 5. Journal Formatting, 6. Submission Readiness">
        <StringListEditor value={steps} onChange={(v) => update('steps', v)} placeholder="Service step..." />
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

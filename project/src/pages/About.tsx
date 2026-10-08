import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, PenLine, ShieldCheck, FlaskConical, Send, Microscope, ClipboardCheck, MessageSquare, GraduationCap } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import SectionTitle from '@/components/ui/SectionTitle';
import { useSiteData } from '@/context/SiteDataContext';
import { getPublicPageContent } from '@/lib/api';
import { getIcon } from '@/lib/icons';

const capabilities = [
  { icon: FileText, title: 'Research Article Writing', desc: 'Manuscript development grounded in your data, results, and findings.' },
  { icon: BookOpen, title: 'Literature Synthesis', desc: 'Structured literature reviews — narrative, scoping, systematic, and mechanistic.' },
  { icon: PenLine, title: 'Scientific Editing', desc: 'Language editing for clarity, accuracy, terminology, and journal style.' },
  { icon: ShieldCheck, title: 'Citation Verification', desc: 'Reference checking, DOI verification, and citation integrity review.' },
  { icon: FlaskConical, title: 'Scientific Figures', desc: 'Graphical abstracts, mechanism diagrams, and publication-ready visuals.' },
  { icon: Send, title: 'Publication Support', desc: 'Journal formatting, cover letters, and submission-readiness checks.' },
];

const workTypes = [
  'Research articles',
  'Review articles',
  'Books and book chapters',
  'Theses and dissertations',
  'Scientific tables',
  'Graphical abstracts',
  'Molecular mechanism figures',
  'Journal submission documents',
];

const principles = [
  { icon: Microscope, title: 'Evidence-Based', desc: 'We work from the data and materials you provide. Results, statistics, ethics approvals, and findings are never invented.' },
  { icon: ShieldCheck, title: 'Citation Integrity', desc: 'Every reference is verified. We ensure cited sources match the claims they support and DOI links resolve correctly.' },
  { icon: ClipboardCheck, title: 'Ethical Standards', desc: 'We adhere to ethical publishing standards and responsible AI-use practices. No guaranteed similarity scores or detection evasion.' },
  { icon: MessageSquare, title: 'Author Voice', desc: 'We preserve your scientific meaning and authorial voice throughout the editing and development process.' },
];

export default function About() {
  const { settings } = useSiteData();
  const [content, setContent] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    getPublicPageContent('profile').then(setContent);
  }, []);

  const text = (value: unknown, fallback: string) => typeof value === 'string' && value.trim() ? value : fallback;
  const profile = content?.profile && typeof content.profile === 'object' ? content.profile as Record<string, unknown> : content || {};
  const approach = content?.approach && typeof content.approach === 'object' ? content.approach as Record<string, unknown> : {};
  const mission = content?.mission && typeof content.mission === 'object' ? content.mission as Record<string, unknown> : {};
  const founder = content?.founder && typeof content.founder === 'object' ? content.founder as Record<string, unknown> : profile;
  const principlesSection = content?.principles_section && typeof content.principles_section === 'object' ? content.principles_section as Record<string, unknown> : {};
  const capabilitiesSection = content?.capabilities_section && typeof content.capabilities_section === 'object' ? content.capabilities_section as Record<string, unknown> : {};
  const workSection = content?.work_section && typeof content.work_section === 'object' ? content.work_section as Record<string, unknown> : {};
  const cta = content?.cta && typeof content.cta === 'object' ? content.cta as Record<string, unknown> : {};
  const profileImage = text(profile.image_url || profile.profile_image, 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1000');
  const founderImage = text(founder.image_url || founder.profile_image, profileImage);
  const dynamicPrinciples = Array.isArray(content?.principles) ? content.principles : principles;
  const dynamicCapabilities = Array.isArray(content?.capabilities) ? content.capabilities : capabilities;
  const dynamicWorkTypes = Array.isArray(content?.work_types) ? content.work_types : workTypes;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'About', item: '/about' },
    ],
  };

  return (
    <>
      <SEO
        title="About Us"
        description="Learn about SciScript Global Scientific Writing Services — a professional scientific writing, editing, and publication support practice for biomedical and pharmaceutical research."
        canonicalPath="/about"
        siteSettings={settings}
        jsonLd={breadcrumb}
      />

      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-navy-50 via-white to-teal-50/30 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">
              {text(profile.eyebrow, 'About Us')}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">
              {text(profile.heading, 'Scientific Writing, Editing & Publication Support')}
            </h1>
            <p className="text-lg text-navy-500 leading-relaxed">
              {text(profile.description, settings?.about_intro || 'SciScript Global Scientific Writing Services is a professional scientific writing and research communication practice supporting biomedical, pharmaceutical, and interdisciplinary research.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main about body */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="prose-scientific"
          >
            <h2>{text(approach.heading, 'Our Approach')}</h2>
            <p className="text-lg text-navy-500 leading-relaxed mb-6">
              {text(approach.description || profile.approach, settings?.about_body || 'We provide evidence-based scientific writing, manuscript development, literature review, scientific editing, citation verification, scientific figure design, and publication support across research articles, review articles, books and book chapters, theses and dissertations, scientific tables, graphical abstracts, molecular mechanism figures, and journal submission documents.')}
            </p>

            <h2>{text(mission.heading, 'Our Mission')}</h2>
            <p className="text-lg text-navy-500 leading-relaxed mb-6">
              {text(mission.description || profile.mission, settings?.about_mission || 'To support researchers and institutions in communicating science with accuracy, integrity, and clarity — adhering to ethical, evidence-based publishing standards.')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <img src={founderImage} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = profileImage; }} alt={text(founder.image_alt, 'SciScript founder and scientific writing professional')} className="w-full max-h-[34rem] object-cover rounded-2xl border border-navy-100 shadow-lg" loading="lazy" />
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">{text(founder.eyebrow, 'Founder / Profile')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 leading-tight mb-4">{text(founder.full_name, 'SciScript Global')}</h2>
              <p className="text-lg text-teal-600 font-medium mb-5">{text(founder.professional_title, 'Scientific Writing & Research Communication')}</p>
              <p className="text-navy-500 leading-relaxed mb-4">{text(founder.long_bio, text(founder.short_bio, 'Evidence-based scientific writing, editing, and publication support for biomedical and pharmaceutical research.'))}</p>
              <div className="space-y-2 text-sm text-navy-600">
                {typeof founder.email === 'string' && founder.email && <a className="block hover:text-teal-600" href={`mailto:${founder.email}`}>{founder.email}</a>}
                {typeof founder.phone === 'string' && founder.phone && <a className="block hover:text-teal-600" href={`tel:${founder.phone}`}>{founder.phone}</a>}
                {typeof founder.location === 'string' && founder.location && <p>{founder.location}</p>}
                {typeof founder.linkedin === 'string' && founder.linkedin && <a className="block hover:text-teal-600" href={founder.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                {typeof founder.orcid === 'string' && founder.orcid && <a className="block hover:text-teal-600" href={founder.orcid} target="_blank" rel="noreferrer">ORCID</a>}
                {typeof founder.google_scholar === 'string' && founder.google_scholar && <a className="block hover:text-teal-600" href={founder.google_scholar} target="_blank" rel="noreferrer">Google Scholar</a>}
                {typeof founder.website === 'string' && founder.website && <a className="block hover:text-teal-600" href={founder.website} target="_blank" rel="noreferrer">Website</a>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20 lg:py-28 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Our Principles"
            title={text(principlesSection.heading, 'Evidence-Based. Ethical. Author-Centered.')}
            subtitle={text(principlesSection.subtitle, 'The values that guide every manuscript, review, and figure we work on.')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dynamicPrinciples.map((item, i) => {
              const p = typeof item === 'object' && item !== null ? item as Record<string, unknown> : { title: String(item) } as Record<string, unknown>;
              const fallback = principles[i % principles.length];
              const Icon = getIcon(typeof p.icon === 'string' ? p.icon : null) || fallback.icon;
              return (
              <motion.div
                key={String(p.title || fallback.title)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 bg-white rounded-xl border border-navy-100 p-6"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-2">{String(p.title || fallback.title)}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{String(p.desc || p.description || fallback.desc)}</p>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Capabilities"
            title={text(capabilitiesSection.heading, 'What We Do')}
            subtitle={text(capabilitiesSection.subtitle, 'Core capabilities across the scientific research communication lifecycle.')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dynamicCapabilities.map((item, i) => {
              const c = typeof item === 'object' && item !== null ? item as Record<string, unknown> : { title: String(item) } as Record<string, unknown>;
              const fallback = capabilities[i % capabilities.length];
              const Icon = getIcon(typeof c.icon === 'string' ? c.icon : null) || fallback.icon;
              return (
              <motion.div
                key={String(c.title || fallback.title)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="bg-offwhite rounded-xl border border-navy-100 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-navy-700" />
                </div>
                <h3 className="font-semibold text-navy-900 mb-2">{String(c.title || fallback.title)}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{String(c.desc || c.description || fallback.desc)}</p>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Work types */}
      <section className="py-20 lg:py-28 bg-offwhite">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Scope of Work"
            title={text(workSection.heading, 'Document Types We Support')}
            subtitle={text(workSection.subtitle, '') || undefined}
            icon={GraduationCap}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dynamicWorkTypes.map((item, i) => {
              const type = typeof item === 'string' ? item : String(item);
              return (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-white border border-navy-100"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0"></span>
                <span className="text-sm font-medium text-navy-700">{type}</span>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection
        title={text(cta.title, "Let's Discuss Your Research")}
        subtitle={text(cta.subtitle, 'Share your research goals with us and discover how our evidence-based scientific writing and publication support can help.')}
        primaryLabel={text(cta.primary_label, 'Request Consultation')}
        primaryTo={text(cta.primary_to, '/contact')}
        secondaryLabel={text(cta.secondary_label, 'View Our Services')}
        secondaryTo={text(cta.secondary_to, '/services')}
      />
    </>
  );
}

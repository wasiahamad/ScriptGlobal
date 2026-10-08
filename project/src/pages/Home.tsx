import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, BookOpen, PenLine, ShieldCheck, FlaskConical, Send, ChevronRight, Microscope, Check } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import SectionTitle from '@/components/ui/SectionTitle';
import { ButtonLink } from '@/components/ui/Button';
import { MolecularPattern, DnaHelix, ParticleField } from '@/components/decorative/ScientificDecor';
import { SkeletonGrid } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getHomeContent, getServices, getResearchAreas, getFaqs, getTestimonials } from '@/lib/api';
import { getIcon } from '@/lib/icons';
import type { Service, ResearchArea, Faq, Testimonial } from '@/types';

const expertiseItems = [
  { icon: FileText, label: 'Scientific Writing' },
  { icon: BookOpen, label: 'Literature Review' },
  { icon: PenLine, label: 'Manuscript Editing' },
  { icon: ShieldCheck, label: 'Citation Verification' },
  { icon: FlaskConical, label: 'Scientific Figures' },
  { icon: Send, label: 'Publication Support' },
];

const trustSignals = ['Evidence-based approach', 'Ethical scientific communication', 'Reference verification', 'Confidentiality-aware workflow'];

export default function Home() {
  const { settings } = useSiteData();
  const [homeContent, setHomeContent] = useState<Record<string, unknown> | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [home, s, ra, f, t] = await Promise.all([
        getHomeContent(),
        getServices(),
        getResearchAreas(),
        getFaqs(),
        getTestimonials(),
      ]);
      setHomeContent(home);
      setServices(s);
      setResearchAreas(ra);
      setFaqs(f);
      setTestimonials(t);
      setLoading(false);
    })();
  }, []);

  const section = (key: string) => {
    const value = homeContent?.[key];
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  };
  const text = (value: unknown, fallback: string) => typeof value === 'string' && value.trim() ? value : fallback;
  const hero = section('hero');
  const about = section('about');
  const servicesSection = section('services');
  const researchSection = section('research');
  const testimonialsSection = section('testimonials');
  const faqSection = section('faq');
  const trustItems = Array.isArray(homeContent?.trust_signals) ? homeContent.trust_signals.filter((item): item is string => typeof item === 'string') : trustSignals;
  const expertiseItemsFromCms = Array.isArray(homeContent?.expertise_items) ? homeContent.expertise_items : [];
  const missionText = text(about.mission, settings?.about_mission || 'To support researchers and institutions in communicating science with accuracy, integrity, and clarity — adhering to ethical, evidence-based publishing standards.');
  const workCovers = Array.isArray(about.work_covers) ? about.work_covers
    .filter((item): item is string => typeof item === 'string')
    .filter((item) => !/^our mission\s*:/i.test(item.trim()) && item.trim() !== missionText.trim()) : [
    'Research articles', 'Review articles', 'Books & chapters', 'Theses & dissertations',
    'Graphical abstracts', 'Mechanism figures', 'Scientific tables', 'Submission documents',
  ];

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.brand_name || 'SciScript Global Scientific Writing Services',
    description: settings?.default_meta_description || 'Professional scientific writing, biomedical and pharmaceutical research writing, scientific editing, citation verification, and publication support services.',
    areaServed: 'Global',
    knowsAbout: ['Scientific Writing', 'Biomedical Research', 'Pharmaceutical Research', 'Scientific Editing', 'Publication Support'],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings?.brand_name || 'SciScript Global Scientific Writing Services',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://sciscript.global/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <SEO
        title={settings?.default_seo_title?.split('|')[0]?.trim()}
        description={settings?.default_meta_description || undefined}
        canonicalPath="/"
        siteSettings={settings}
        jsonLd={[organizationSchema, websiteSchema]}
      />

      {/* ============ HERO ============ */}
      <section className="scientific-hero relative min-h-[760px] lg:min-h-[900px] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src="/images/hero-bg.png"
            alt="Hero background with scientific and research elements"
            className="h-full w-full  "
            loading="eager"
          />
          {/* <div className="absolute inset-0 bg-white/55"></div> */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-white/10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-transparent to-white/10"></div>
        </div>
        <MolecularPattern className="z-[1] opacity-70" />
        <ParticleField className="z-[2]" />
        <div className="absolute right-[-5%] top-[7%] z-[2] hidden h-[78%] w-[42%] opacity-45 lg:block pointer-events-none">
          <DnaHelix className="h-full w-full dna-float" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pb-18 lg:pt-8">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-7 inline-flex items-center gap-3"
            >
              <span className="w-8 h-px bg-[#0f766e]"></span>
              <span className="eyebrow tracking-[0.28em]">{text(hero.eyebrow, 'Scientific writing · Research · Publication support')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="editorial-heading max-w-4xl break-words text-[1.2rem] leading-[0.98] text-[#0a0a0a] sm:text-6xl md:text-7xl lg:text-[4.9rem]"
            >
              {text(hero.heading, 'Evidence-Based Scientific Writing for Biomedical & Pharmaceutical Research')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mb-8 mt-8 max-w-2xl text-base leading-relaxed text-[#171717] md:text-xl"
            >
              {text(hero.description, 'Manuscript development, scientific editing, literature synthesis and publication support for biomedical and pharmaceutical research.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <ButtonLink to={text(hero.primary_cta_url, '/contact')} size="lg" variant="primary">
                {text(hero.primary_cta_text, settings?.hero_cta_primary || 'Discuss Your Research')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </ButtonLink>
              <ButtonLink to={text(hero.secondary_cta_url, '/portfolio')} size="lg" variant="outline">
                {text(hero.secondary_cta_text, settings?.hero_cta_secondary || 'Explore Services')}
              </ButtonLink>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-offwhite via-offwhite/80 to-transparent pointer-events-none"></div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section className="relative z-20 border-b border-[#e5e5e5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#e5e5e5]">
            {trustItems.map((signal, i) => (
              <motion.div
                key={signal}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-3 px-5 py-5 lg:px-7"
              >
                <Check className="h-4 w-4 shrink-0 text-[#0d7d72]" />
                <p className="text-sm font-medium text-[#171717]">{signal}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EXPERTISE STRIP ============ */}
      <section className="py-16 bg-white border-y border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {expertiseItems.map((item, i) => {
              const cmsItem = expertiseItemsFromCms[i];
              const label = cmsItem && typeof cmsItem === 'object' && 'label' in cmsItem && typeof cmsItem.label === 'string' ? cmsItem.label : item.label;
              return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 group-hover:from-teal-50 group-hover:to-teal-100 transition-all duration-300 flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md">
                  <item.icon className="w-6 h-6 text-navy-700 group-hover:text-teal-600 transition-colors" />
                </div>
                <span className="text-sm font-semibold text-navy-600">{label}</span>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ABOUT PREVIEW ============ */}
      <section className="py-20 lg:py-32 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">
                {text(about.eyebrow, 'About SciScript Global')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 leading-tight mb-6">
                {text(about.heading, 'A Professional Scientific Research Communication Practice')}
              </h2>
              <p className="text-lg text-navy-500 leading-relaxed mb-6">
                {text(about.intro, settings?.about_intro || 'SciScript Global Scientific Writing Services is a professional scientific writing and research communication practice supporting biomedical, pharmaceutical, and interdisciplinary research.')}
              </p>
              <p className="text-navy-500 leading-relaxed mb-8">
                {text(about.body, settings?.about_body || 'We provide evidence-based scientific writing, manuscript development, literature review, scientific editing, citation verification, scientific figure design, and publication support.')}
              </p>
              <ButtonLink to="/about" variant="outline">
                Learn More About Us
                <ChevronRight className="w-4 h-4 ml-1" />
              </ButtonLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Scientific image card */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-navy-100 mb-6">
                <img
                  src={text(about.image_url, 'https://images.pexels.com/photos/8770717/pexels-photo-8770717.jpeg?auto=compress&cs=tinysrgb&w=800')}
                  alt={text(about.image_alt, 'Scientist examining a specimen under a microscope in a research laboratory')}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-xs font-semibold text-navy-700">
                    <Microscope className="w-3.5 h-3.5 text-teal-600" />
                    Biomedical Research
                  </span>
                </div>
              </div>
              {/* Work covers grid */}
              <div className="bg-white rounded-2xl shadow-lg border border-navy-100 p-6">
                <h3 className="text-base font-semibold text-navy-800 mb-4">
                  Our Work Covers
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {workCovers.map((point, i) => (
                    <motion.div
                      key={point}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-50/60 hover:bg-teal-50 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></span>
                      <span className="text-xs font-medium text-navy-700">{point}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-navy-50 border border-teal-100">
                  <p className="text-sm text-teal-800 leading-relaxed">
                    <strong className="font-semibold">{text(about.mission_label, 'Our Mission')}:</strong> {missionText}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ SERVICES PREVIEW ============ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow={text(servicesSection.eyebrow, 'What We Do')}
            title={text(servicesSection.heading, 'Scientific Writing & Publication Services')}
            subtitle={text(servicesSection.description, 'From manuscript development to journal submission, we provide comprehensive, evidence-based support across the research communication lifecycle.')}
          />

          {loading ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => {
                const Icon = getIcon(service.icon);
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                  >
                    <Link
                      to={`/services/${service.slug}`}
                      className="group block h-full bg-white rounded-2xl border border-navy-100 p-7 hover:shadow-2xl hover:border-teal-300 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 group-hover:from-teal-50 group-hover:to-teal-100 transition-all duration-300 flex items-center justify-center mb-5 shadow-sm">
                        <Icon className="w-7 h-7 text-navy-700 group-hover:text-teal-600 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-700 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-navy-500 leading-relaxed mb-4">
                        {service.short_description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 group-hover:gap-2.5 transition-all">
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============ RESEARCH AREAS PREVIEW ============ */}
      <section className="py-20 lg:py-28 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow={text(researchSection.eyebrow, 'Research Domains')}
            title={text(researchSection.heading, 'Research Areas We Support')}
            subtitle={text(researchSection.description, 'Our expertise spans biomedical, pharmaceutical, and interdisciplinary research domains.')}
          />

          {loading ? (
            <SkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {researchAreas.map((area, i) => {
                const Icon = getIcon(area.icon);
                return (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  >
                    <Link
                      to={`/research-areas/${area.slug}`}
                      className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-navy-100 hover:shadow-xl hover:border-teal-300 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 group-hover:from-teal-100 group-hover:to-teal-200 transition-all duration-300 flex items-center justify-center mb-3 shadow-sm">
                        <Icon className="w-7 h-7 text-teal-600" />
                      </div>
                      <span className="text-sm font-bold text-navy-800 group-hover:text-teal-700 transition-colors">
                        {area.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <ButtonLink to="/research-areas" variant="outline">
              Explore All Research Areas
              <ChevronRight className="w-4 h-4 ml-1" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS (if any) ============ */}
      {testimonials.length > 0 && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow={text(testimonialsSection.eyebrow, 'Client Feedback')}
              title={text(testimonialsSection.heading, 'What Researchers Say')}
              subtitle={text(testimonialsSection.description, 'Testimonials from researchers we have supported in their publication journey.')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-offwhite rounded-xl border border-navy-100 p-6"
                >
                  <p className="text-navy-600 leading-relaxed mb-5 italic">"{t.testimonial}"</p>
                  <div className="flex items-center gap-3">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-navy-200 flex items-center justify-center text-navy-600 font-semibold">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-navy-800 text-sm">{t.name}</p>
                      {t.designation && <p className="text-xs text-navy-400">{t.designation}</p>}
                      {t.organization && <p className="text-xs text-navy-400">{t.organization}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ FAQ PREVIEW ============ */}
      {faqs.length > 0 && (
        <section className="py-20 lg:py-28 bg-offwhite">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow={text(faqSection.eyebrow, 'Questions & Answers')}
              title={text(faqSection.heading, 'Frequently Asked Questions')}
              subtitle={text(faqSection.description, 'Common questions about our scientific writing and publication support services.')}
            />
            <div className="space-y-4">
              {faqs.slice(0, 5).map((faq, i) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-navy-100 p-5"
                >
                  <h3 className="font-semibold text-navy-800 mb-2 text-sm md:text-base">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <ButtonLink to="/faqs" variant="ghost">
                View All FAQs
                <ChevronRight className="w-4 h-4 ml-1" />
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA ============ */}
      <CTASection
        title={text(section('final_cta').heading, 'Ready to Discuss Your Research?')}
        subtitle={text(section('final_cta').description, 'Whether you are developing a manuscript, preparing a review, or navigating journal submission, we provide evidence-based scientific writing and publication support tailored to your research.')}
        primaryLabel={text(section('final_cta').button_text, 'Discuss Your Research')}
        primaryTo={text(section('final_cta').button_url, '/contact')}
      />
    </>
  );
}

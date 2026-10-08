import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, FileText, BookOpen, CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import SectionTitle from '@/components/ui/SectionTitle';
import { useSiteData } from '@/context/SiteDataContext';
import { getPublications, getPublicPageContent, getResearchAreas } from '@/lib/api';
import type { Publication, ResearchArea } from '@/types';

const supportSteps = [
  { icon: FileText, iconName: 'file-text', title: 'Journal Scope Alignment', desc: 'We help identify journals whose scope matches your research.' },
  { icon: BookOpen, iconName: 'book-open', title: 'Manuscript Formatting', desc: 'Formatting to journal-specific templates, styles, and guidelines.' },
  { icon: CheckCircle2, iconName: 'check-circle', title: 'Reporting Guideline Checks', desc: 'Compliance checks against CONSORT, PRISMA, STROBE, and others.' },
  { icon: Send, iconName: 'send', title: 'Submission Readiness', desc: 'Cover letters, highlights, declarations, and submission checklists.' },
];

export default function PublicationSupport() {
  const { settings } = useSiteData();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [pageContent, setPageContent] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, ra, content] = await Promise.all([getPublications(), getResearchAreas(), getPublicPageContent('publication-support')]);
      setPublications(p);
      setResearchAreas(ra);
      setPageContent(content);
      setLoading(false);
    })();
  }, []);

  const cmsSteps = Array.isArray(pageContent?.steps) && pageContent.steps.length > 0 ? pageContent.steps : supportSteps;
  const pageText = (key: string, fallback: string) =>
    typeof pageContent?.[key] === 'string' && String(pageContent[key]).trim()
      ? String(pageContent[key])
      : fallback;
  const cta = pageContent?.cta && typeof pageContent.cta === 'object' ? pageContent.cta as Record<string, unknown> : {};
  const getStepIcon = (name: unknown, fallback: typeof FileText) => {
    switch (name) {
      case 'book-open': return BookOpen;
      case 'check-circle': return CheckCircle2;
      case 'send': return Send;
      case 'file-text': return FileText;
      default: return fallback;
    }
  };

  const getAreaName = (id: string | null) => {
    if (!id) return null;
    return researchAreas.find((a) => a.id === id)?.name || null;
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: pageText('breadcrumb_home_label', 'Home'), item: '/' },
      { '@type': 'ListItem', position: 2, name: pageText('breadcrumb_label', 'Publication Support'), item: '/publication-support' },
    ],
  };

  return (
    <>
      <SEO
        title={pageText('seo_title', 'Publication Support Services')}
        description={pageText('seo_description', 'Comprehensive publication support: journal scope alignment, manuscript formatting, reporting guideline checks, cover letters, response-to-reviewers, and submission checklists.')}
        canonicalPath="/publication-support"
        siteSettings={settings}
        jsonLd={breadcrumb}
      />

      {/* Hero */}
      <section className="page-hero page-hero--publication relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">
              {pageText('eyebrow', 'Publication Support')}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">
              {pageText('heading', 'Journal Submission & Publication Support')}
            </h1>
            <p className="text-lg text-navy-500 leading-relaxed">
              {pageText('page_content', 'From manuscript formatting and reporting guideline compliance to cover letters and response-to-reviewers — we support your journey from completed manuscript to submitted publication.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support steps */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow={pageText('process_eyebrow', 'How We Help')}
            title={pageText('process_heading', 'Publication Support Process')}
            subtitle={pageText('process_description', 'A structured approach to preparing your manuscript for journal submission.')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cmsSteps.map((item, i) => {
              const fallback = supportSteps[i % supportSteps.length];
              const step = typeof item === 'object' && item !== null ? item as Record<string, unknown> : { title: String(item) } as Record<string, unknown>;
              const title = typeof step.title === 'string' ? step.title : fallback.title;
              const description = typeof step.description === 'string' ? step.description : fallback.desc;
              const StepIcon = getStepIcon(step.icon, fallback.icon);
              return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-offwhite rounded-xl border border-navy-100 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center">
                    <StepIcon className="w-6 h-6 text-navy-700" />
                  </div>
                  <span className="text-3xl font-bold text-navy-100">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-navy-900 mb-2">{title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{description}</p>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Publications list */}
      <section className="py-20 lg:py-28 bg-offwhite">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow={pageText('publications_eyebrow', 'Research Outputs')}
            title={pageText('publications_heading', 'Publications & Research Outputs')}
            subtitle={pageText('publications_description', 'Published research outputs associated with our publication support work.')}
            center={false}
          />

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-xl border border-navy-100 animate-pulse"></div>
              ))}
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-navy-100">
              <p className="text-navy-400">{pageText('empty_title', 'Publication details will appear here once available.')}</p>
              <p className="text-sm text-navy-300 mt-2">{pageText('empty_description', 'No fabricated publications, DOIs, or journal acceptances are displayed.')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {publications.map((pub, i) => {
                const areaName = getAreaName(pub.research_area_id);
                return (
                  <motion.div
                    key={pub.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="flex items-start gap-4 p-5 rounded-xl bg-white border border-navy-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {pub.publication_type && (
                          <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-medium">
                            {pub.publication_type}
                          </span>
                        )}
                        {areaName && (
                          <span className="px-2.5 py-1 rounded-md bg-navy-50 text-navy-600 text-xs font-medium">
                            {areaName}
                          </span>
                        )}
                        {pub.status && (
                          <span className="px-2.5 py-1 rounded-md bg-navy-50 text-navy-600 text-xs font-medium">
                            {pub.status}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-navy-900 mb-1">{pub.title}</h3>
                      {pub.authors && <p className="text-sm text-navy-400 mb-1">{pub.authors}</p>}
                      <p className="text-sm text-navy-500">
                        {pub.journal && <span>{pub.journal}</span>}
                        {pub.journal && pub.year && <span> &middot; </span>}
                        {pub.year && <span>{pub.year}</span>}
                      </p>
                    </div>
                    {pub.doi && (
                      <a
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 flex-shrink-0"
                      >
                        {pageText('doi_label', 'DOI')}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title={pageText('cta_title', 'Ready for Publication Support?')}
        subtitle={pageText('cta_description', 'Let us help you prepare your manuscript for journal submission — from formatting to cover letters to response-to-reviewers.')}
        primaryLabel={typeof cta.text === 'string' ? cta.text : 'Request Publication Support'}
        primaryTo={typeof cta.url === 'string' ? cta.url : '/contact'}
        secondaryLabel={pageText('secondary_cta_text', 'View Services')}
        secondaryTo={pageText('secondary_cta_url', '/services')}
      />
    </>
  );
}

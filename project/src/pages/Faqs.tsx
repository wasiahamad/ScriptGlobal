import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import { EmptyState } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getFaqs, getHomeContent } from '@/lib/api';
import type { Faq } from '@/types';

export default function Faqs() {
  const { settings } = useSiteData();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<Record<string, unknown>>({});
  const [cta, setCta] = useState<Record<string, unknown>>({});

  useEffect(() => {
    Promise.all([getFaqs(), getHomeContent()]).then(([items, home]) => {
      setFaqs(items);
      const section = home?.faq;
      if (section && typeof section === 'object' && !Array.isArray(section)) setPageContent(section as Record<string, unknown>);
      const finalCta = home?.final_cta;
      if (finalCta && typeof finalCta === 'object' && !Array.isArray(finalCta)) setCta(finalCta as Record<string, unknown>);
    });
  }, []);

  const text = (key: string, fallback: string) => typeof pageContent[key] === 'string' && pageContent[key] ? pageContent[key] as string : fallback;
  const faqSchema = faqs.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer || '' } })) } : undefined;

  return (
    <>
      <SEO title={text('seo_title', 'Frequently Asked Questions')} description={text('meta_description', 'Answers to common questions about SciScript Global scientific writing, editing, literature review, and publication support services.')} canonicalPath="/faqs" siteSettings={settings} jsonLd={faqSchema} />
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-navy-50 via-white to-teal-50/30 overflow-hidden"><div className="absolute inset-0 grid-bg opacity-30" /><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"><span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">{text('eyebrow', 'Questions & Answers')}</span><h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">{text('page_heading', text('heading', 'Frequently Asked Questions'))}</h1><p className="text-lg text-navy-500 leading-relaxed">{text('page_description', text('description', 'Clear answers about our scientific writing, editing, figure design, and publication support services.'))}</p></div></section>
      <section className="py-20 lg:py-28 bg-white"><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">{faqs.length === 0 ? <EmptyState title="FAQs Coming Soon" message="Frequently asked questions will appear here when they are available." icon={HelpCircle} /> : <div className="space-y-3">{faqs.map((faq, index) => { const open = openId === faq.id; return <motion.div key={faq.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.04 }} className="border border-navy-100 rounded-xl overflow-hidden"><button type="button" onClick={() => setOpenId(open ? null : faq.id)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-offwhite hover:bg-navy-50 transition-colors"><span className="font-semibold text-navy-800">{faq.question}{faq.category && <span className="ml-2 text-xs font-normal text-teal-600">{faq.category}</span>}</span><ChevronDown className={`w-5 h-5 text-teal-600 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} /></button>{open && <div className="px-5 py-4 bg-white"><p className="text-navy-500 leading-relaxed">{faq.answer}</p></div>}</motion.div>; })}</div>}</div></section>
      <CTASection title={String(cta.heading || 'Still Have Questions?')} subtitle={String(cta.description || 'Share your research goals with us and we will help you identify the right support.')} />
    </>
  );
}

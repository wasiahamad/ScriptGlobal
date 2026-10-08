import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, MessageSquareQuote } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import SectionTitle from '@/components/ui/SectionTitle';
import { EmptyState, SkeletonCard } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getHomeContent, getTestimonials } from '@/lib/api';
import type { Testimonial } from '@/types';

export default function Testimonials() {
  const { settings } = useSiteData();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageContent, setPageContent] = useState<Record<string, unknown>>({});
  const [cta, setCta] = useState<Record<string, unknown>>({});

  useEffect(() => {
    Promise.all([getTestimonials(), getHomeContent()]).then(([data, home]) => {
      setTestimonials(data);
      const section = home?.testimonials;
      if (section && typeof section === 'object' && !Array.isArray(section)) setPageContent(section as Record<string, unknown>);
      const finalCta = home?.final_cta;
      if (finalCta && typeof finalCta === 'object' && !Array.isArray(finalCta)) setCta(finalCta as Record<string, unknown>);
      setLoading(false);
    });
  }, []);

  const text = (key: string, fallback: string) => typeof pageContent[key] === 'string' && pageContent[key] ? pageContent[key] as string : fallback;

  return (
    <>
      <SEO
        title={text('seo_title', 'Testimonials')}
        description={text('meta_description', 'Read testimonials from researchers supported by SciScript Global Scientific Writing Services.')}
        canonicalPath="/testimonials"
        siteSettings={settings}
      />
      <section className="page-hero page-hero--testimonials relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">{text('eyebrow', 'Testimonials')}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">{text('page_heading', text('heading', 'Researcher Perspectives'))}</h1>
            <p className="text-lg text-navy-500 leading-relaxed">{text('page_description', text('description', 'Feedback from researchers and collaborators whose testimonials have been approved for public display.'))}</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow={text('section_eyebrow', 'Client Feedback')} title={text('section_heading', 'Trusted Scientific Communication Support')} subtitle={text('section_description', 'Every testimonial shown here is managed and approved through the admin panel.')} />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          ) : testimonials.length === 0 ? (
            <EmptyState title="Testimonials Coming Soon" message="Approved testimonials will appear here when they are available." icon={MessageSquareQuote} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.article key={testimonial.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.06 }} className="bg-offwhite rounded-2xl border border-navy-100 p-7">
                  <Quote className="w-8 h-8 text-teal-500 mb-5" />
                  <p className="text-navy-600 leading-relaxed italic mb-6">“{testimonial.testimonial}”</p>
                  <div className="flex items-center gap-3">
                    {testimonial.photo ? <img src={testimonial.photo} alt={testimonial.name || 'Testimonial author'} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-navy-200 text-navy-700 flex items-center justify-center font-bold">{(testimonial.name || 'A').charAt(0).toUpperCase()}</div>}
                    <div>
                      <p className="font-semibold text-navy-900 text-sm">{testimonial.name}</p>
                      {testimonial.designation && <p className="text-xs text-navy-500">{testimonial.designation}</p>}
                      {testimonial.organization && <p className="text-xs text-navy-400">{testimonial.organization}</p>}
                      {(testimonial.linkedin_url || testimonial.website_url) && <div className="flex gap-2 mt-1 text-xs"><a href={testimonial.linkedin_url || testimonial.website_url || '#'} target="_blank" rel="noreferrer" className="text-teal-600 hover:text-teal-700">View profile</a></div>}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
      <CTASection title={String(cta.heading || 'Discuss Your Research')} subtitle={String(cta.description || 'Tell us what you are working on and we will help you identify the right scientific writing or publication support service.')} />
    </>
  );
}

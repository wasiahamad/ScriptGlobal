import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, MessageSquareQuote } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import SectionTitle from '@/components/ui/SectionTitle';
import { EmptyState, SkeletonCard } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getTestimonials } from '@/lib/api';
import type { Testimonial } from '@/types';

export default function Testimonials() {
  const { settings } = useSiteData();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestimonials().then((data) => {
      setTestimonials(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <SEO
        title="Testimonials"
        description="Read testimonials from researchers supported by SciScript Global Scientific Writing Services."
        canonicalPath="/testimonials"
        siteSettings={settings}
      />
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-navy-50 via-white to-teal-50/30 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">Testimonials</span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">Researcher Perspectives</h1>
            <p className="text-lg text-navy-500 leading-relaxed">Feedback from researchers and collaborators whose testimonials have been approved for public display.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Client Feedback" title="Trusted Scientific Communication Support" subtitle="Every testimonial shown here is managed and approved through the admin panel." />
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
                    {testimonial.photo ? <img src={testimonial.photo} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-navy-200 text-navy-700 flex items-center justify-center font-bold">{testimonial.name.charAt(0)}</div>}
                    <div>
                      <p className="font-semibold text-navy-900 text-sm">{testimonial.name}</p>
                      {testimonial.designation && <p className="text-xs text-navy-500">{testimonial.designation}</p>}
                      {testimonial.organization && <p className="text-xs text-navy-400">{testimonial.organization}</p>}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
      <CTASection title="Discuss Your Research" subtitle="Tell us what you are working on and we will help you identify the right scientific writing or publication support service." />
    </>
  );
}

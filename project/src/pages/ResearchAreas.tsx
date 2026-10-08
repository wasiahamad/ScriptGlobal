import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getResearchAreas } from '@/lib/api';
import { getIcon } from '@/lib/icons';
import type { ResearchArea } from '@/types';

export default function ResearchAreas() {
  const { settings } = useSiteData();
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getResearchAreas();
      setAreas(data);
      setLoading(false);
    })();
  }, []);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Research Areas', item: '/research-areas' },
    ],
  };

  return (
    <>
      <SEO
        title="Research Areas"
        description="Explore the biomedical and pharmaceutical research domains we support — from pharmacology and drug delivery to cancer research and nanotechnology."
        canonicalPath="/research-areas"
        siteSettings={settings}
        jsonLd={breadcrumb}
      />

      {/* Hero */}
      <section className="page-hero page-hero--research relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">
              Research Areas
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">
              Biomedical & Pharmaceutical Research Domains
            </h1>
            <p className="text-lg text-navy-500 leading-relaxed">
              Our scientific writing and publication support spans a wide range of biomedical,
              pharmaceutical, and interdisciplinary research areas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {areas.map((area, i) => {
                const Icon = getIcon(area.icon);
                return (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <Link
                      to={`/research-areas/${area.slug}`}
                      className="group block h-full bg-offwhite rounded-2xl border border-navy-100 p-7 hover:shadow-xl hover:border-teal-200 transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-xl bg-navy-50 group-hover:bg-teal-50 transition-colors flex items-center justify-center mb-5">
                        <Icon className="w-7 h-7 text-navy-700 group-hover:text-teal-600 transition-colors" />
                      </div>
                      <h2 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-700 transition-colors">
                        {area.name}
                      </h2>
                      <p className="text-sm text-navy-500 leading-relaxed mb-4">
                        {area.short_description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 group-hover:gap-2 transition-all">
                        Explore Area
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Don't See Your Research Area?"
        subtitle="We support many interdisciplinary and emerging research domains beyond those listed here. Reach out to discuss your specific field."
        primaryLabel="Discuss Your Research"
        primaryTo="/contact"
        secondaryLabel="View Our Services"
        secondaryTo="/services"
      />
    </>
  );
}

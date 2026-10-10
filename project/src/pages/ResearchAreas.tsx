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
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((area, i) => {
                const Icon = getIcon(area.icon);
                const areaImage = typeof area.cover_image === 'string' ? area.cover_image : area.cover_image?.url;
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
                      className="group flex h-full min-h-[390px] w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-teal-300 hover:shadow-[0_20px_45px_rgba(15,118,110,0.16)]"
                    >
                      <div className="relative h-44 shrink-0 overflow-hidden bg-gradient-to-br from-[#e6fffb] via-[#f2f8f7] to-[#d9f3ef]">
                        {areaImage ? (
                          <img src={areaImage} alt={area.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="relative flex h-full items-center justify-center overflow-hidden">
                            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[18px] border-teal-200/40" />
                            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full border-[22px] border-white/70" />
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 shadow-sm ring-1 ring-teal-200/70">
                              <Icon className="h-10 w-10 text-teal-700" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/20 to-transparent" />
                        {areaImage && (
                          <div className="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/95 shadow-lg">
                            <Icon className="h-6 w-6 text-teal-700" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Research domain</p>
                        <h2 className="mb-3 text-xl font-bold text-navy-900 transition-colors group-hover:text-teal-700">
                          {area.name}
                        </h2>
                        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-navy-500">
                          {area.short_description || 'Scientific writing and publication support tailored to this research domain.'}
                        </p>
                        <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-teal-600 transition-all group-hover:gap-2">
                          Explore Area
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
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

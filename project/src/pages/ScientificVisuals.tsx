import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, FlaskConical, Maximize2, X } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import { EmptyState, SkeletonCard } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getScientificVisuals, getResearchAreas } from '@/lib/api';
import type { ScientificVisual, ResearchArea } from '@/types';

const visualCategories = [
  'All',
  'Molecular Mechanism Diagrams',
  'Nanoparticle Schematics',
  'Drug Delivery Illustrations',
  'Graphical Abstracts',
  'Disease Pathway Figures',
  'Study Design Flowcharts',
  'PRISMA Flow Diagrams',
  'Scientific Tables',
  'Chemistry Schemes',
];

export default function ScientificVisuals() {
  const { settings } = useSiteData();
  const [visuals, setVisuals] = useState<ScientificVisual[]>([]);
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState<ScientificVisual | null>(null);

  useEffect(() => {
    (async () => {
      const [v, ra] = await Promise.all([getScientificVisuals(), getResearchAreas()]);
      setVisuals(v);
      setResearchAreas(ra);
      setLoading(false);
    })();
  }, []);

  const filteredVisuals = useMemo(() => {
    return visuals.filter((v) => activeCategory === 'All' || v.category === activeCategory);
  }, [visuals, activeCategory]);

  const getAreaName = (id: string | null) => {
    if (!id) return null;
    return researchAreas.find((a) => a.id === id)?.name || null;
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Scientific Visuals', item: '/scientific-visuals' },
    ],
  };

  return (
    <>
      <SEO
        title="Scientific Visuals & Figures"
        description="Gallery of scientific figures: graphical abstracts, molecular mechanism diagrams, nanoparticle schematics, disease pathway figures, PRISMA flow diagrams, and chemistry schemes."
        canonicalPath="/scientific-visuals"
        siteSettings={settings}
        jsonLd={breadcrumb}
      />

      {/* Hero */}
      <section className="page-hero page-hero--visuals relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">
              Scientific Visuals
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">
              Scientific Figures & Visual Communication
            </h1>
            <p className="text-lg text-navy-500 leading-relaxed">
              A gallery of publication-ready scientific visuals — graphical abstracts, molecular mechanism
              diagrams, nanoparticle schematics, drug delivery illustrations, disease pathway figures,
              flowcharts, and PRISMA diagrams.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {visualCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-navy-800 text-white shadow-md'
                    : 'bg-offwhite text-navy-600 border border-navy-200 hover:border-teal-300 hover:text-teal-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredVisuals.length === 0 ? (
            <EmptyState
              title="Visuals Coming Soon"
              message="Our scientific visuals gallery is being curated. Only authorized and public material will be displayed here."
              icon={ImageOff}
            />
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredVisuals.map((visual, i) => {
                  const areaName = getAreaName(visual.research_area_id);
                  return (
                    <motion.div
                      key={visual.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="group bg-offwhite rounded-2xl border border-navy-100 overflow-hidden hover:shadow-xl hover:border-teal-200 transition-all duration-300"
                    >
                      {/* Image */}
                      <div
                        className="aspect-[4/3] bg-navy-50 relative overflow-hidden cursor-pointer"
                        onClick={() => setLightbox(visual)}
                      >
                        {visual.image_url ? (
                          <img
                            src={visual.image_url}
                            alt={visual.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FlaskConical className="w-12 h-12 text-navy-200" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-4 h-4 text-navy-700" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {visual.category && (
                            <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-medium">
                              {visual.category}
                            </span>
                          )}
                          {areaName && (
                            <span className="px-2.5 py-1 rounded-md bg-navy-50 text-navy-600 text-xs font-medium">
                              {areaName}
                            </span>
                          )}
                        </div>
                        <h2 className="font-semibold text-navy-900 mb-2">{visual.title}</h2>
                        {visual.purpose && (
                          <p className="text-sm text-navy-500 leading-relaxed line-clamp-2">{visual.purpose}</p>
                        )}
                        <div className="mt-3 space-y-1">
                          {visual.software_used && (
                            <p className="text-xs text-navy-400">
                              <span className="font-medium">Software:</span> {visual.software_used}
                            </p>
                          )}
                          {visual.publication_status && (
                            <p className="text-xs text-navy-400">
                              <span className="font-medium">Status:</span> {visual.publication_status}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-navy-950/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.image_url && (
                <img src={lightbox.image_url} alt={lightbox.title} className="w-full max-h-[70vh] object-contain bg-navy-50" />
              )}
              <div className="p-6">
                <h3 className="text-lg font-bold text-navy-900 mb-2">{lightbox.title}</h3>
                {lightbox.purpose && <p className="text-sm text-navy-500 mb-3">{lightbox.purpose}</p>}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {lightbox.software_used && (
                    <div><span className="font-medium text-navy-700">Software:</span> <span className="text-navy-500">{lightbox.software_used}</span></div>
                  )}
                  {lightbox.scientific_source && (
                    <div><span className="font-medium text-navy-700">Source:</span> <span className="text-navy-500">{lightbox.scientific_source}</span></div>
                  )}
                  {lightbox.contribution && (
                    <div><span className="font-medium text-navy-700">Contribution:</span> <span className="text-navy-500">{lightbox.contribution}</span></div>
                  )}
                  {lightbox.publication_status && (
                    <div><span className="font-medium text-navy-700">Status:</span> <span className="text-navy-500">{lightbox.publication_status}</span></div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CTASection
        title="Need Custom Scientific Figures?"
        subtitle="We create publication-ready scientific visuals tailored to your research — from graphical abstracts to mechanism diagrams."
        primaryLabel="Request Custom Visuals"
        primaryTo="/contact"
        secondaryLabel="View Portfolio"
        secondaryTo="/portfolio"
      />
    </>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, FileSearch, Calendar, Tag } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import { EmptyState, SkeletonCard } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getProjects, getResearchAreas } from '@/lib/api';
import type { Project, ResearchArea } from '@/types';

const categories = [
  'All',
  'Research Articles',
  'Review Articles',
  'Books & Chapters',
  'Thesis & Dissertation',
  'Scientific Editing',
  'Scientific Figures',
  'Publication Support',
];

export default function Portfolio() {
  const { settings } = useSiteData();
  const [projects, setProjects] = useState<Project[]>([]);
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const [p, ra] = await Promise.all([getProjects(), getResearchAreas()]);
      setProjects(p);
      setResearchAreas(ra);
      setLoading(false);
    })();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        (p.short_description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [projects, activeCategory, search]);

  const getAreaName = (id: string | null) => {
    if (!id) return null;
    return researchAreas.find((a) => a.id === id)?.name || null;
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Portfolio', item: '/portfolio' },
    ],
  };

  return (
    <>
      <SEO
        title="Portfolio"
        description="Explore our scientific writing portfolio — research articles, review articles, scientific editing, figures, and publication support projects across biomedical and pharmaceutical research."
        canonicalPath="/portfolio"
        siteSettings={settings}
        jsonLd={breadcrumb}
      />

      {/* Hero */}
      <section className="page-hero page-hero--portfolio relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">
              Portfolio
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">
              Scientific Writing Portfolio
            </h1>
            <p className="text-lg text-navy-500 leading-relaxed">
              A selection of our scientific writing, editing, and publication support projects
              across biomedical and pharmaceutical research domains.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="mb-8 max-w-xl">
            <input
              type="search"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-offwhite text-navy-800 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              aria-label="Search portfolio projects"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
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

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProjects.length === 0 ? (
            <EmptyState
              title="No Projects Found"
              message={projects.length === 0
                ? "Our portfolio is being curated. Project details will appear here once available."
                : "No projects match your current filters. Try adjusting your search or category."}
              icon={FileSearch}
            />
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, i) => {
                  const areaName = getAreaName(project.research_area_id);
                  const projectImage = typeof project.featured_image === 'string'
                    ? project.featured_image
                    : project.featured_image?.url;
                  const projectImageAlt = typeof project.featured_image === 'object' && project.featured_image
                    ? project.featured_image.alt || project.title
                    : project.title;
                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <Link
                        to={`/portfolio/${project.slug}`}
                        className="group block h-full bg-white rounded-2xl border border-navy-100 overflow-hidden hover:shadow-2xl hover:border-teal-300 hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-teal-800">
                          {projectImage ? (
                            <img src={projectImage} alt={projectImageAlt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <FileSearch className="h-14 w-14 text-teal-200/70" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                          {project.category && (
                            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-teal-800 shadow-sm">
                              <Tag className="h-3 w-3" />
                              {project.category}
                            </span>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {areaName && (
                              <span className="px-2.5 py-1 rounded-md bg-navy-50 text-navy-600 text-xs font-medium">
                                {areaName}
                              </span>
                            )}
                          </div>
                          <h2 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                            {project.title}
                          </h2>
                          <p className="text-sm text-navy-500 leading-relaxed mb-4 line-clamp-3">
                            {project.short_description}
                          </p>
                          <div className="flex items-center justify-between">
                            {project.year && (
                              <span className="inline-flex items-center gap-1 text-xs text-navy-400">
                                <Calendar className="w-3.5 h-3.5" />
                                {project.year}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 group-hover:gap-2 transition-all">
                              View Details
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      <CTASection
        title="Discuss a Similar Research Project"
        subtitle="If you see work that aligns with your research goals, we'd love to discuss how we can support your project."
        primaryLabel="Request Consultation"
        primaryTo="/contact"
        secondaryLabel="Explore Services"
        secondaryTo="/services"
      />
    </>
  );
}

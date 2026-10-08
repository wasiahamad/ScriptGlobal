import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, FileSearch } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getResearchAreaBySlug, getProjects, getPublications } from '@/lib/api';
import { getIcon } from '@/lib/icons';
import type { ResearchArea, Project, Publication } from '@/types';

export default function ResearchAreaDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSiteData();
  const [area, setArea] = useState<ResearchArea | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!slug) {
          setArea(null);
          setProjects([]);
          setPublications([]);
          return;
        }
        const a = await getResearchAreaBySlug(slug);
        setArea(a);
        if (a) {
          const [allProjects, allPubs] = await Promise.all([
            getProjects(),
            getPublications(),
          ]);
          setProjects(allProjects.filter((p) => p.research_area_id === a.id));
          setPublications(allPubs.filter((p) => p.research_area_id === a.id));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (!loading && !area) {
    return (
      <EmptyState
        title="Research Area Not Found"
        message="The research area you are looking for may have been removed or is temporarily unavailable."
        icon={FileSearch}
      />
    );
  }

  if (loading || !area) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-navy-200 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const Icon = getIcon(area.icon);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Research Areas', item: '/research-areas' },
      { '@type': 'ListItem', position: 3, name: area.name, item: `/research-areas/${area.slug}` },
    ],
  };

  return (
    <>
      <SEO
        title={area.seo_title || `${area.name} Research Writing Support`}
        description={area.meta_description || area.short_description || undefined}
        canonicalPath={`/research-areas/${area.slug}`}
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
          >
            <Link to="/research-areas" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-teal-600 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              All Research Areas
            </Link>
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-navy-800 text-teal-400 flex items-center justify-center">
                <Icon className="w-8 h-8" />
              </div>
              {area.cover_image && (
                <img
                  src={typeof area.cover_image === 'string' ? area.cover_image : area.cover_image.url}
                  alt={area.name}
                  className="w-28 h-28 rounded-2xl object-cover border border-navy-100 shadow-sm"
                />
              )}
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 leading-tight mb-3">
                  {area.name}
                </h1>
                {area.short_description && (
                  <p className="text-lg text-teal-600 font-medium max-w-2xl">
                    {area.short_description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      {area.description && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="prose-scientific"
            >
              <p className="text-lg text-navy-500 leading-relaxed">{area.description}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Related projects */}
      {projects.length > 0 && (
        <section className="py-20 bg-offwhite">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-8">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link
                    to={`/portfolio/${p.slug}`}
                    className="group block bg-white rounded-xl border border-navy-100 p-6 hover:shadow-lg hover:border-teal-200 transition-all"
                  >
                    {p.category && (
                      <span className="inline-block px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-medium mb-3">
                        {p.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-navy-900 mb-2 group-hover:text-teal-700 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-sm text-navy-500 leading-relaxed line-clamp-2">
                      {p.short_description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related publications */}
      {publications.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-8">Publications in This Area</h2>
            <div className="space-y-4">
              {publications.map((pub, i) => (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-offwhite border border-navy-100"
                >
                  <div className="flex-1">
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
                      className="text-sm font-medium text-teal-600 hover:text-teal-700 flex-shrink-0"
                    >
                      DOI
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection
        title={`Need Support in ${area.name}?`}
        subtitle={`We provide scientific writing, editing, and publication support tailored to ${area.name.toLowerCase()} research. Let's discuss your project.`}
        primaryLabel="Discuss Your Research"
        primaryTo="/contact"
        secondaryLabel="View All Services"
        secondaryTo="/services"
      />
    </>
  );
}

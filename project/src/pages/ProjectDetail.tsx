import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, FileSearch, CheckCircle2, ExternalLink,
  Tag, Calendar, BookOpen, UserCheck, Award, Target, Beaker, ClipboardCheck
} from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getProjectBySlug, getProjects, getResearchAreas } from '@/lib/api';
import type { Project, ResearchArea } from '@/types';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSiteData();
  const [project, setProject] = useState<Project | null>(null);
  const [related, setRelated] = useState<Project[]>([]);
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!slug) {
          setProject(null);
          setRelated([]);
          setResearchAreas([]);
          return;
        }
        const [p, all, ra] = await Promise.all([
          getProjectBySlug(slug),
          getProjects(),
          getResearchAreas(),
        ]);
        setProject(p);
        setResearchAreas(ra);
        if (p) {
          setRelated(
            all
              .filter((x) => x.slug !== slug && (x.research_area_id === p.research_area_id || x.category === p.category))
              .slice(0, 3)
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (!loading && !project) {
    return (
      <EmptyState
        title="Project Not Found"
        message="The project you are looking for may have been removed or is temporarily unavailable."
        icon={FileSearch}
      />
    );
  }

  if (loading || !project) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-navy-200 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const areaName = project.research_area_id
    ? researchAreas.find((a) => a.id === project.research_area_id)?.name || null
    : null;

  const detailSections: { icon: typeof Target; label: string; content: string | null }[] = [
    { icon: Target, label: 'Project Objective', content: project.objective },
    { icon: BookOpen, label: 'Scientific Context', content: project.scientific_context },
    { icon: Beaker, label: 'Approach', content: project.approach },
    { icon: UserCheck, label: 'Contribution', content: project.contribution },
  ];

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Portfolio', item: '/portfolio' },
      { '@type': 'ListItem', position: 3, name: project.title, item: `/portfolio/${project.slug}` },
    ],
  };

  return (
    <>
      <SEO
        title={project.seo_title || project.title}
        description={project.meta_description || project.short_description || undefined}
        canonicalPath={`/portfolio/${project.slug}`}
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
            <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-teal-600 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              All Projects
            </Link>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {project.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-teal-50 text-teal-700 text-sm font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  {project.category}
                </span>
              )}
              {areaName && (
                <Link
                  to={`/research-areas/${researchAreas.find((a) => a.id === project.research_area_id)?.slug || ''}`}
                  className="px-3 py-1.5 rounded-md bg-navy-50 text-navy-600 text-sm font-medium hover:bg-navy-100 transition-colors"
                >
                  {areaName}
                </Link>
              )}
              {project.year && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-navy-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.year}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 leading-tight mb-4 max-w-4xl">
              {project.title}
            </h1>
            {project.short_description && (
              <p className="text-lg text-navy-500 leading-relaxed max-w-3xl">
                {project.short_description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {project.featured_image && (
        <section className="py-12 bg-offwhite">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <img src={project.featured_image} alt={project.title} className="w-full max-h-[34rem] object-cover rounded-2xl border border-navy-100" />
          </div>
        </section>
      )}

      {/* Details */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {detailSections.map((section, i) => {
                if (!section.content) return null;
                return (
                  <motion.div
                    key={section.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <section.icon className="w-5 h-5 text-teal-600" />
                      <h2 className="text-xl font-bold text-navy-900">{section.label}</h2>
                    </div>
                    <p className="text-navy-500 leading-relaxed">{section.content}</p>
                  </motion.div>
                );
              })}

              {/* CRediT roles */}
              {project.credit_roles && project.credit_roles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <Award className="w-5 h-5 text-teal-600" />
                    <h2 className="text-xl font-bold text-navy-900">Contributor Roles (CRediT)</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.credit_roles.map((role) => (
                      <span key={role} className="px-3 py-1.5 rounded-lg bg-navy-50 text-navy-700 text-sm font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Deliverables */}
              {project.deliverables && project.deliverables.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-bold text-navy-900 mb-4">Deliverables</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.deliverables.map((d) => (
                      <div key={d} className="flex items-start gap-2.5 p-3 rounded-lg bg-offwhite border border-navy-100">
                        <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-navy-700">{d}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quality checks */}
              {project.quality_checks && project.quality_checks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <ClipboardCheck className="w-5 h-5 text-teal-600" />
                    <h2 className="text-xl font-bold text-navy-900">Quality Checks</h2>
                  </div>
                  <div className="space-y-2">
                    {project.quality_checks.map((q) => (
                      <div key={q} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-navy-600">{q}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Images */}
              {project.images && project.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-bold text-navy-900 mb-4">Scientific Figures</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${project.title} - Figure ${i + 1}`}
                        className="w-full rounded-xl border border-navy-100"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* Publication info */}
                <div className="bg-offwhite rounded-2xl border border-navy-100 p-6">
                  <h3 className="font-bold text-navy-900 mb-4">Publication Details</h3>
                  <dl className="space-y-3">
                    {project.publication_status && (
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-navy-400 mb-0.5">Status</dt>
                        <dd className="text-sm text-navy-700">{project.publication_status}</dd>
                      </div>
                    )}
                    {project.target_journal && (
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-navy-400 mb-0.5">Target Journal</dt>
                        <dd className="text-sm text-navy-700">{project.target_journal}</dd>
                      </div>
                    )}
                    {project.doi && (
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-navy-400 mb-0.5">DOI</dt>
                        <dd className="text-sm">
                          <a
                            href={`https://doi.org/${project.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                          >
                            {project.doi}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </dd>
                      </div>
                    )}
                    {project.publication_link && (
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wider text-navy-400 mb-0.5">Link</dt>
                        <dd>
                          <a
                            href={project.publication_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                          >
                            View Publication
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* CTA */}
                <div className="bg-navy-900 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-2">Discuss a Similar Project</h3>
                  <p className="text-sm text-navy-200 mb-4 leading-relaxed">
                    Working on something similar? Let's discuss how we can support your research.
                  </p>
                  <ButtonLink to="/contact" variant="secondary" className="w-full">
                    Discuss Your Research
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related projects */}
      {related.length > 0 && (
        <section className="py-16 bg-offwhite border-t border-navy-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-8">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
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
                    <h3 className="font-semibold text-navy-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
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

      <CTASection />
    </>
  );
}

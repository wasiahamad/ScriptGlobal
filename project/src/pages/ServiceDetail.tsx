import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getServiceBySlug, getServices } from '@/lib/api';
import { getIcon } from '@/lib/icons';
import type { Service } from '@/types';
import { FileSearch } from 'lucide-react';

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSiteData();
  const [service, setService] = useState<Service | null>(null);
  const [related, setRelated] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!slug) {
          setService(null);
          setRelated([]);
          return;
        }
        const [s, all] = await Promise.all([
          getServiceBySlug(slug),
          getServices(),
        ]);
        setService(s);
        setRelated(all.filter((sv) => sv.slug !== slug).slice(0, 3));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (!loading && !service) {
    return (
      <EmptyState
        title="Service Not Found"
        message="The service you are looking for may have been removed or is temporarily unavailable."
        icon={FileSearch}
      />
    );
  }

  if (loading || !service) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-navy-200 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const Icon = getIcon(service.icon);
  const image = typeof service.featured_image === 'string' ? service.featured_image : service.featured_image?.url;
  const imageAlt = service.featured_image && typeof service.featured_image === 'object' ? service.featured_image.alt || service.title : service.title;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: '/services' },
      { '@type': 'ListItem', position: 3, name: service.title, item: `/services/${service.slug}` },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.meta_description || service.short_description || '',
    provider: {
      '@type': 'Organization',
      name: settings?.brand_name || 'SciScript Global Scientific Writing Services',
    },
  };

  return (
    <>
      <SEO
        title={service.seo_title || service.title}
        description={service.meta_description || service.short_description || undefined}
        canonicalPath={`/services/${service.slug}`}
        siteSettings={settings}
        jsonLd={[breadcrumb, serviceSchema]}
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
            <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-teal-600 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              All Services
            </Link>
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-navy-800 text-teal-400 flex items-center justify-center">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 leading-tight mb-3">
                  {service.title}
                </h1>
                {service.tagline && (
                  <p className="text-lg text-teal-600 font-medium">{service.tagline}</p>
                )}
              </div>
            </div>
            {service.short_description && (
              <p className="mt-6 text-lg text-navy-500 leading-relaxed max-w-3xl">
                {service.short_description}
              </p>
            )}
            {image && <img src={image} alt={imageAlt} className="mt-8 w-full max-h-96 object-cover rounded-2xl shadow-lg" />}
          </motion.div>
        </div>
      </section>

      {/* Description + Deliverables */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Overview</h2>
              <div className="prose-scientific">
                <p className="text-navy-500 leading-relaxed">{service.description}</p>
              </div>

              {service.deliverables && service.deliverables.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-navy-900 mb-4 mt-10">Deliverables</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.deliverables.map((d, i) => (
                      <motion.div
                        key={d}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-offwhite border border-navy-100"
                      >
                        <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-navy-700">{d}</span>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
              {service.benefits && service.benefits.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-navy-900 mb-4 mt-10">Benefits</h2>
                  <ul className="space-y-3">{service.benefits.map((item) => <li key={item} className="flex gap-2 text-navy-600"><CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />{item}</li>)}</ul>
                </>
              )}
              {service.process && service.process.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-navy-900 mb-4 mt-10">Our Process</h2>
                  <ol className="space-y-3 list-decimal list-inside text-navy-600">{service.process.map((item) => <li key={item}>{typeof item === 'string' ? item : String(item)}</li>)}</ol>
                </>
              )}
            </motion.div>

            {/* Sidebar CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-28 bg-navy-900 rounded-2xl p-8 text-white">
                <h3 className="text-lg font-bold mb-3">Discuss This Service</h3>
                <p className="text-sm text-navy-200 leading-relaxed mb-6">
                  Want to know if this service fits your research? Let's discuss your project.
                </p>
                <ButtonLink to="/contact" variant="secondary" size="md" className="w-full">
                  Request Consultation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </ButtonLink>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related services */}
      {related.length > 0 && (
        <section className="py-16 bg-offwhite border-t border-navy-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-8">Related Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((s, i) => {
                const RIcon = getIcon(s.icon);
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <Link
                      to={`/services/${s.slug}`}
                      className="group block bg-white rounded-xl border border-navy-100 p-6 hover:shadow-lg hover:border-teal-200 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-navy-50 group-hover:bg-teal-50 transition-colors flex items-center justify-center mb-3">
                        <RIcon className="w-5 h-5 text-navy-700 group-hover:text-teal-600 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-navy-900 mb-1 text-sm group-hover:text-teal-700 transition-colors">
                        {s.title}
                      </h3>
                      <p className="text-xs text-navy-500 leading-relaxed line-clamp-2">
                        {s.short_description}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <CTASection
        title={`Ready to Discuss ${service.title}?`}
        subtitle="Share your research goals and let us help you communicate your science with clarity and precision."
        primaryLabel="Discuss Your Research"
        primaryTo="/contact"
        secondaryLabel="View Portfolio"
        secondaryTo="/portfolio"
      />
    </>
  );
}

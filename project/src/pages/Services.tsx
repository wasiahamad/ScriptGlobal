import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import SectionTitle from '@/components/ui/SectionTitle';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getServices } from '@/lib/api';
import { getIcon } from '@/lib/icons';
import type { Service } from '@/types';

export default function Services() {
  const { settings } = useSiteData();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getServices();
      setServices(data);
      setLoading(false);
    })();
  }, []);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: '/services' },
    ],
  };

  return (
    <>
      <SEO
        title="Scientific Writing & Publication Services"
        description="Explore our scientific writing services: research article writing, review articles, scientific editing, citation verification, scientific figures, and publication support."
        canonicalPath="/services"
        siteSettings={settings}
        jsonLd={breadcrumb}
      />

      {/* Hero */}
      <section className="page-hero page-hero--services relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">
              Our Services
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">
              Scientific Writing & Publication Support Services
            </h1>
            <p className="text-lg text-navy-500 leading-relaxed">
              Comprehensive, evidence-based services covering the full research communication lifecycle —
              from manuscript development and scientific editing to citation verification, figure design, and journal submission.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : services.length === 0 ? (
            <SectionTitle title="Services Coming Soon" subtitle="Our service catalog is being updated. Please check back shortly." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, i) => {
                const Icon = getIcon(service.icon);
                const image = typeof service.featured_image === 'string' ? service.featured_image : service.featured_image?.url;
                const imageAlt = service.featured_image && typeof service.featured_image === 'object' ? service.featured_image.alt || service.title : service.title;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                  >
                    <Link
                      to={`/services/${service.slug}`}
                      className="group flex h-full min-h-[620px] flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-2xl"
                    >
                      <div className="relative h-56 shrink-0 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-teal-800">
                        {image ? (
                          <img src={image} alt={imageAlt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Icon className="h-16 w-16 text-teal-200/80" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-5 left-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 shadow-lg">
                          <Icon className="h-6 w-6 text-teal-700" />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-8">
                      <div className="mb-5">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-navy-900 mb-1 group-hover:text-teal-700 transition-colors">
                            {service.title}
                          </h2>
                          {service.tagline && (
                            <p className="text-sm text-teal-600 font-medium">{service.tagline}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-navy-500 leading-relaxed mb-5">
                        {service.short_description}
                      </p>
                      {service.benefits && service.benefits.length > 0 && (
                        <ul className="space-y-1 mb-5 text-sm text-navy-600">
                          {service.benefits.slice(0, 3).map((benefit) => <li key={benefit} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />{benefit}</li>)}
                        </ul>
                      )}
                      {service.deliverables && service.deliverables.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                          {service.deliverables.slice(0, 4).map((d) => (
                            <span key={d} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-navy-100 text-xs text-navy-600">
                              <CheckCircle2 className="w-3 h-3 text-teal-500" />
                              {d}
                            </span>
                          ))}
                          {service.deliverables.length > 4 && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs text-navy-400">
                              +{service.deliverables.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 group-hover:gap-2.5 transition-all">
                        View Service Details
                        <ArrowRight className="w-4 h-4" />
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
        title="Need a Specific Service?"
        subtitle="If your research requires a combination of services or something not listed here, we are happy to discuss your specific needs."
        primaryLabel="Request Consultation"
        primaryTo="/contact"
        secondaryLabel="Explore Research Areas"
        secondaryTo="/research-areas"
      />
    </>
  );
}

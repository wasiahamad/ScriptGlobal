import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Atom, Mail, Phone, MapPin, Linkedin, ExternalLink } from 'lucide-react';
import type { SiteSettings } from '@/types';
import { getPublicFooter, type PublicFooterContent } from '@/lib/api';

const footerLinks = [
  {
    title: 'Services',
    links: [
      { label: 'Research Article Writing', to: '/services/research-article-writing' },
      { label: 'Review Article Writing', to: '/services/review-article-writing' },
      { label: 'Scientific Editing', to: '/services/scientific-editing' },
      { label: 'Scientific Figures', to: '/services/scientific-figures-visual-communication' },
      { label: 'Journal Formatting', to: '/services/journal-formatting-submission-support' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Research Areas', to: '/research-areas' },
      { label: 'Portfolio', to: '/portfolio' },
      { label: 'Scientific Visuals', to: '/scientific-visuals' },
      { label: 'Publication Support', to: '/publication-support' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Insights', to: '/insights' },
      { label: 'Testimonials', to: '/testimonials' },
      { label: 'FAQs', to: '/faqs' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

export default function Footer({ siteSettings }: { siteSettings: SiteSettings | null }) {
  const year = new Date().getFullYear();
  const [footer, setFooter] = useState<PublicFooterContent | null>(null);
  useEffect(() => { getPublicFooter().then(setFooter); }, []);
  const footerColumns = footer?.navigation_groups?.length
    ? footer.navigation_groups.map((group) => ({
      title: group.title || '',
      links: (group.links || []).map((link) => ({ label: link.label || '', to: link.url || '#' })),
    }))
    : footerLinks;
  const contact = footer?.contact || {};
  const social = footer?.social_links || {};

  return (
    <footer className="bg-navy-900 text-navy-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy-800 text-teal-400">
                <Atom className="w-5 h-5" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-bold text-lg text-white">{footer?.brand_name || 'SciScript'}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-teal-400">
                  Global Scientific Writing
                </span>
              </span>
            </Link>
            <p className="text-sm text-navy-300 leading-relaxed max-w-sm mb-6">
              {footer?.description || 'Evidence-based scientific writing, manuscript development, scientific editing, citation verification, and publication support for biomedical and pharmaceutical research.'}
            </p>

            {/* Contact info */}
            <div className="space-y-2.5 text-sm">
              {(contact.email || siteSettings?.contact_email) && (
                <a href={`mailto:${contact.email || siteSettings?.contact_email}`} className="flex items-center gap-2.5 text-navy-300 hover:text-teal-400 transition-colors">
                  <Mail className="w-4 h-4 text-teal-500" />
                  {contact.email || siteSettings?.contact_email}
                </a>
              )}
              {(contact.phone || siteSettings?.contact_phone) && (
                <a href={`tel:${contact.phone || siteSettings?.contact_phone}`} className="flex items-center gap-2.5 text-navy-300 hover:text-teal-400 transition-colors">
                  <Phone className="w-4 h-4 text-teal-500" />
                  {contact.phone || siteSettings?.contact_phone}
                </a>
              )}
              {(contact.location || siteSettings?.contact_location) && (
                <div className="flex items-center gap-2.5 text-navy-300">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  {contact.location || siteSettings?.contact_location}
                </div>
              )}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-navy-300 hover:text-teal-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-navy-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-navy-400">
            {footer?.copyright_text || `© ${year} ${siteSettings?.brand_name || footer?.brand_name || 'SciScript Global Scientific Writing Services'}. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4 text-xs text-navy-400">
            <Link to={footer?.legal?.privacy || '/privacy'} className="hover:text-teal-400">Privacy Policy</Link>
            <Link to={footer?.legal?.terms || '/terms'} className="hover:text-teal-400">Terms & Conditions</Link>
          </div>
          <div className="flex items-center gap-4">
            {(social.linkedin || siteSettings?.linkedin_url) && (
              <a href={social.linkedin || siteSettings?.linkedin_url || undefined} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-teal-400 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {(social.orcid || siteSettings?.orcid_url) && (
              <a href={social.orcid || siteSettings?.orcid_url || undefined} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-teal-400 transition-colors text-xs font-medium" aria-label="ORCID">
                ORCID
              </a>
            )}
            {(social.google_scholar || siteSettings?.google_scholar_url) && (
              <a href={social.google_scholar || siteSettings?.google_scholar_url || undefined} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-teal-400 transition-colors text-xs font-medium" aria-label="Google Scholar">
                Scholar
              </a>
            )}
            {(social.whatsapp || siteSettings?.whatsapp_url) && (
              <a href={social.whatsapp || siteSettings?.whatsapp_url || undefined} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-teal-400 transition-colors text-xs font-medium" aria-label="WhatsApp">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

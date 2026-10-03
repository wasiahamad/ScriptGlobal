import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const labels: Record<string, string> = {
  about: 'About',
  services: 'Services',
  'research-areas': 'Expertise',
  portfolio: 'Work',
  'scientific-visuals': 'Scientific Visuals',
  'publication-support': 'Publication Support',
  testimonials: 'Testimonials',
  insights: 'Research',
  contact: 'Contact',
  faqs: 'FAQ',
};

function formatSegment(segment: string) {
  return labels[segment] || segment.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="border-b border-[#e5e5e5] bg-white/90" aria-label="Breadcrumb">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-1.5 font-semibold text-[#171717] transition-colors hover:text-[#0f766e]">
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          Home
        </Link>
        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join('/')}`;
          const isCurrent = index === segments.length - 1;
          return (
            <span key={path} className="inline-flex items-center gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-[#737373]" aria-hidden="true" />
              {isCurrent ? (
                <span className="font-medium text-[#617888]" aria-current="page">{formatSegment(segment)}</span>
              ) : (
                <Link to={path} className="font-semibold text-[#171717] transition-colors hover:text-[#0f766e]">{formatSegment(segment)}</Link>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}

import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { getPublicNavigation } from '@/lib/api';
import { useSiteData } from '@/context/SiteDataContext';

const defaultNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/insights', label: 'Insights' },
  { to: '/research-areas', label: 'Expertise' },
  { to: '/portfolio', label: 'Work' },
  { to: '/faqs', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { settings } = useSiteData();
  const [navLinks, setNavLinks] = useState(defaultNavLinks);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    getPublicNavigation().then((items) => {
      if (items.length > 0) setNavLinks(items.map((item) => ({ to: item.url || '/', label: item.label })));
    });
  }, []);

  return (
    <>
      <header
        className={`scientific-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'shadow-lg border-b border-[#e5e5e5]'
            : 'border-b border-[#e5e5e5]'
        }`}
      >
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex min-w-0 items-center gap-2.5 group" aria-label="SciScript Global home">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 transition-colors group-hover:ring-teal-300">
                <img src="/images/sciscript-logo.png" alt="" className="h-full w-full object-cover" />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate text-sm font-bold text-[#0a0a0a] transition-colors sm:text-base lg:text-lg">
                  {settings?.brand_name || 'SciScript'}
                </span>
                  <span className="hidden text-[10px] font-medium uppercase tracking-wider text-[#0f766e] transition-colors sm:block">
                  {settings?.tagline || 'Global Scientific Writing'}
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden xl:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative px-3 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-teal-700 bg-teal-50'
                        : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <span className="inline-flex items-center gap-1">
                      {link.label}
                      {link.to === '/services' && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                      {isActive && <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-teal-500" />}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-3">
              <Link
                to="/contact"
                className="group hidden lg:inline-flex items-center gap-2 px-5 py-3 text-[13px] font-bold bg-navy-800 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {settings?.hero_cta_primary || 'Discuss Your Research'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-navy-700 hover:bg-navy-100 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 xl:hidden"
          >
            <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto"
            >
              <div className="pt-20 px-4 pb-6">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'text-teal-600 bg-teal-50'
                            : 'text-navy-700 hover:bg-navy-50'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
                <Link
                  to="/contact"
                  className="mt-4 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-navy-800 text-white rounded-xl hover:bg-teal-700 transition-all shadow-md"
                >
                  {settings?.hero_cta_primary || 'Discuss Your Research'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

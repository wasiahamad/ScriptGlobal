import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Home,
  User,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Image,
  FileText,
  Send,
  HelpCircle,
  MessageSquare,
  Menu as MenuIcon,
  ChevronDown,
  ChevronLeft,
  Settings,
  Globe,
  Link as LinkIcon,
  Phone,
  Image as ImageIcon,
  Search,
  Users,
  Activity,
  FlaskConical,
  X,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavSection {
  label: string;
  items: { to: string; label: string; icon: typeof Home }[];
}

const navSections: NavSection[] = [
  {
    label: '',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Content',
    items: [
      { to: '/content/home', label: 'Home', icon: Home },
      { to: '/content/about', label: 'About', icon: User },
      { to: '/services', label: 'Services', icon: Briefcase },
      { to: '/expertise', label: 'Research Areas', icon: GraduationCap },
      { to: '/projects', label: 'Portfolio', icon: FolderKanban },
      { to: '/scientific-visuals', label: 'Scientific Visuals', icon: Image },
      { to: '/content/publication-support', label: 'Publication Support', icon: Send },
      { to: '/insights', label: 'Insights', icon: FileText },
      { to: '/testimonials', label: 'Testimonials', icon: MessageSquare },
      { to: '/faqs', label: 'FAQs', icon: HelpCircle },
      { to: '/website/contact', label: 'Contact', icon: Phone },
      { to: '/contact-inquiries', label: 'Contact Inquiries', icon: MessageSquare },
    ],
  },
  {
    label: 'Website',
    items: [
      { to: '/website/navigation', label: 'Navigation', icon: MenuIcon },
      { to: '/website/footer', label: 'Footer', icon: Globe },
      { to: '/website/settings', label: 'Global Settings', icon: Settings },
    ],
  },
  {
    label: 'Media',
    items: [{ to: '/media', label: 'Media Library', icon: ImageIcon }],
  },
  {
    label: 'SEO',
    items: [
      { to: '/seo/global', label: 'Global SEO', icon: Search },
      { to: '/seo/pages', label: 'Page SEO', icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/system/admin-users', label: 'Admin Users', icon: Users },
      { to: '/system/activity-logs', label: 'Activity Logs', icon: Activity },
      { to: '/system/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center gap-3 px-4 h-16 border-b border-slate-800 flex-shrink-0', collapsed && 'justify-center')}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal-600/20 border border-teal-500/30 flex-shrink-0">
            <FlaskConical className="w-5 h-5 text-teal-400" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-bold text-white text-sm leading-tight">SciScript</p>
              <p className="text-xs text-slate-500 leading-tight">Admin CMS</p>
            </div>
          )}
          <button onClick={onClose} className="lg:hidden ml-auto text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {navSections.map((section, si) => (
            <div key={si}>
              {section.label && !collapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group',
                        isActive
                          ? 'bg-teal-600/15 text-teal-400'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
                        collapsed && 'justify-center'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-teal-400"
                        />
                      )}
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-800 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-slate-800 p-2 hidden lg:block">
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export { ChevronDown, ChevronLeft };

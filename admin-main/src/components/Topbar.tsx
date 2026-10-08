import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, Sun, Moon, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/apiClient';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { session, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ type: string; label: string; id: string }[]>([]);
  const [inquiries, setInquiries] = useState<{ _id: string; name: string; projectDescription: string; createdAt: string; status: string }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const data = await apiRequest<typeof inquiries>('/api/v1/admin/contact-inquiries');
        if (active) setInquiries(data.filter((item) => item.status === 'new').slice(0, 5));
      } catch { /* authentication/loading errors are handled by the page */ }
    };
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast('Signed out successfully', 'info');
    navigate('/login');
  };

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const tables = [
      { table: 'services', type: 'Service', field: 'name' },
      { table: 'projects', type: 'Project', field: 'title' },
      { table: 'publications', type: 'Publication', field: 'title' },
      { table: 'research', type: 'Research', field: 'title' },
      { table: 'faqs', type: 'FAQ', field: 'question' },
      { table: 'scientific_visuals', type: 'Visual', field: 'title' },
      { table: 'expertise', type: 'Expertise', field: 'name' },
    ];
    const results: { type: string; label: string; id: string }[] = [];
    await Promise.all(
      tables.map(async ({ table, type, field }) => {
        const { data } = await supabase
          .from(table)
          .select(`id, ${field}`)
          .ilike(field, `%${q}%`)
          .limit(3);
        if (data) {
          (data as unknown as Record<string, unknown>[]).forEach((row) => {
            results.push({ type, label: row[field] as string, id: row.id as string });
          });
        }
      })
    );
    setSearchResults(results);
    setSearching(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center gap-4 px-4">
      <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white">
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={() => setShowSearch(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors w-64 max-w-full"
      >
        <Search className="h-4 w-4" />
        <span>Search everything...</span>
        <kbd className="ml-auto text-xs bg-slate-700 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative">
          <Bell className="h-5 w-5" />
          {inquiries.length > 0 && <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] text-white">{inquiries.length}</span>}
        </button>
        <AnimatePresence>
          {showNotifications && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-20 top-14 z-40 w-80 card p-3 shadow-xl">
              <div className="flex items-center justify-between mb-2"><p className="font-medium text-white">New contact inquiries</p><button onClick={() => navigate('/contact-inquiries')} className="text-xs text-teal-400">View all</button></div>
              {inquiries.length ? inquiries.map((item) => <button key={item._id} onClick={() => navigate('/contact-inquiries')} className="block w-full text-left border-t border-slate-800 py-2"><p className="text-sm text-slate-200">{item.name}</p><p className="text-xs text-slate-500 truncate">{item.projectDescription}</p></button>) : <p className="text-sm text-slate-500 py-3">No new inquiries.</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600/20 border border-teal-500/30 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-sm text-slate-200 hidden sm:block">
              {session?.user?.email?.split('@')[0] || 'Admin'}
            </span>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 card p-2 shadow-xl"
              >
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-sm font-medium text-white truncate">{session?.user?.email}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSearch(false)}
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 px-4"
          >
            <motion.div
              ref={searchRef}
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl card p-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <Search className="h-5 w-5 text-slate-500" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    runSearch(e.target.value);
                  }}
                  placeholder="Search services, projects, publications..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                />
                {searching && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                <kbd className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">ESC</kbd>
              </div>
              <div className="mt-3 max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                    >
                      <span className={cn('badge bg-teal-500/10 text-teal-400')}>{r.type}</span>
                      <span className="text-sm text-slate-200 truncate">{r.label}</span>
                    </div>
                  ))
                ) : searchQuery ? (
                  !searching && <p className="text-sm text-slate-500 text-center py-8">No results found</p>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">Start typing to search...</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

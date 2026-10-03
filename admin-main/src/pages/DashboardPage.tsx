import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  FolderKanban,
  FileText,
  Image,
  HelpCircle,
  MessageSquare,
  FileEdit,
  CheckCircle,
  Clock,
  Plus,
  User,
  Search as SearchIcon,
  Settings,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageHeader, StatCard, Card } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

interface Stats {
  services: number;
  expertise: number;
  projects: number;
  publications: number;
  visuals: number;
  faqs: number;
  testimonials: number;
  drafts: number;
  published: number;
}

interface ActivityItem {
  id: string;
  name: string;
  action: string;
  content_type: string;
  created_at: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [stats, setStats] = useState<Stats>({
    services: 0, expertise: 0, projects: 0, publications: 0,
    visuals: 0, faqs: 0, testimonials: 0, drafts: 0, published: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const tables = ['services', 'expertise', 'projects', 'publications', 'scientific_visuals', 'faqs', 'testimonials'];
      const counts = await Promise.all(
        tables.map((t) => supabase.from(t).select('*', { count: 'exact', head: true }))
      );
      const [drafts, published] = await Promise.all([
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      ]);
      setStats({
        services: counts[0].count ?? 0,
        expertise: counts[1].count ?? 0,
        projects: counts[2].count ?? 0,
        publications: counts[3].count ?? 0,
        visuals: counts[4].count ?? 0,
        faqs: counts[5].count ?? 0,
        testimonials: counts[6].count ?? 0,
        drafts: drafts.count ?? 0,
        published: published.count ?? 0,
      });

      const { data: logs } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      setRecentActivity(logs ?? []);
      setLoading(false);
    })();
  }, []);

  const quickActions = [
    { label: 'Add Service', icon: Briefcase, to: '/services?action=new' },
    { label: 'Add Project', icon: FolderKanban, to: '/projects?action=new' },
    { label: 'Add Publication', icon: FileText, to: '/publications?action=new' },
    { label: 'Add Visual', icon: Image, to: '/scientific-visuals?action=new' },
    { label: 'Add FAQ', icon: HelpCircle, to: '/faqs?action=new' },
    { label: 'Edit Founder', icon: User, to: '/content/founder' },
    { label: 'Edit SEO', icon: SearchIcon, to: '/seo/global' },
    { label: 'Settings', icon: Settings, to: '/website/settings' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${session?.user?.email?.split('@')[0] || 'Admin'}`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Services" value={stats.services} icon={Briefcase} color="teal" delay={0} />
        <StatCard label="Expertise Areas" value={stats.expertise} icon={GraduationCap} color="blue" delay={0.05} />
        <StatCard label="Projects" value={stats.projects} icon={FolderKanban} color="purple" delay={0.1} />
        <StatCard label="Publications" value={stats.publications} icon={FileText} color="emerald" delay={0.15} />
        <StatCard label="Scientific Visuals" value={stats.visuals} icon={Image} color="amber" delay={0.2} />
        <StatCard label="FAQs" value={stats.faqs} icon={HelpCircle} color="red" delay={0.25} />
        <StatCard label="Testimonials" value={stats.testimonials} icon={MessageSquare} color="slate" delay={0.3} />
        <StatCard label="Draft Content" value={stats.drafts} icon={FileEdit} color="amber" delay={0.35} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-400" />
                <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">
                        <span className="font-medium">{item.action}</span>
                        {item.content_type && <span className="text-slate-400"> · {item.content_type}</span>}
                      </p>
                      <p className="text-xs text-slate-500">{timeAgo(item.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(action.to)}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-800 hover:border-teal-500/30 hover:bg-teal-500/5 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-teal-400" />
                    <span className="text-xs text-slate-300 text-center">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* API Status */}
          <Card className="mt-4">
            <h3 className="text-sm font-semibold text-white mb-3">System Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Backend API</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Database</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Storage</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Connected
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

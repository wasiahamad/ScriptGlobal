import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-red-500/10 text-red-400 border-red-500/20',
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  true: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    false: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  yes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    no: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  enabled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    disabled: 'bg-red-500/10 text-red-400 border-red-500/20',
  on: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    off: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  connected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    disconnected: 'bg-red-500/10 text-red-400 border-red-500/20',
  available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    unavailable: 'bg-red-500/10 text-red-400 border-red-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    expired: 'bg-red-500/10 text-red-400 border-red-500/20',
    revoked: 'bg-red-500/10 text-red-400 border-red-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    unresolved: 'bg-red-500/10 text-red-400 border-red-500/20',
    read: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    unread: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  };
  const style = styles[status.toLowerCase()] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  return (
    <span className={cn('badge border', style)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('card p-5', className)}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: typeof import('lucide-react').FileText;
  color?: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, color = 'teal', delay = 0 }: StatCardProps) {
  const colors: Record<string, string> = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </motion.div>
  );
}

interface EmptyStateProps {
  icon: typeof import('lucide-react').FileText;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface LoadingStateProps {
  rows?: number;
}

export function TableLoading({ rows = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="h-4 w-4 rounded bg-slate-800 animate-pulse" />
          <div className="h-4 w-1/3 rounded bg-slate-800 animate-pulse" />
          <div className="h-4 w-1/4 rounded bg-slate-800 animate-pulse ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
    </div>
  );
}

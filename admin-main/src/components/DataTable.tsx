import { type ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, MoreHorizontal, Pencil, Trash2, Copy, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onDuplicate?: (row: T) => void;
  onView?: (row: T) => void;
  search?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  pageSize?: number;
  emptyState?: ReactNode;
  rowActions?: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  search = true,
  searchPlaceholder = 'Search...',
  searchFields,
  pageSize = 10,
  emptyState,
  rowActions,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = search && query && searchFields
    ? data.filter((row) =>
        searchFields.some((field) =>
          String(row[field] ?? '').toLowerCase().includes(query.toLowerCase())
        )
      )
    : data;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey];
        const bv = (b as Record<string, unknown>)[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-4">
      {search && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="input pl-10"
          />
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider',
                      col.sortable && 'cursor-pointer hover:text-slate-200',
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        <ArrowUpDown className={cn('h-3 w-3', sortKey === col.key && 'text-teal-400')} />
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete || onDuplicate || onView || rowActions) && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 rounded bg-slate-800 animate-pulse" />
                      </td>
                    ))}
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-12 text-center">
                    {emptyState || <p className="text-sm text-slate-500">No data found</p>}
                  </td>
                </tr>
              ) : (
                paged.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 text-sm text-slate-200', col.className)}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                    {(onEdit || onDelete || onDuplicate || onView || rowActions) && (
                      <td className="px-4 py-3 text-right relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === row.id ? null : row.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        <AnimatePresence>
                          {openMenu === row.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-4 top-12 z-20 w-40 card p-1 shadow-xl"
                              >
                                {onView && (
                                  <button
                                    onClick={() => { onView(row); setOpenMenu(null); }}
                                    className="flex items-center gap-2 px-3 py-1.5 w-full rounded-md text-sm text-slate-300 hover:bg-slate-800"
                                  >
                                    <Eye className="h-3.5 w-3.5" /> View
                                  </button>
                                )}
                                {onEdit && (
                                  <button
                                    onClick={() => { onEdit(row); setOpenMenu(null); }}
                                    className="flex items-center gap-2 px-3 py-1.5 w-full rounded-md text-sm text-slate-300 hover:bg-slate-800"
                                  >
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                  </button>
                                )}
                                {onDuplicate && (
                                  <button
                                    onClick={() => { onDuplicate(row); setOpenMenu(null); }}
                                    className="flex items-center gap-2 px-3 py-1.5 w-full rounded-md text-sm text-slate-300 hover:bg-slate-800"
                                  >
                                    <Copy className="h-3.5 w-3.5" /> Duplicate
                                  </button>
                                )}
                                {rowActions && rowActions(row)}
                                {onDelete && (
                                  <button
                                    onClick={() => { onDelete(row); setOpenMenu(null); }}
                                    className="flex items-center gap-2 px-3 py-1.5 w-full rounded-md text-sm text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="btn btn-secondary p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-400">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="btn btn-secondary p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

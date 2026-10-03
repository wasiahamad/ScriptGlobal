export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6 animate-pulse">
      <div className="w-12 h-12 bg-navy-100 rounded-lg mb-4"></div>
      <div className="h-5 bg-navy-100 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-navy-100 rounded w-full mb-2"></div>
      <div className="h-4 bg-navy-100 rounded w-5/6 mb-2"></div>
      <div className="h-4 bg-navy-100 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonLine({ width = 'full' }: { width?: string }) {
  const w = width === 'full' ? 'w-full' : width;
  return <div className={`h-4 bg-navy-100 rounded ${w} animate-pulse`}></div>;
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon: Icon,
}: {
  title: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="text-center py-16 px-4">
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-50 text-navy-300 mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-navy-700 mb-2">{title}</h3>
      {message && <p className="text-navy-400 max-w-md mx-auto">{message}</p>}
    </div>
  );
}

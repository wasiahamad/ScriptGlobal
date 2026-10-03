import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, BookOpen, Search } from 'lucide-react';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import { EmptyState, SkeletonCard } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getBlogPosts } from '@/lib/api';
import type { BlogPost } from '@/types';

export default function Insights() {
  const { settings } = useSiteData();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter((post) => `${post.title} ${post.excerpt || ''} ${post.category || ''}`.toLowerCase().includes(query));
  }, [posts, search]);

  return (
    <>
      <SEO title="Scientific Insights" description="Evidence-based insights on scientific writing, biomedical research, literature reviews, scientific editing, and publication support." canonicalPath="/insights" siteSettings={settings} />
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-navy-50 via-white to-teal-50/30 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">Insights</span>
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">Scientific Writing & Research Insights</h1>
            <p className="text-lg text-navy-500 leading-relaxed">Practical, evidence-based guidance for researchers preparing manuscripts, reviews, figures, and journal submissions.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-xl mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Search insights" aria-label="Search insights" className="w-full pl-12 pr-4 py-3 rounded-lg border border-navy-200 bg-offwhite text-navy-800 placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div> : filteredPosts.length === 0 ? <EmptyState title="Insights Coming Soon" message="Published articles will appear here when they are available." icon={BookOpen} /> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.06 }} className="group bg-offwhite rounded-2xl border border-navy-100 overflow-hidden hover:shadow-xl hover:border-teal-200 transition-all">
                {post.featured_image ? <img src={post.featured_image} alt={post.title} loading="lazy" className="w-full aspect-[16/9] object-cover" /> : <div className="w-full aspect-[16/9] bg-gradient-to-br from-navy-800 to-teal-700 flex items-center justify-center"><BookOpen className="w-12 h-12 text-teal-200" /></div>}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">{post.category && <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-medium">{post.category}</span>}{post.published_at && <span className="inline-flex items-center gap-1 text-xs text-navy-400"><Calendar className="w-3.5 h-3.5" />{new Date(post.published_at).toLocaleDateString()}</span>}</div>
                  <h2 className="text-lg font-bold text-navy-900 mb-2 group-hover:text-teal-700 transition-colors">{post.title}</h2>
                  <p className="text-sm text-navy-500 leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
                  <Link to={`/insights/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 group-hover:gap-2.5 transition-all">Read Insight <ArrowRight className="w-4 h-4" /></Link>
                </div>
              </motion.article>
            ))}
          </div>}
        </div>
      </section>
      <CTASection title="Have a Research Question?" subtitle="Reach out for scientific writing, editing, literature review, or publication support tailored to your project." />
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import CTASection from '@/components/sections/CTASection';
import { EmptyState } from '@/components/ui/Skeleton';
import { useSiteData } from '@/context/SiteDataContext';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/api';
import type { BlogPost } from '@/types';

export default function InsightDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSiteData();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!slug) {
          setPost(null);
          setRelated([]);
          return;
        }
        const [current, all] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts()]);
        setPost(current);
        setRelated(all.filter((item) => item.slug !== slug && item.category === current?.category).slice(0, 3));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (!loading && !post) return <EmptyState title="Insight Not Found" message="This article is unavailable or has not been published." icon={FileSearch} />;
  if (loading || !post) return <div className="min-h-[50vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-navy-200 border-t-teal-500 rounded-full animate-spin" /></div>;

  const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.meta_description || post.excerpt || '', author: post.author ? { '@type': 'Person', name: post.author } : undefined, datePublished: post.published_at || undefined, dateModified: post.updated_at || undefined };

  return (
    <>
      <SEO title={post.seo_title || post.title} description={post.meta_description || post.excerpt || undefined} canonicalPath={post.canonical_url || `/insights/${post.slug}`} type="article" image={post.featured_image || undefined} siteSettings={settings} jsonLd={articleSchema} />
      <article>
        <header className="relative py-20 lg:py-28 bg-gradient-to-br from-navy-50 via-white to-teal-50/30 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link to="/insights" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-teal-600 mb-6"><ArrowLeft className="w-4 h-4" /> All Insights</Link>
            <div className="flex items-center gap-3 mb-4 flex-wrap">{post.category && <span className="px-3 py-1.5 rounded-md bg-teal-50 text-teal-700 text-sm font-medium">{post.category}</span>}{post.published_at && <span className="inline-flex items-center gap-1.5 text-sm text-navy-400"><Calendar className="w-4 h-4" />{new Date(post.published_at).toLocaleDateString()}</span>}</div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-5">{post.title}</motion.h1>
            {post.excerpt && <p className="text-lg text-navy-500 leading-relaxed">{post.excerpt}</p>}
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          {post.featured_image && <img src={post.featured_image} alt={post.title} className="w-full max-h-[28rem] object-cover rounded-2xl mb-12" />}
          <div className="prose-scientific whitespace-pre-line text-base">{post.content || 'This insight does not have published content yet.'}</div>
          {post.author && <p className="mt-10 pt-6 border-t border-navy-100 text-sm text-navy-500">Written by <span className="font-semibold text-navy-700">{post.author}</span></p>}
        </div>
      </article>
      {related.length > 0 && <section className="py-16 bg-offwhite"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><h2 className="text-2xl font-bold text-navy-900 mb-8">Related Insights</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{related.map((item) => <Link key={item.id} to={`/insights/${item.slug}`} className="group bg-white rounded-xl border border-navy-100 p-6 hover:shadow-lg hover:border-teal-200 transition-all"><h3 className="font-semibold text-navy-900 group-hover:text-teal-700 mb-2">{item.title}</h3><p className="text-sm text-navy-500 line-clamp-2">{item.excerpt}</p><span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 mt-4">Read more <ArrowRight className="w-4 h-4" /></span></Link>)}</div></div></section>}
      <CTASection />
    </>
  );
}

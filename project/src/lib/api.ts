import { supabase } from './supabase';
import type {
  SiteSettings,
  Service,
  ResearchArea,
  Project,
  Publication,
  ScientificVisual,
  Testimonial,
  Faq,
  BlogPost,
  ContactSubmission,
} from '@/types';

const backendApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function normalizeBackend(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeBackend);
  if (!value || typeof value !== 'object') return value;
  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  const keys: Record<string, string> = {
    _id: 'id',
    shortDescription: 'short_description',
    displayOrder: 'display_order',
    isFeatured: 'is_featured',
    isActive: 'is_active',
    publishedAt: 'published_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    researchArea: 'research_area',
    imageUrl: 'image_url',
    seoTitle: 'seo_title',
    metaDescription: 'meta_description',
    focusKeyword: 'focus_keyword',
    secondaryKeywords: 'secondary_keywords',
    featuredImage: 'featured_image',
    canonicalUrl: 'canonical_url',
  };
  for (const [key, item] of Object.entries(source)) result[keys[key] || key] = normalizeBackend(item);
  if (!result.image_url && result.main_image && typeof result.main_image === 'object' && result.main_image !== null && 'url' in result.main_image) result.image_url = result.main_image.url;
  if (typeof result.status === 'string' && !('is_published' in result)) result.is_published = result.status === 'published';
  return result;
}

async function getBackendCollection<T>(resource: string): Promise<T[] | null> {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/public/${resource}?page=1&limit=100`);
    if (!response.ok) return null;
    const payload = await response.json() as { success?: boolean; data?: unknown };
    if (!payload.success || !Array.isArray(payload.data) || payload.data.length === 0) return null;
    return normalizeBackend(payload.data) as T[];
  } catch {
    return null;
  }
}

async function getBackendSingleton(resource: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/public/${resource}`);
    if (!response.ok) return null;
    const payload = await response.json() as { success?: boolean; data?: Record<string, unknown> };
    if (!payload.success || !payload.data) return null;
    const record = payload.data;
    return record.data && typeof record.data === 'object' && !Array.isArray(record.data)
      ? normalizeBackend(record.data) as Record<string, unknown>
      : normalizeBackend(record) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getPublicPageContent(resource: string): Promise<Record<string, unknown> | null> {
  return getBackendSingleton(resource);
}

async function getBackendDetail<T>(resource: string, slug: string): Promise<T | null> {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/public/${resource}/${encodeURIComponent(slug)}`);
    if (!response.ok) return null;
    const payload = await response.json() as { success?: boolean; data?: unknown };
    return payload.success && payload.data ? normalizeBackend(payload.data) as T : null;
  } catch {
    return null;
  }
}

export async function getHomeContent(): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/public/home`);
    if (!response.ok) return null;
    const payload = await response.json() as { success?: boolean; data?: Record<string, unknown> };
    if (!payload.success || !payload.data) return null;
    const record = payload.data;
    return record.data && typeof record.data === 'object' && !Array.isArray(record.data)
      ? record.data as Record<string, unknown>
      : record;
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const backend = await getBackendSingleton('settings');
  if (backend) {
    return {
      ...backend,
      brand_name: String(backend.brand_name || backend.website_name || 'SciScript'),
      default_seo_title: (backend.default_seo_title as string | null) || null,
      default_meta_description: (backend.default_meta_description as string | null) || null,
      is_active: backend.is_active !== false,
    } as SiteSettings;
  }
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();
  if (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
  return data as SiteSettings | null;
}

export async function getServices(): Promise<Service[]> {
  const backend = await getBackendCollection<Service>('services');
  if (backend) return backend;
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  return (data || []) as Service[];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const backend = await getBackendDetail<Service>('services', slug);
  if (backend) return backend;
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) {
    console.error('Error fetching service:', error);
    return null;
  }
  return data as Service | null;
}

export async function getResearchAreas(): Promise<ResearchArea[]> {
  const backend = await getBackendCollection<ResearchArea>('expertise');
  if (backend) return backend;
  const { data, error } = await supabase
    .from('research_areas')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('Error fetching research areas:', error);
    return [];
  }
  return (data || []) as ResearchArea[];
}

export async function getResearchAreaBySlug(slug: string): Promise<ResearchArea | null> {
  const backend = await getBackendDetail<ResearchArea>('expertise', slug);
  if (backend) return backend;
  const { data, error } = await supabase
    .from('research_areas')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) {
    console.error('Error fetching research area:', error);
    return null;
  }
  return data as ResearchArea | null;
}

export async function getProjects(): Promise<Project[]> {
  const backend = await getBackendCollection<Project>('projects');
  if (backend) return backend;
  const { data, error } = await supabase
    .from('projects')
    .select('*, research_area:research_areas(*)')
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return (data || []) as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const backend = await getBackendDetail<Project>('projects', slug);
  if (backend) return backend;
  const { data, error } = await supabase
    .from('projects')
    .select('*, research_area:research_areas(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }
  return data as Project | null;
}

export async function getPublications(): Promise<Publication[]> {
  const backend = await getBackendCollection<Publication>('publications');
  if (backend) return backend;
  const { data, error } = await supabase
    .from('publications')
    .select('*, research_area:research_areas(*)')
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('Error fetching publications:', error);
    return [];
  }
  return (data || []) as Publication[];
}

export async function getScientificVisuals(): Promise<ScientificVisual[]> {
  const backend = await getBackendCollection<ScientificVisual>('scientific-visuals');
  if (backend) return backend;
  const { data, error } = await supabase
    .from('scientific_visuals')
    .select('*, research_area:research_areas(*)')
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('Error fetching scientific visuals:', error);
    return [];
  }
  return (data || []) as ScientificVisual[];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const backend = await getBackendCollection<Testimonial>('testimonials');
  if (backend) return backend;
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
  return (data || []) as Testimonial[];
}

export async function getFaqs(): Promise<Faq[]> {
  const backend = await getBackendCollection<Faq>('faqs');
  if (backend) return backend;
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .not('answer', 'is', null)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
  return (data || []) as Faq[];
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const backend = await getBackendCollection<BlogPost>('blog-posts');
  if (backend) return backend;
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });
  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
  return (data || []) as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const backend = await getBackendDetail<BlogPost>('blog-posts', slug);
  if (backend) return backend;
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
  return data as BlogPost | null;
}

export async function submitContact(
  payload: Omit<ContactSubmission, 'id' | 'status' | 'created_at'>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/public/contact-inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        researchArea: payload.research_area,
        serviceRequired: payload.service_required,
        projectDescription: payload.message,
        preferredContactMethod: 'email',
      }),
    });
    if (response.ok) return { success: true, error: null };
  } catch {
    // Fall back to the legacy public submission path below.
  }
  const { error } = await supabase.from('contact_submissions').insert([payload]);
  if (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

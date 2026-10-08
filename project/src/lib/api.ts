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
    brandName: 'brand_name',
    siteName: 'brand_name',
    brandDescription: 'description',
    navigationGroups: 'navigation_groups',
    socialLinks: 'social_links',
    copyrightText: 'copyright_text',
    heroHeading: 'hero_heading',
    heroSubheading: 'hero_subheading',
    heroCtaPrimary: 'hero_cta_primary',
    heroCtaSecondary: 'hero_cta_secondary',
    aboutIntro: 'about_intro',
    aboutBody: 'about_body',
    aboutMission: 'about_mission',
    contactEmail: 'contact_email',
    contactPhone: 'contact_phone',
    contactLocation: 'contact_location',
    linkedinUrl: 'linkedin_url',
    websiteUrl: 'website_url',
    website: 'website_url',
    orcidUrl: 'orcid_url',
    whatsappUrl: 'whatsapp_url',
    defaultSeoTitle: 'default_seo_title',
    defaultMetaDescription: 'default_meta_description',
    defaultOgImage: 'default_og_image',
    fullName: 'full_name',
    professionalTitle: 'professional_title',
    shortBio: 'short_bio',
    longBio: 'long_bio',
    imageAlt: 'image_alt',
    profileImage: 'profile_image',
    profile_image: 'photo',
    profileImageUrl: 'photo',
    shortDescription: 'short_description',
    displayOrder: 'display_order',
    isFeatured: 'is_featured',
    isActive: 'is_active',
    publishedAt: 'published_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    researchArea: 'research_area',
    researchType: 'research_type',
    publicationType: 'publication_type',
    authorRole: 'author_role',
    journalPublisher: 'journal_publisher',
    publicationDate: 'publication_date',
    externalEvidenceUrl: 'external_evidence_url',
    publisherUrl: 'publisher_url',
    pubmedUrl: 'pubmed_url',
    googleScholarUrl: 'google_scholar_url',
    pdfUrl: 'pdf_url',
    evidenceLink: 'evidence_link',
    scientificVisuals: 'scientific_visuals',
    imageUrl: 'image_url',
    seoTitle: 'seo_title',
    metaDescription: 'meta_description',
    focusKeyword: 'focus_keyword',
    secondaryKeywords: 'secondary_keywords',
    featuredImage: 'featured_image',
    coverImage: 'cover_image',
    canonicalUrl: 'canonical_url',
    published: 'is_published',
    category: 'category',
    contactPage: 'contact_page',
    social: 'social',
    location: 'location',
    type: 'nav_type',
  };
  for (const [key, item] of Object.entries(source)) {
    const normalizedKey = keys[key] || key;
    const normalizedItem = normalizeBackend(item);
    result[normalizedKey] = ['imageUrl', 'featuredImage', 'profileImage', 'thumbnailUrl'].includes(key)
      && typeof normalizedItem === 'string' && normalizedItem.startsWith('/')
      ? `${backendApiUrl}${normalizedItem}`
      : normalizedItem;
  }
  for (const key of ['featured_image', 'profile_image', 'image_url', 'thumbnail_url', 'cover_image']) {
    const image = result[key];
    if (image && typeof image === 'object' && !Array.isArray(image)) {
      const imageRecord = image as Record<string, unknown>;
      if (typeof imageRecord.url === 'string' && imageRecord.url.startsWith('/')) {
        imageRecord.url = `${backendApiUrl}${imageRecord.url}`;
      }
    }
  }
  for (const key of ['image_url', 'profile_image', 'featured_image', 'cover_image']) {
    if (typeof result[key] === 'string' && (result[key] as string).startsWith('/')) {
      result[key] = `${backendApiUrl}${result[key]}`;
    }
  }
  if (!result.image_url && result.main_image && typeof result.main_image === 'object' && result.main_image !== null && 'url' in result.main_image) result.image_url = result.main_image.url;
  if (typeof result.status === 'string' && !('is_published' in result)) result.is_published = result.status === 'published';
  if (typeof result.status === 'string' && !('published' in result)) result.published = result.status === 'published';
  if (!result.name && typeof result.title === 'string') result.name = result.title;
  if (!result.photo && result.profile_image) result.photo = result.profile_image;
  if (!result.photo && result.profileImage) result.photo = result.profileImage;
  if ('is_active' in result && !('enabled' in result)) result.enabled = result.is_active;
  if ('isActive' in result && !('enabled' in result)) result.enabled = result.isActive;
  return result;
}

async function getBackendCollection<T>(resource: string): Promise<T[] | null> {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/public/${resource}?page=1&limit=100`);
    if (!response.ok) return null;
    const payload = await response.json() as { success?: boolean; data?: unknown };
    if (!payload.success || !Array.isArray(payload.data)) return null;
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
    const nestedData = record.data && typeof record.data === 'object' && !Array.isArray(record.data)
      ? record.data
      : {};
    return normalizeBackend({ ...record, ...nestedData }) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getPublicPageContent(resource: string): Promise<Record<string, unknown> | null> {
  return getBackendSingleton(resource);
}

export interface PublicNavigationItem {
  id: string;
  label: string;
  url: string;
  nav_type?: string;
  parent_id?: string | null;
  enabled?: boolean;
  display_order?: number;
}

export interface PublicFooterContent {
  brand_name?: string;
  description?: string;
  copyright_text?: string;
  navigation_groups?: Array<{ title?: string; links?: Array<{ label?: string; url?: string }> }>;
  social_links?: Record<string, string>;
  contact?: Record<string, string>;
  legal?: Record<string, string>;
}

export async function getPublicNavigation(): Promise<PublicNavigationItem[]> {
  const items = await getBackendCollection<PublicNavigationItem>('navigation');
  return (items || []).filter((item) => item.enabled !== false).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

export async function getPublicFooter(): Promise<PublicFooterContent | null> {
  return getBackendSingleton('footer') as Promise<PublicFooterContent | null>;
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
    return normalizeBackend(
      record.data && typeof record.data === 'object' && !Array.isArray(record.data)
        ? record.data
        : record,
    ) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
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
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

export async function getServices(): Promise<Service[]> {
  try {
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
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
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
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

export async function getResearchAreas(): Promise<ResearchArea[]> {
  try {
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
  } catch (error) {
    console.error('Error fetching research areas:', error);
    return [];
  }
}

export async function getResearchAreaBySlug(slug: string): Promise<ResearchArea | null> {
  try {
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
  } catch (error) {
    console.error('Error fetching research area:', error);
    return null;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
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
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
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
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function getPublications(): Promise<Publication[]> {
  try {
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
  } catch (error) {
    console.error('Error fetching publications:', error);
    return [];
  }
}

export async function getScientificVisuals(): Promise<ScientificVisual[]> {
  try {
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
  } catch (error) {
    console.error('Error fetching scientific visuals:', error);
    return [];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const backend = await getBackendCollection<Testimonial>('testimonials');
    if (backend) return backend.map((item) => ({
      ...item,
      name: item.name || 'Anonymous',
      testimonial: item.testimonial || '',
      photo: item.photo || (item as Testimonial & { profile_image?: string }).profile_image || null,
    }));
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
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export async function getFaqs(): Promise<Faq[]> {
  try {
    const backend = await getBackendCollection<Faq>('faqs');
    if (backend) return backend
      .filter((item) => item.is_published !== false)
      .map((item) => ({
        ...item,
        question: item.question || 'Frequently asked question',
        answer: item.answer || '',
        display_order: item.display_order ?? 0,
      }));
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
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
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
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
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
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
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
    const responsePayload = await response.json().catch(() => null) as { message?: string; error?: string } | null;
    return { success: false, error: responsePayload?.message || responsePayload?.error || 'Unable to submit contact form.' };
  } catch {
    return { success: false, error: 'Unable to submit contact form at the moment.' };
  }
}

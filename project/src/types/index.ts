export interface SiteSettings {
  id: string;
  brand_name: string;
  tagline: string | null;
  hero_heading: string | null;
  hero_subheading: string | null;
  hero_cta_primary: string | null;
  hero_cta_secondary: string | null;
  about_intro: string | null;
  about_body: string | null;
  about_mission: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_location: string | null;
  linkedin_url: string | null;
  orcid_url: string | null;
  google_scholar_url: string | null;
  whatsapp_url: string | null;
  default_seo_title: string | null;
  default_meta_description: string | null;
  default_og_image: string | null;
  is_active: boolean;
  primary_color?: string | null;
  accent_color?: string | null;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  icon: string | null;
  featured_image?: { url: string; alt?: string } | string | null;
  gallery?: Array<{ url: string; alt?: string } | string>;
  short_description: string | null;
  description: string | null;
  deliverables: string[];
  benefits?: string[];
  process?: string[];
  cta?: { text?: string; url?: string };
  cta_text?: string | null;
  cta_url?: string | null;
  display_order: number;
  featured?: boolean;
  linkedin_url?: string | null;
  website_url?: string | null;
  is_featured: boolean;
  is_published: boolean;
  seo_title: string | null;
  meta_description: string | null;
}

export interface ResearchArea {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  cover_image?: string | { url: string; alt?: string | null } | null;
  short_description: string | null;
  description: string | null;
  display_order: number;
  is_published: boolean;
  seo_title: string | null;
  meta_description: string | null;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  research_area_id: string | null;
  short_description: string | null;
  objective: string | null;
  scientific_context: string | null;
  approach: string | null;
  contribution: string | null;
  credit_roles: string[];
  deliverables: string[];
  quality_checks: string[];
  publication_status: string | null;
  target_journal: string | null;
  doi: string | null;
  publication_link: string | null;
  year: number | null;
  images: string[];
  featured_image?: string | { url: string; alt?: string | null } | null;
  is_published: boolean;
  display_order: number;
  seo_title: string | null;
  meta_description: string | null;
  research_area?: ResearchArea | null;
}

export interface Publication {
  id: string;
  slug: string;
  title: string;
  authors: string | null;
  publication_type: string | null;
  journal: string | null;
  year: number | null;
  doi: string | null;
  url: string | null;
  research_area_id: string | null;
  contribution: string | null;
  status: string | null;
  is_published: boolean;
  display_order: number;
  seo_title: string | null;
  meta_description: string | null;
  research_area?: ResearchArea | null;
}

export interface ScientificVisual {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  purpose: string | null;
  research_area_id: string | null;
  software_used: string | null;
  scientific_source: string | null;
  contribution: string | null;
  publication_status: string | null;
  image_url: string | null;
  is_published: boolean;
  display_order: number;
  research_area?: ResearchArea | null;
}

export interface Testimonial {
  id: string;
  name: string;
  designation: string | null;
  organization: string | null;
  testimonial: string;
  photo: string | null;
  permission_status: string | null;
  is_published: boolean;
  display_order: number;
  featured?: boolean;
  linkedin_url?: string | null;
  website_url?: string | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string | null;
  display_order: number;
  is_published: boolean;
  category?: string | null;
  featured?: boolean;
  related_service?: string | null;
  related_expertise?: string | null;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[];
  excerpt: string | null;
  featured_image: string | null;
  author: string | null;
  category: string | null;
  content: string | null;
  canonical_url: string | null;
  is_published: boolean;
  published_at: string | null;
  updated_at: string | null;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  research_area: string | null;
  service_required: string | null;
  message: string;
  file_url: string | null;
  status: string | null;
  created_at: string;
}

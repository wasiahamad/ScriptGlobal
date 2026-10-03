export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Service {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  icon: string;
  featured_image: ImageRef | null;
  gallery: ImageRef[];
  benefits: string[];
  process: string[];
  deliverables: string[];
  cta_text: string;
  cta_url: string;
  display_order: number;
  featured: boolean;
  status: ContentStatus;
  publish_at: string | null;
  unpublish_at: string | null;
  seo: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Expertise {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  detailed_description: string;
  icon: string;
  cover_image: ImageRef | null;
  gallery: ImageRef[];
  related_services: string[];
  related_projects: string[];
  display_order: number;
  featured: boolean;
  status: ContentStatus;
  seo: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Research {
  id: string;
  title: string;
  slug: string;
  research_type: string;
  research_area: string;
  description: string;
  long_description: string;
  featured_image: ImageRef | null;
  gallery: ImageRef[];
  scientific_visuals: string[];
  contribution: string;
  methods: string[];
  ref_list: string[];
  doi: string;
  pubmed_url: string;
  publisher_url: string;
  external_evidence_url: string;
  publication_date: string | null;
  author_role: string;
  status: ContentStatus;
  featured: boolean;
  display_order: number;
  seo: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Publication {
  id: string;
  title: string;
  publication_type: string;
  authors: string;
  author_role: string;
  journal_publisher: string;
  year: number | null;
  abstract: string;
  description: string;
  doi: string;
  pubmed_url: string;
  publisher_url: string;
  google_scholar_url: string;
  pdf_url: string;
  cover_image: ImageRef | null;
  evidence_link: string;
  contribution: string;
  featured: boolean;
  status: ContentStatus;
  display_order: number;
  seo: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  project_type: string;
  research_area: string;
  short_summary: string;
  full_overview: string;
  scientific_context: string;
  challenge: string;
  contribution: string;
  workflow: string[];
  deliverables: string[];
  outcome: string;
  featured_image: ImageRef | null;
  gallery: ImageRef[];
  scientific_visuals: string[];
  ref_list: string[];
  external_links: { label: string; url: string }[];
  related_services: string[];
  related_expertise: string[];
  featured: boolean;
  status: ContentStatus;
  display_order: number;
  seo: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ScientificVisual {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  detailed_description: string;
  main_image: ImageRef | null;
  thumbnail: ImageRef | null;
  gallery: ImageRef[];
  related_project: string;
  related_publication: string;
  related_expertise: string;
  alt_text: string;
  caption: string;
  display_order: number;
  featured: boolean;
  status: ContentStatus;
  seo: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  designation: string;
  organization: string;
  profile_image: ImageRef | null;
  testimonial: string;
  linkedin_url: string;
  website: string;
  display_order: number;
  featured: boolean;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface ImageRef {
  url: string;
  alt: string;
  public_id?: string;
}

export interface PageSettings {
  id: string;
  page_key: string;
  title: string;
  content: Record<string, unknown>;
  seo: Record<string, unknown>;
  updated_at: string;
  created_at: string;
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  nav_type: string;
  parent_id: string | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface FooterSettings {
  id: string;
  brand_name: string;
  description: string;
  logo: ImageRef | null;
  nav_links: { label: string; url: string }[];
  service_links: { label: string; url: string }[];
  social_links: Record<string, string>;
  contact: Record<string, string>;
  legal: Record<string, string>;
  copyright_text: string;
  updated_at: string;
}

export interface ContactSettings {
  id: string;
  professional_name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  google_maps_url: string;
  linkedin_url: string;
  orcid_url: string;
  google_scholar_url: string;
  website: string;
  updated_at: string;
}

export interface GlobalSettings {
  id: string;
  website_name: string;
  tagline: string;
  logo: ImageRef | null;
  dark_logo: ImageRef | null;
  favicon: ImageRef | null;
  default_language: string;
  timezone: string;
  primary_color: string;
  accent_color: string;
  social: Record<string, string>;
  contact: Record<string, string>;
  analytics: Record<string, string>;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  public_id: string;
  secure_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  alt_text: string;
  caption: string;
  filename: string;
  category: string;
  created_at: string;
}

export interface SEOSettings {
  id: string;
  page_key: string;
  seo_title: string;
  meta_description: string;
  keywords: string[];
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: ImageRef | null;
  twitter_title: string;
  twitter_description: string;
  twitter_image: ImageRef | null;
  robots: string;
  schema_jsonld: Record<string, unknown> | null;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  admin_name: string;
  action: string;
  content_type: string;
  content_id: string;
  details: string;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  name: string;
  role: string;
  status: string;
  last_login: string | null;
  created_at: string;
}

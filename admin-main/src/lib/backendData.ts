/* eslint-disable @typescript-eslint/no-explicit-any */
const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const resourceByTable: Record<string, string> = {
  services: 'services',
  expertise: 'expertise',
  research: 'research',
  publications: 'publications',
  projects: 'projects',
  scientific_visuals: 'scientific-visuals',
  faqs: 'faqs',
  testimonials: 'testimonials',
  navigation: 'navigation',
  seo_settings: 'seo',
  contact_settings: 'contact',
  footer_settings: 'footer',
  global_settings: 'settings',
  activity_logs: 'activity-logs',
  admin_profiles: 'admin-users',
  media: 'media',
  page_settings: 'home',
};

function frontendKey(key: string) {
  const keys: Record<string, string> = {
    _id: 'id',
    shortDescription: 'short_description',
    detailedDescription: 'detailed_description',
    displayOrder: 'display_order',
    isFeatured: 'is_featured',
    isActive: 'is_active',
    isDeleted: 'is_deleted',
    publishedAt: 'published_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    researchArea: 'research_area',
    relatedServices: 'related_services',
    relatedProjects: 'related_projects',
    relatedPublications: 'related_publications',
    imageUrl: 'image_url',
    secureUrl: 'secure_url',
    thumbnailUrl: 'thumbnail_url',
    publicId: 'public_id',
    altText: 'alt_text',
    contentType: 'content_type',
  };
  return keys[key] || key;
}

function normalize(value: any): any {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== 'object') return value;
  const result: Record<string, any> = {};
  for (const [key, item] of Object.entries(value)) result[frontendKey(key)] = normalize(item);
  if (typeof result.status === 'string' && !('is_published' in result)) result.is_published = result.status === 'published';
  if ('title' in result && !('name' in result)) result.name = result.title;
  if ('description' in result && !('full_description' in result)) result.full_description = result.description;
  if ('is_featured' in result && !('featured' in result)) result.featured = result.is_featured;
  return result;
}

function backendPayload(table: string, payload: any) {
  const result = { ...((payload?.content && table === 'page_settings' ? payload.content : payload) || {}) };
  if (table === 'services') {
    if (result.name && !result.title) result.title = result.name;
    if (result.full_description && !result.description) result.description = result.full_description;
    if ('featured' in result && !('isFeatured' in result)) result.isFeatured = result.featured;
  }
  if ('short_description' in result && !('shortDescription' in result)) result.shortDescription = result.short_description;
  if ('display_order' in result && !('displayOrder' in result)) result.displayOrder = result.display_order;
  if ('is_published' in result && !('status' in result)) result.status = result.is_published ? 'published' : 'draft';
  return result;
}

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) throw new Error(payload.message || `Request failed with status ${response.status}`);
  return payload;
}

class ApiQuery implements PromiseLike<{ data: any; error: any; count?: number }> {
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: any;
  private filters: Array<[string, any]> = [];
  private sort: [string, boolean] | null = null;
  private maxRows: number | null = null;
  private singleRow = false;
  private headOnly = false;
  private selected = false;

  constructor(private readonly table: string) {}

  select(_columns = '*', options: { count?: string; head?: boolean } = {}) {
    this.selected = true;
    this.headOnly = Boolean(options.head);
    return this;
  }

  insert(payload: any) { this.operation = 'insert'; this.payload = payload; return this; }
  update(payload: any) { this.operation = 'update'; this.payload = payload; return this; }
  delete() { this.operation = 'delete'; return this; }
  upsert(payload: any) { return this.insert(payload); }
  eq(column: string, value: any) { this.filters.push([column, value]); return this; }
  ilike(column: string, value: string) { this.filters.push([column, value]); return this; }
  order(column: string, options: { ascending?: boolean } = {}) { this.sort = [column, options.ascending !== false]; return this; }
  limit(value: number) { this.maxRows = value; return this; }
  maybeSingle() { this.singleRow = true; return this; }
  single() { this.singleRow = true; return this; }

  then<TResult1 = { data: any; error: any; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  private endpoint() {
    const resource = resourceByTable[this.table] || this.table;
    const pageKey = this.filters.find(([key]) => key === 'page_key')?.[1];
    const pageResource: Record<string, string> = {
      about: 'profile',
      founder: 'profile',
      thesis: 'thesis',
      editing: 'editing',
      'publication-support': 'publication-support',
      'peer-review': 'peer-review',
      'research-integrity': 'research-integrity',
    };
    const singleton = ['contact_settings', 'footer_settings', 'global_settings', 'page_settings'].includes(this.table) || Boolean(pageKey);
    return { resource: pageResource[String(pageKey)] || pageKey || resource, singleton };
  }

  private async execute() {
    try {
      const { resource, singleton } = this.endpoint();
      let path = `/api/v1/admin/${resource}`;
      let method = 'GET';
      let body: string | undefined;
      const id = this.filters.find(([key]) => key === 'id')?.[1];

      if (this.operation === 'insert') { method = singleton ? 'PUT' : 'POST'; body = JSON.stringify(backendPayload(this.table, this.payload)); }
      if (this.operation === 'update') { method = 'PUT'; path += singleton ? '' : `/${id}`; body = JSON.stringify(backendPayload(this.table, this.payload)); }
      if (this.operation === 'delete') { method = 'DELETE'; path += `/${id}`; }

      if (this.operation === 'select' && !singleton) {
        const query = new URLSearchParams();
        for (const [key, value] of this.filters) {
          if (key !== 'id' && key !== 'page_key') query.set(key === 'is_published' ? 'status' : key, String(value));
        }
        if (this.sort) { query.set('sort', this.sort[0]); query.set('order', this.sort[1] ? 'asc' : 'desc'); }
        if (this.maxRows !== null) query.set('limit', String(this.maxRows));
        if (query.toString()) path += `?${query.toString()}`;
      }

      const payload = await request(path, { method, body });
      const value = normalize(payload.data);
      if (this.headOnly) return { data: null, error: null, count: payload.pagination?.total ?? (Array.isArray(value) ? value.length : value ? 1 : 0) };
      const data = this.singleRow ? (Array.isArray(value) ? value[0] || null : value) : value;
      return { data, error: null, count: payload.pagination?.total };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : 'Request failed' } };
    }
  }
}

export function createBackendDataClient() {
  return {
    from: (table: string) => new ApiQuery(table),
    auth: {
      updateUser: async () => ({ data: null, error: { message: 'Use the API account settings endpoint to change passwords.' } }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Use the API media upload endpoint for files.' } }),
        remove: async () => ({ data: [], error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: path }, error: null }),
      }),
    },
  };
}

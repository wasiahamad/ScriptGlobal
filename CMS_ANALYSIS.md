# SciScript CMS Analysis

> Analysis-first report for the existing SciScript Global Scientific Writing Services public website. The public frontend is the source of truth for the CMS structure.
>
> This document records the current implementation before any frontend/API migration. No application code is changed by this report.

## 1. Applications and Current Runtime

The workspace contains three separate applications:

- `project`: public portfolio website.
- `admin-main`: admin CMS interface.
- `api`: Express/MongoDB backend.

The current live data flow is not unified:

```text
Public website -> Supabase tables
Admin CMS -> Supabase Auth, Supabase tables, Supabase Storage
Express API -> MongoDB, JWT cookies, Cloudinary/local uploads
```

The public and admin frontends do not currently call `/api/v1`. The Express API is a parallel backend implementation and is not yet the source of truth for either frontend.

## 2. Public Frontend Architecture

Primary files:

- `project/src/main.tsx`: React entrypoint.
- `project/src/App.tsx`: router, lazy page loading, `HelmetProvider`, and `SiteDataProvider`.
- `project/src/components/layout/Layout.tsx`: shared public layout.
- `project/src/components/layout/Navbar.tsx`: hardcoded public navigation.
- `project/src/components/layout/Footer.tsx`: shared footer.
- `project/src/components/SEO.tsx`: document metadata and structured SEO behavior.
- `project/src/context/SiteDataContext.tsx`: loads global `site_settings`.
- `project/src/lib/api.ts`: direct Supabase data access.
- `project/src/types/index.ts`: public data contracts.

The public app uses React, TypeScript, Vite, React Router, Supabase, Framer Motion, and `react-helmet-async`.

## 3. Public Route and Content Map

### Home - `/`

Component: `project/src/pages/Home.tsx`

Section order:

1. Hero
2. Trust bar
3. Expertise strip
4. About preview
5. Services preview
6. Research areas preview
7. Testimonials preview
8. FAQ preview
9. CTA

Data and fields:

- Hero CTA labels/links: `site_settings.hero_cta_primary`, `hero_cta_secondary`.
- About preview: `site_settings.about_intro`, `about_body`, `about_mission`.
- Services preview: published `services` records.
- Research areas preview: published `research_areas` records.
- Testimonials: first three published `testimonials` records.
- FAQs: first five published `faqs` records.

Currently hardcoded or presentation-owned:

- Main hero heading/body.
- Trust signals.
- Expertise items.
- Section headings and several CTA labels.
- Organization/schema fallback content.

CMS mapping:

- `HomePage` singleton for hero and page-specific sections.
- `Service` collection reference.
- `ResearchArea` collection reference.
- `Testimonial` collection reference.
- `FAQ` collection reference.
- `SEO` singleton/page record.

### About - `/about`

Component: `project/src/pages/About.tsx`

Section order:

1. Hero/about introduction
2. Approach
3. Mission
4. Principles
5. Capabilities
6. Work types
7. CTA

Dynamic fields:

- `site_settings.about_intro`
- `site_settings.about_body`
- `site_settings.about_mission`

Currently hardcoded:

- Principles.
- Capabilities.
- Work types.
- Several headings and CTA text.

CMS mapping:

- `Profile` or `AboutPage` singleton for editable biography/approach/mission.
- Repeaters for principles, capabilities, and work types because these are visible repeated content.
- No invented profile fields should be added beyond information present in the current website.

### Services - `/services`

Component: `project/src/pages/Services.tsx`

Section order:

1. Services hero
2. Services grid
3. CTA

Supabase table: `services`

Observed fields:

- `id`
- `slug`
- `title`
- `tagline`
- `icon`
- `short_description`
- `description`
- `deliverables`
- `display_order`
- `is_featured`
- `is_published`
- `seo_title`
- `meta_description`

CMS model: `Service` collection.

Admin operations:

- Create, read, update, delete.
- Publish/unpublish.
- Feature/unfeature.
- Reorder.
- SEO editing.
- Deliverables repeater.

### Service detail - `/services/:slug`

Component: `project/src/pages/ServiceDetail.tsx`

Section order:

1. Service hero
2. Overview
3. Deliverables
4. Sidebar CTA
5. Related services
6. CTA

Fields used:

- `title`
- `tagline`
- `short_description`
- `icon`
- `description`
- `deliverables`
- `slug`

The sidebar CTA and general CTA currently contain hardcoded fallback copy. Related-service behavior should be represented through service references only if the current component actually uses them.

### Research areas - `/research-areas`

Component: `project/src/pages/ResearchAreas.tsx`

Section order:

1. Research areas hero
2. Research-area grid
3. CTA

Supabase table: `research_areas`

Fields:

- `id`
- `slug`
- `name`
- `icon`
- `short_description`
- `description`
- `display_order`
- `is_published`
- `seo_title`
- `meta_description`

CMS model: `Expertise` or `ResearchArea`, with the final name chosen to match the public terminology. The current backend uses `Expertise`; the public website uses `research_areas`, so this naming must be reconciled deliberately rather than silently changed.

### Research area detail - `/research-areas/:slug`

Component: `project/src/pages/ResearchAreaDetail.tsx`

Section order:

1. Research area hero
2. Description
3. Related projects
4. Publications
5. CTA

Fields used:

- `name`
- `icon`
- `short_description`
- `description`
- Related `projects`.
- Related `publications`.

Relationships:

- Research area to projects.
- Research area to publications.

### Portfolio - `/portfolio`

Component: `project/src/pages/Portfolio.tsx`

Section order:

1. Portfolio hero
2. Search/filter controls
3. Project grid
4. CTA

Supabase table: `projects`

Fields:

- `id`
- `slug`
- `title`
- `category`
- `research_area_id`
- `short_description`
- `year`
- `images`
- `is_published`
- `display_order`
- `seo_title`
- `meta_description`

Known category labels in the current UI:

- Research Articles
- Review Articles
- Books & Chapters
- Thesis & Dissertation
- Scientific Editing
- Scientific Figures
- Publication Support

CMS model: `Project` collection.

### Project detail - `/portfolio/:slug`

Component: `project/src/pages/ProjectDetail.tsx`

Section order:

1. Project hero
2. Objective
3. Scientific context
4. Approach
5. Contribution
6. CRediT roles
7. Deliverables
8. Quality checks
9. Scientific figures
10. Publication details
11. Related projects
12. CTA

Fields used:

- `category`
- `research_area_id`
- `year`
- `title`
- `short_description`
- `objective`
- `scientific_context`
- `approach`
- `contribution`
- `credit_roles`
- `deliverables`
- `quality_checks`
- `publication_status`
- `target_journal`
- `doi`
- `publication_link`
- `images`
- `slug`

CMS requirements:

- Project information form.
- Repeater fields for deliverables, quality checks, CRediT roles, and images where the current data is repeated.
- Research area reference.
- Publication detail fields.
- SEO fields.
- Published status and ordering.

### Scientific visuals - `/scientific-visuals`

Component: `project/src/pages/ScientificVisuals.tsx`

Section order:

1. Scientific visuals hero
2. Category filters
3. Gallery
4. Lightbox details
5. CTA

Supabase table: `scientific_visuals`

Fields:

- `id`
- `slug`
- `title`
- `category`
- `purpose`
- `research_area_id`
- `software_used`
- `scientific_source`
- `contribution`
- `publication_status`
- `image_url`
- `is_published`
- `display_order`

Known category labels:

- Molecular Mechanism Diagrams
- Nanoparticle Schematics
- Drug Delivery Illustrations
- Graphical Abstracts
- Disease Pathway Figures
- Study Design Flowcharts
- PRISMA Flow Diagrams
- Scientific Tables
- Chemistry Schemes

CMS model: `ScientificVisual` collection with reusable media reference, alt text, caption, category, ordering, and publishing state.

### Publication support - `/publication-support`

Component: `project/src/pages/PublicationSupport.tsx`

Section order:

1. Publication support hero
2. Support process
3. Publications list
4. CTA

Dynamic data:

- Published `publications` records.

Currently hardcoded:

- Support process steps.
- Several page headings and CTA copy.

CMS mapping:

- `PublicationSupport` singleton for process steps if these are intended to be editable.
- `Publication` collection for the publication list.
- Process steps should be a sortable repeater, not multiple unrelated fields.

### Testimonials - `/testimonials`

Component: `project/src/pages/Testimonials.tsx`

Section order:

1. Testimonials hero
2. Testimonials list
3. CTA

Supabase table: `testimonials`

Fields:

- `id`
- `name`
- `designation`
- `organization`
- `testimonial`
- `photo`
- `permission_status`
- `is_published`
- `display_order`

CMS model: `Testimonial` collection.

Admin operations:

- Create, edit, delete.
- Publish/unpublish.
- Reorder.
- Manage profile image and permission state.

### Insights - `/insights`

Component: `project/src/pages/Insights.tsx`

Section order:

1. Insights hero
2. Search
3. Blog cards
4. CTA

Supabase table: `blog_posts`

Fields:

- `id`
- `slug`
- `title`
- `seo_title`
- `meta_description`
- `focus_keyword`
- `secondary_keywords`
- `excerpt`
- `featured_image`
- `author`
- `category`
- `content`
- `canonical_url`
- `is_published`
- `published_at`
- `updated_at`
- `created_at`

CMS gap: the current admin has no Insights/blog management page, and the API has no blog-post model or route. A `BlogPost` model and admin page are required if this page must be fully CMS-managed.

### Insight detail - `/insights/:slug`

Component: `project/src/pages/InsightDetail.tsx`

Section order:

1. Article header
2. Featured image
3. Article content
4. Author
5. Related insights
6. CTA

Fields used:

- `category`
- `published_at`
- `title`
- `excerpt`
- `featured_image`
- `content`
- `author`
- `slug`

### Contact - `/contact`

Component: `project/src/pages/Contact.tsx`

Section order:

1. Contact hero
2. Contact details
3. Contact form
4. Success state

Contact details are read from `site_settings`:

- `contact_email`
- `contact_phone`
- `contact_location`

Contact submission fields:

- `name`
- `email`
- `phone`
- `research_area`
- `service_required`
- `message`
- `file_url`

The public Supabase form currently writes to `contact_submissions`.

### FAQs - `/faqs`

Component: `project/src/pages/Faqs.tsx`

Section order:

1. FAQ hero
2. FAQ accordion
3. CTA

Supabase table: `faqs`

Fields:

- `id`
- `question`
- `answer`
- `display_order`
- `is_published`

CMS model: `FAQ` collection.

Admin operations:

- Create, update, delete.
- Publish/unpublish.
- Reorder.
- Accordion-compatible answer content.

### Not found - `*`

Component: `project/src/pages/NotFound.tsx`

The 404 message and home link are presentation-owned and can remain static unless a future global error-page editor is justified.

## 4. Navigation

Component: `project/src/components/layout/Navbar.tsx`

Current navigation is hardcoded. Current visible links include:

- Home
- About
- Services
- Research
- Expertise
- Work
- FAQ
- Contact
- A primary CTA

The mobile menu, desktop menu, order, labels, and URLs are presentation-owned today.

Required future model: `NavigationItem` collection or a `Navigation` singleton containing sortable items.

Editable fields should reflect the actual navbar:

- Label
- URL
- Parent item/dropdown relationship if introduced by the existing design
- External/internal link type if used
- Enabled state
- Display order
- CTA designation if the current navbar distinguishes it

Do not add dropdown functionality unless the public design and route structure require it.

## 5. Footer

Component: `project/src/components/layout/Footer.tsx`

The footer contains brand/site information, navigation/service links, social/professional links, contact information, and legal/copyright presentation as implemented in the component.

Required model: `Footer` singleton.

The final field list must be taken from the component rather than invented. Every visible footer value should have one corresponding field or reference, including:

- Brand/name
- Description
- Navigation links
- Service links
- Social links
- Contact details
- Legal links
- Copyright text

## 6. SEO

SEO implementation is centered in:

- `project/src/components/SEO.tsx`
- `project/src/pages/*`
- `site_settings` default SEO fields

Observed global SEO fields:

- `default_seo_title`
- `default_meta_description`
- `default_og_image`

Observed content SEO fields:

- `seo_title`
- `meta_description`

Blog SEO fields additionally include:

- `focus_keyword`
- `secondary_keywords`
- `canonical_url`

Migration requirements:

- Preserve the existing `SEO` component behavior.
- Add page-specific SEO records or embedded SEO fields only where the page is dynamic.
- Do not claim fields such as Twitter cards, robots, canonical, or schema are currently implemented unless the source component contains them.
- Add those controls only as an explicit enhancement and document the enhancement.

## 7. Media Inventory

Current public media fields include:

- Project `images`
- Scientific visual `image_url`
- Testimonial `photo`
- Blog `featured_image`
- Global `default_og_image`

Current admin/public Supabase media is separate from the backend Multer/Sharp/Cloudinary media pipeline.

Required reusable media behavior:

- Upload
- Preview
- Replace
- Delete
- Alt text
- Caption
- Reuse existing media
- Attach media to content records

The backend should store Cloudinary metadata and URLs, not binary image data in MongoDB.

## 8. Current Supabase Data Contracts

Defined in `project/src/lib/api.ts` and `project/src/types/index.ts`.

Tables currently used:

- `site_settings`
- `services`
- `research_areas`
- `projects`
- `publications`
- `scientific_visuals`
- `testimonials`
- `faqs`
- `blog_posts`
- `contact_submissions`

All public list/detail queries generally filter `is_published = true`; list queries use `display_order`, while blog posts use `published_at DESC`.

## 9. Backend Alignment Map

Existing API models already cover many real public sections:

- `Service`
- `Expertise`
- `Research`
- `Publication`
- `Project`
- `ScientificVisual`
- `FAQ`
- `Testimonial`
- `HomePage`
- `Profile`
- `ThesisPage`
- `EditingPage`
- `PublicationSupport`
- `PeerReview`
- `ResearchIntegrity`
- `Navigation`
- `Footer`
- `ContactSettings`
- `GlobalSettings`
- `SEO`

Missing or incomplete alignment:

- Public `ResearchArea` terminology versus API `Expertise` terminology.
- Public `BlogPost` has no matching API model/routes/admin screen.
- Frontend snake_case contracts differ from backend camelCase-oriented contracts.
- Frontend uses Supabase identity; API uses MongoDB `AdminUser` identity.
- Frontend uses Supabase Storage; API uses Cloudinary/local uploads.
- Public contact payload differs from API inquiry validator names and fields.

## 10. Singleton vs Collection

### Singleton candidates

- Home
- About/Profile
- Publication Support process
- Thesis/Dissertation page
- Editing page
- Peer Review page
- Research Integrity page
- Footer
- Contact settings
- Global settings
- Global SEO
- Navigation configuration

Expected operations:

```text
GET /api/v1/public/{resource}
GET /api/v1/admin/{resource}
PUT /api/v1/admin/{resource}
```

### Collection candidates

- Services
- Research areas/expertise
- Projects
- Publications
- Scientific visuals
- FAQs
- Testimonials
- Blog posts/Insights
- Contact inquiries
- Media
- Activity logs
- Admin users

Expected operations depend on the resource:

```text
GET
POST
GET/:id or GET/:slug
PUT/:id
DELETE/:id
PATCH status
PATCH reorder
```

## 11. Hardcoded Content Migration List

The following visible content is currently hardcoded in React and must be intentionally classified:

- Home trust signals.
- Home expertise strip.
- Home hero heading/body and CTA defaults.
- About principles.
- About capabilities.
- About work types.
- Publication support steps.
- Portfolio category filters.
- Scientific visual category filters.
- Many page hero headings and section headings.
- CTA labels and fallback copy.
- Navbar links.
- Footer values.
- 404 copy.

Migration rule:

```text
Current React content
    -> explicit model field or documented static decision
    -> admin field when editable
    -> public API response
    -> existing React component rendering
```

Do not migrate presentation-only labels automatically. Each static decision should be documented here or in the relevant implementation plan.

## 12. Required Target Architecture

After migration, the intended flow is:

```text
Public React frontend
        |
        | GET published content
        v
Express API
        |
        v
MongoDB / Cloudinary
        ^
        |
        | authenticated CRUD, publish, reorder, media
Admin CMS
```

Required constraints:

- Public API returns only published, active, non-deleted content.
- Admin API requires JWT authentication and role authorization.
- Admin forms map directly to backend models.
- Every public editable field has an admin representation.
- Existing routes, visual design, animations, section order, and terminology are preserved.
- No generic `ContentBlock` replacement should be introduced where a real website model exists.

## 13. Implementation Sequence

1. Complete and review this public content map.
2. Reconcile exact fields against every public component and type.
3. Decide naming for `ResearchArea` versus `Expertise`.
4. Add the missing `BlogPost`/Insights model and admin coverage if Insights remains dynamic.
5. Align MongoDB schemas and API response contracts with the public data model.
6. Align admin forms and route names with those models.
7. Add migration/seed data from existing public content.
8. Integrate public frontend reads with `/api/v1/public`.
9. Integrate admin frontend auth/CRUD with `/api/v1/auth` and `/api/v1/admin`.
10. Replace migrated hardcoded CMS content with API-backed values.
11. Preserve presentation-only constants and document them.
12. Test public routes, admin CRUD, publishing, media, SEO, auth, and responsive behavior.

## 14. Current Conclusion

The existing public website is the source of truth. It has a clear scientific-writing-service information architecture, but the current Supabase public/admin implementation and MongoDB/Express API are parallel systems.

The next implementation phase must be an integration/migration, not a new generic CMS design. The existing admin and API can be reused where their models match the public content, but their contracts, authentication, media, blog/Insights coverage, and data source must be unified before the system can satisfy the master prompt end to end.

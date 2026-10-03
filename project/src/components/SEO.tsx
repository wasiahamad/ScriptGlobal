import { Helmet } from 'react-helmet-async';
import type { SiteSettings } from '@/types';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: string;
  jsonLd?: object | object[];
  siteSettings?: SiteSettings | null;
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://sciscript.global';

export default function SEO({
  title,
  description,
  canonicalPath,
  image,
  type = 'website',
  jsonLd,
  siteSettings,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | ${siteSettings?.brand_name || 'SciScript Global Scientific Writing Services'}`
    : siteSettings?.default_seo_title || 'SciScript Global Scientific Writing Services';

  const metaDescription = description || siteSettings?.default_meta_description || '';
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL;
  const ogImage = image || siteSettings?.default_og_image || '';

  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {jsonLdArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

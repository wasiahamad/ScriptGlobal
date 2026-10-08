import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getPublicFooter } from '@/lib/api';

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const [footer, setFooter] = useState<Awaited<ReturnType<typeof getPublicFooter>>>(null);
  useEffect(() => { getPublicFooter().then(setFooter); }, []);

  const isPrivacy = kind === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';
  const content = footer?.legal?.[isPrivacy ? 'privacy_content' : 'terms_content']
    || `Please contact us if you have any questions about our ${title.toLowerCase()}.`;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <Helmet><title>{title} | {footer?.brand_name || 'SciScript'}</title></Helmet>
      <p className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3">Legal</p>
      <h1 className="text-4xl font-bold text-navy-900 mb-8">{title}</h1>
      <div className="whitespace-pre-wrap text-navy-700 leading-8">{content}</div>
    </article>
  );
}

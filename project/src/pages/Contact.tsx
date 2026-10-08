import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react';
import SEO from '@/components/SEO';
import SectionTitle from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { useSiteData } from '@/context/SiteDataContext';
import { getPublicPageContent, getResearchAreas, getServices, submitContact } from '@/lib/api';
import type { ResearchArea, Service } from '@/types';

export default function Contact() {
  const { settings } = useSiteData();
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', research_area: '', service_required: '', message: '' });

  useEffect(() => {
    Promise.all([getResearchAreas(), getServices(), getPublicPageContent('contact')]).then(([research, serviceData, contactContent]) => {
      setAreas(research);
      setServices(serviceData);
      if (contactContent) setContent(contactContent);
    });
  }, []);

  const page = (content.contact_page && typeof content.contact_page === 'object' ? content.contact_page : content) as Record<string, unknown>;
  const text = (key: string, fallback: string) => typeof page[key] === 'string' && page[key] ? page[key] as string : fallback;
  const email = typeof content.email === 'string' ? content.email : settings?.contact_email;
  const phone = typeof content.phone === 'string' ? content.phone : settings?.contact_phone;
  const location = typeof content.location === 'string' ? content.location : settings?.contact_location;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await submitContact({ ...form, file_url: null });
    if (!result.success) setError('We could not send your message. Please try again.'); else { setSubmitted(true); setForm({ name: '', email: '', phone: '', research_area: '', service_required: '', message: '' }); }
    setSubmitting(false);
  };

  return (
    <>
      <SEO title={text('seo_title', 'Contact')} description={text('meta_description', 'Request a scientific writing, editing, literature review, scientific figures, or publication support consultation from SciScript Global.')} canonicalPath="/contact" siteSettings={settings} />
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-navy-50 via-white to-teal-50/30 overflow-hidden"><div className="absolute inset-0 grid-bg opacity-30" /><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"><span className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3 block">{text('eyebrow', 'Contact')}</span><h1 className="text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6">{text('heading', 'Discuss Your Research')}</h1><p className="text-lg text-navy-500 leading-relaxed max-w-2xl">{text('description', 'Tell us about your research goals, manuscript, review, figures, or publication needs. We will respond with the most relevant next steps.')}</p></div></section>
      <section className="py-20 lg:py-28 bg-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="grid lg:grid-cols-5 gap-12"><div className="lg:col-span-2"><SectionTitle center={false} eyebrow={text('contact_eyebrow', 'Get in Touch')} title={text('form_heading', 'Request a Scientific Writing Consultation')} subtitle={text('form_description', 'Your contact details are used only to respond to your enquiry.')} /><div className="space-y-5">{email && <a href={`mailto:${email}`} className="flex items-start gap-3 text-navy-600 hover:text-teal-600"><Mail className="w-5 h-5 text-teal-600 mt-0.5" /><span>{email}</span></a>}{phone && <a href={`tel:${phone}`} className="flex items-start gap-3 text-navy-600 hover:text-teal-600"><Phone className="w-5 h-5 text-teal-600 mt-0.5" /><span>{phone}</span></a>}{location && <div className="flex items-start gap-3 text-navy-600"><MapPin className="w-5 h-5 text-teal-600 mt-0.5" /><span>{location}</span></div>}</div></div><div className="lg:col-span-3"><div className="bg-offwhite rounded-2xl border border-navy-100 p-6 md:p-8">{submitted ? <div className="py-12 text-center"><div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 text-teal-600 mb-5"><CheckCircle2 className="w-8 h-8" /></div><h2 className="text-2xl font-bold text-navy-900 mb-3">{text('success_heading', 'Thank you for reaching out')}</h2><p className="text-navy-500 leading-relaxed">{text('success_description', 'Your consultation request has been received. We will review your message and respond as soon as possible.')}</p><button type="button" onClick={() => setSubmitted(false)} className="mt-6 text-sm font-semibold text-teal-600 hover:text-teal-700">Send another message</button></div> : <form onSubmit={handleSubmit} className="space-y-5"><div className="grid md:grid-cols-2 gap-5"><label className="block"><span className="block text-sm font-medium text-navy-700 mb-1.5">Name <span className="text-red-500">*</span></span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" /></label><label className="block"><span className="block text-sm font-medium text-navy-700 mb-1.5">Email <span className="text-red-500">*</span></span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" /></label></div><div className="grid md:grid-cols-2 gap-5"><label className="block"><span className="block text-sm font-medium text-navy-700 mb-1.5">Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" /></label><label className="block"><span className="block text-sm font-medium text-navy-700 mb-1.5">Research Area</span><select value={form.research_area} onChange={(e) => setForm({ ...form, research_area: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"><option value="">Select an area</option>{areas.map((area) => <option key={area.id} value={area.name}>{area.name}</option>)}</select></label></div><label className="block"><span className="block text-sm font-medium text-navy-700 mb-1.5">Service Required</span><select value={form.service_required} onChange={(e) => setForm({ ...form, service_required: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"><option value="">Select a service</option>{services.map((service) => <option key={service.id} value={service.title}>{service.title}</option>)}</select></label><label className="block"><span className="block text-sm font-medium text-navy-700 mb-1.5">Message <span className="text-red-500">*</span></span><textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your research or manuscript..." className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y" /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<Button type="submit" variant="secondary" disabled={submitting} className="w-full sm:w-auto">{submitting ? 'Sending...' : 'Request Scientific Writing Consultation'}<Send className="w-4 h-4 ml-2" /></Button></form>}</div></div></div></div></section>
    </>
  );
}

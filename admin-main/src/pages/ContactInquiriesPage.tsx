import { useEffect, useState } from 'react';
import { Check, Loader2, Mail, Phone, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { PageHeader } from '@/components/ui';
import { useToast } from '@/lib/toast';

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  researchArea?: string;
  serviceRequired?: string;
  projectDescription: string;
  status: 'new' | 'in_progress' | 'resolved' | 'spam';
  createdAt: string;
}

export default function ContactInquiriesPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setItems(await apiRequest<Inquiry[]>('/api/v1/admin/contact-inquiries')); }
    catch (error) { toast(error instanceof Error ? error.message : 'Unable to load inquiries', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    try { await apiRequest(`/api/v1/admin/contact-inquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); }
    catch (error) { toast(error instanceof Error ? error.message : 'Unable to update inquiry', 'error'); }
  };

  return (
    <div>
      <PageHeader title="Contact Inquiries" description="Review messages submitted through the public contact form" actions={<button onClick={load} className="btn btn-secondary"><RefreshCw className="h-4 w-4" /> Refresh</button>} />
      {loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-teal-400" /></div> : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="text-lg font-semibold text-white">{item.name}</h2><p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p></div>
                <select value={item.status} onChange={(e) => updateStatus(item._id, e.target.value as Inquiry['status'])} className="input w-auto py-1">
                  <option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="spam">Spam</option>
                </select>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-300"><a href={`mailto:${item.email}`}><Mail className="inline h-4 w-4 mr-1 text-teal-400" />{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}><Phone className="inline h-4 w-4 mr-1 text-teal-400" />{item.phone}</a>}</div>
              <p className="mt-4 whitespace-pre-wrap text-slate-200">{item.projectDescription}</p>
              <p className="mt-3 text-xs text-slate-500">{item.researchArea || 'General'} · {item.serviceRequired || 'Service not specified'}</p>
            </article>
          ))}
          {!items.length && <div className="card p-12 text-center text-slate-400"><Check className="mx-auto mb-2 text-teal-400" />No contact inquiries yet.</div>}
        </div>
      )}
    </div>
  );
}

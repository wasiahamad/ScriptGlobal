import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { apiUpload } from '@/lib/apiClient';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, required, hint, error, children }: FieldProps) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

interface CharCounterProps {
  value: string;
  max: number;
}

export function CharCounter({ value, max }: CharCounterProps) {
  const len = value.length;
  const ratio = len / max;
  const color = ratio > 1 ? 'text-red-400' : ratio > 0.9 ? 'text-amber-400' : 'text-slate-500';
  return (
    <p className={`text-xs mt-1 text-right ${color}`}>
      {len} / {max}
    </p>
  );
}

interface SaveBarProps {
  onSave: () => void;
  onPublish?: () => void;
  saving?: boolean;
  publishLabel?: string;
  saveLabel?: string;
}

export function SaveBar({ onSave, onPublish, saving, publishLabel = 'Publish', saveLabel = 'Save Draft' }: SaveBarProps) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onSave} disabled={saving} className="btn btn-secondary">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saveLabel}
      </button>
      {onPublish && (
        <button onClick={onPublish} disabled={saving} className="btn btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {publishLabel}
        </button>
      )}
    </div>
  );
}

interface StringListEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function StringListEditor({ value, onChange, placeholder, label }: StringListEditorProps) {
  return (
    <div className="space-y-2">
      {label && <label className="label">{label}</label>}
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
            className="input"
            placeholder={placeholder}
          />
          <button
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="btn btn-ghost p-2 text-red-400"
          >
            Remove
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...value, ''])} className="btn btn-secondary text-sm">
        + Add Item
      </button>
    </div>
  );
}

interface ImageUploadFieldProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  category?: string;
}

export function ImageUploadField({ label, value, onChange, category = 'General' }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File) => {
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    try {
      const media = await apiUpload<{ secureUrl?: string; secure_url?: string }>('/api/v1/admin/media', formData);
      const url = media.secureUrl || media.secure_url;
      if (!url) throw new Error('Upload response did not include an image URL');
      onChange(url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Field label={label}>
      <div className="space-y-2">
        {value && <img src={value} alt="Selected" className="h-32 w-full rounded-lg object-cover border border-slate-700" />}
        <label className="btn btn-secondary inline-flex cursor-pointer">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {uploading ? 'Uploading...' : value ? 'Replace Image' : 'Upload Image'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ''; }} />
        </label>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </Field>
  );
}

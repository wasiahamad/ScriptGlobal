import { useEffect, useState } from 'react';
import { Save, Loader2, User, Lock, Palette, Bell, Server } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/lib/toast';
import { useActivityLog } from '@/lib/useActivityLog';
import { supabase } from '@/lib/supabase';
import { apiRequest } from '@/lib/apiClient';
import { PageHeader } from '@/components/ui';
import { FormSection, Field } from '@/components/Form';
import { StatusBadge } from '@/components/ui';

export default function SettingsPage() {
  const { session } = useAuth();
  const { theme, toggle } = useTheme();
  const { toast } = useToast();
  const { logActivity } = useActivityLog();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('admin_profiles').select('*').eq('user_id', session?.user?.id).maybeSingle();
      if (data) setName(data.name || '');
    })();
  }, [session]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from('admin_profiles').update({ name }).eq('user_id', session?.user?.id);
    if (error) toast(error.message, 'error');
    else { toast('Profile updated'); await logActivity('Updated Profile', 'settings'); }
    setSaving(false);
  };

  const handleRequestOtp = async () => {
    if (!newPassword || newPassword.length < 8) { toast('Password must be at least 8 characters', 'error'); return; }
    setChangingPassword(true);
    try {
      await apiRequest('/api/v1/auth/password-change/request-otp', { method: 'POST' });
      setOtpRequested(true);
      toast(`Verification code sent to ${session?.user?.email || 'your registered email'}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to send verification code', 'error');
    }
    setChangingPassword(false);
  };

  const handleChangePassword = async () => {
    if (!/^\d{6}$/.test(otp)) { toast('Enter the 6-digit verification code', 'error'); return; }
    setChangingPassword(true);
    try {
      await apiRequest('/api/v1/auth/password-change/verify', {
        method: 'POST',
        body: JSON.stringify({ code: otp, password: newPassword }),
      });
      toast('Password updated successfully');
      setNewPassword('');
      setOtp('');
      setOtpRequested(false);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to update password', 'error');
    }
    setChangingPassword(false);
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your admin account preferences" />
      <div className="space-y-4">
        <FormSection title="Profile">
          <Field label="Display Name"><input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" /></Field>
          <Field label="Email"><input value={session?.user?.email || ''} disabled className="input opacity-60" /></Field>
          <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Profile</button>
        </FormSection>

        <FormSection title="Security">
          <Field label="New Password" hint="Minimum 8 characters"><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="••••••••" minLength={8} /></Field>
          {otpRequested && (
            <Field label="Email Verification Code" hint={`Enter the 6-digit code sent to ${session?.user?.email || 'your registered email'}`}>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="input tracking-[0.35em]" placeholder="000000" maxLength={6} />
            </Field>
          )}
          <div className="flex flex-wrap gap-2">
            {!otpRequested && <button onClick={handleRequestOtp} disabled={changingPassword} className="btn btn-primary">{changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Send Verification Code</button>}
            {otpRequested && <><button onClick={handleChangePassword} disabled={changingPassword} className="btn btn-primary">{changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Verify & Update Password</button><button onClick={handleRequestOtp} disabled={changingPassword} className="btn btn-secondary">Resend Code</button></>}
          </div>
        </FormSection>

        <FormSection title="Theme">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Dark Mode</p>
              <p className="text-xs text-slate-400">Toggle between dark and light themes</p>
            </div>
            <button onClick={toggle} className="btn btn-secondary">{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</button>
          </div>
        </FormSection>

        <FormSection title="System Status">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Backend API</span>
              <StatusBadge status="connected" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Database</span>
              <StatusBadge status="connected" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Storage</span>
              <StatusBadge status="connected" />
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
}

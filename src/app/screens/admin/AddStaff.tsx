import { useEffect, useMemo, useState } from 'react';
import { WireframeLayout, Sidebar, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import { showError, showSuccess } from '../../lib/notifications';
import { supabase } from '../../lib/supabase';

type StaffRole = 'pharmacist' | 'inventory_manager';

type StaffForm = {
  role: StaffRole;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  license_number: string;
  license_expiry: string;
};

type RecentStaff = {
  id: string;
  full_name: string;
  email: string;
  role: StaffRole;
  status: string;
  created_at: string | null;
};

const initialForm: StaffForm = {
  role: 'pharmacist',
  full_name: '',
  email: '',
  phone: '',
  employee_id: '',
  license_number: '',
  license_expiry: '',
};

export default function AddStaff() {
  const [form, setForm] = useState<StaffForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [recentStaff, setRecentStaff] = useState<RecentStaff[]>([]);

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Add Staff Accounts', path: '/admin/add-staff', active: true },
    { label: 'Manage Users', path: '/admin/manage-users' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Logout', path: '/' },
  ];

  const roleLabel = useMemo(
    () => (form.role === 'pharmacist' ? 'Pharmacist' : 'Inventory Manager'),
    [form.role],
  );

  useEffect(() => {
    void loadRecentStaff();
  }, []);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  useEffect(() => {
    if (message) {
      showSuccess(message);
    }
  }, [message]);

  const loadRecentStaff = async () => {
    const { data, error: queryError } = await supabase
      .from('users')
      .select('id, full_name, email, role, status, created_at')
      .in('role', ['pharmacist', 'inventory_manager'])
      .order('created_at', { ascending: false })
      .limit(8);

    if (!queryError) {
      setRecentStaff((data ?? []) as RecentStaff[]);
    }
  };

  const setField = (field: keyof StaffForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setError('');
    setMessage('');
  };

  const validateForm = () => {
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid email address.';
    if (!form.employee_id.trim()) return 'Employee ID is required.';
    if (form.role === 'pharmacist') {
      if (!form.license_number.trim()) return 'License number is required for pharmacists.';
      if (!form.license_expiry) return 'License expiry is required for pharmacists.';
    }
    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session?.access_token) {
        throw new Error('Your admin session is missing or expired. Please sign in again and retry.');
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-staff-account`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          role: form.role,
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          employee_id: form.employee_id.trim(),
          license_number: form.role === 'pharmacist' ? form.license_number.trim() : null,
          license_expiry: form.role === 'pharmacist' ? form.license_expiry : null,
        }),
      });

      let payload: { error?: string; message?: string } | null = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || `Request failed with status ${response.status}.`);
      }

      setMessage(
        payload?.message ||
          `${roleLabel} account created. Supabase Auth user, public.users row, and role-specific row were created successfully.`,
      );
      setForm(initialForm);
      setError('');
      await loadRecentStaff();
    } catch (submitError: any) {
      setError(
        submitError.message ||
          'Could not create staff account. Make sure the Supabase Edge Function "create-staff-account" is deployed.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WireframeLayout
      sidebar={<Sidebar items={sidebarItems} />}
      title="Add Staff Accounts"
    >
      <div className="space-y-6">
        <WireframeCard>
          <div className="text-xs font-mono text-neutral-700 mb-2">
            Create new accounts for Pharmacists and Inventory Managers. Staff will use these credentials to sign in.
          </div>
          <div className="text-xs font-mono text-neutral-600">
            Creating Auth users for other people should not be done directly from the browser anon client. This screen uses a Supabase Edge Function so the service role key stays on the server.
          </div>
        </WireframeCard>

        <WireframeCard title="Create New Staff Account">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field label="Account Type *">
                  <select
                    className={inputClassName}
                    value={form.role}
                    onChange={(e) => setField('role', e.target.value as StaffRole)}
                  >
                    <option value="pharmacist">Pharmacist</option>
                    <option value="inventory_manager">Inventory Manager</option>
                  </select>
                </Field>
                <Field label="Full Name *">
                  <input className={inputClassName} value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} />
                </Field>
                <Field label="Email Address *">
                  <input type="email" className={inputClassName} value={form.email} onChange={(e) => setField('email', e.target.value)} />
                </Field>
                <Field label="Phone Number">
                  <input className={inputClassName} value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                </Field>
              </div>
              <div className="space-y-4">
                <Field label="Employee ID *">
                  <input className={inputClassName} value={form.employee_id} onChange={(e) => setField('employee_id', e.target.value)} />
                </Field>
                <Field label="License Number (Pharmacist only)">
                  <input
                    className={inputClassName}
                    value={form.license_number}
                    onChange={(e) => setField('license_number', e.target.value)}
                    disabled={form.role !== 'pharmacist'}
                  />
                </Field>
                <Field label="License Expiry (Pharmacist only)">
                  <input
                    type="date"
                    className={inputClassName}
                    value={form.license_expiry}
                    onChange={(e) => setField('license_expiry', e.target.value)}
                    disabled={form.role !== 'pharmacist'}
                  />
                </Field>
              </div>
            </div>

            {error && <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            {message && <div className="border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}

            <div className="flex gap-4">
              <WireframeButton label={submitting ? 'Creating...' : 'Create Account'} disabled={submitting} type="submit" />
              <WireframeButton label="Reset Form" variant="secondary" disabled={submitting} onClick={resetForm} type="button" />
            </div>
          </form>
        </WireframeCard>

        <WireframeCard title="Recently Created Staff Accounts">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-400">
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Name</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Email</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Role</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Created Date</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStaff.map((staff) => (
                  <tr key={staff.id} className="border-b border-neutral-300">
                    <td className="p-3 text-xs font-mono text-neutral-700">{staff.full_name}</td>
                    <td className="p-3 text-xs font-mono text-neutral-600">{staff.email}</td>
                    <td className="p-3 text-xs font-mono text-neutral-700">
                      {staff.role === 'pharmacist' ? 'Pharmacist' : 'Inventory Manager'}
                    </td>
                    <td className="p-3 text-xs font-mono text-neutral-600">
                      {staff.created_at ? new Date(staff.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="px-2 py-1 border bg-neutral-600 text-white border-neutral-800 text-xs font-mono inline-block">
                        {staff.status.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                ))}
                {recentStaff.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-sm text-neutral-600">
                      No staff records found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </WireframeCard>
      </div>
    </WireframeLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-mono font-bold uppercase tracking-wide text-neutral-700">{label}</div>
      {children}
    </label>
  );
}

const inputClassName =
  'w-full border-2 border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-500';

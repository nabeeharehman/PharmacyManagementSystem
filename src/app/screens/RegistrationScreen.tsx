import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { WireframeButton, WireframeCard } from '../components/WireframeLayout';
import { showError, showSuccess } from '../lib/notifications';
import { supabase } from '../lib/supabase';

type Step = 'details' | 'otp' | 'password' | 'done';
const PENDING_SIGNUP_EMAIL_KEY = 'customer_signup_pending_email';

export default function RegistrationScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    const bootstrapFromSession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const queryParams = new URLSearchParams(window.location.search);
      const callbackType = hashParams.get('type') ?? queryParams.get('type');
      const callbackAccessToken = hashParams.get('access_token');
      const callbackCode = queryParams.get('code');
      const callbackTokenHash = queryParams.get('token_hash');
      const isAuthCallback = Boolean(callbackAccessToken || callbackCode || callbackTokenHash);
      const pendingSignupEmail = localStorage.getItem(PENDING_SIGNUP_EMAIL_KEY)?.toLowerCase() ?? '';

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const sessionEmail = (session?.user?.email ?? '').toLowerCase();
      const sessionRole =
        typeof session?.user?.user_metadata?.role === 'string'
          ? session.user.user_metadata.role.toLowerCase()
          : '';
      setHasActiveSession(Boolean(sessionEmail));

      if (!session?.user) return;

      // Check if user already completed registration (customer profile exists)
      if (step === 'details') {
        const { data: customerProfile } = await supabase
          .from('customers')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (customerProfile) {
          // User already registered, don't auto-resume
          return;
        }
      }

      const isSignupCallback =
        callbackType !== 'recovery' &&
        isAuthCallback &&
        Boolean(sessionEmail) &&
        sessionRole === 'customer' &&
        (!pendingSignupEmail || sessionEmail === pendingSignupEmail);

      // Resume after a real customer signup callback. If local storage is missing
      // because the email link opened in a different tab/browser, the callback
      // session metadata is enough to continue registration.
      if (isSignupCallback && (step === 'details' || step === 'otp')) {
        const sessionEmail = session.user.email ?? '';
        const metaName =
          typeof session.user.user_metadata?.full_name === 'string'
            ? session.user.user_metadata.full_name
            : '';

        if (!email && sessionEmail) setEmail(sessionEmail);
        if (!fullName && metaName) setFullName(metaName);
        setStep('password');
        setMessage('Email verification completed. Set your password to finish registration.');
      }
    };

    void bootstrapFromSession();
  }, [step, email, fullName]);

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

  const clearAlerts = () => {
    setError('');
    setMessage('');
  };

  const sendOtp = async () => {
    clearAlerts();
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    localStorage.setItem(PENDING_SIGNUP_EMAIL_KEY, normalizedEmail);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/register`,
        data: {
          full_name: fullName.trim(),
          role: 'customer',
        },
      },
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setMessage('We sent a confirmation email to your email address.');
    setStep('otp');
  };

  const verifyOtp = async () => {
    clearAlerts();
    if (!otp.trim()) {
      setError('Click the link in your email to verify your address.');
      return;
    }

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: otp.trim(),
      type: 'email',
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setMessage('Email verified. Set your password to finish registration.');
    setStep('password');
  };

  const finishRegistration = async () => {
    clearAlerts();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) {
      setLoading(false);
      setError(passwordError.message);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setError(userError?.message || 'Unable to read authenticated user.');
      return;
    }

    const { data: existingProfile, error: existingProfileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfileError) {
      setLoading(false);
      setError(existingProfileError.message);
      return;
    }

    if (existingProfile && existingProfile.role !== 'customer') {
      setLoading(false);
      setError('This email belongs to a non-customer account. Please contact admin.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim() || null;
    const normalizedDob = dateOfBirth || null;

    const { error: userUpsertError } = await supabase.from('users').upsert(
      {
        id: user.id,
        email: normalizedEmail,
        full_name: fullName.trim(),
        role: 'customer',
        phone: normalizedPhone,
        status: 'active',
      },
      { onConflict: 'id' },
    );

    if (userUpsertError) {
      setLoading(false);
      setError(userUpsertError.message);
      return;
    }

    const { error: customerUpsertError } = await supabase.from('customers').upsert(
      {
        id: user.id,
        full_name: fullName.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        date_of_birth: normalizedDob,
      },
      { onConflict: 'id' },
    );

    setLoading(false);

    if (customerUpsertError) {
      setError(customerUpsertError.message);
      return;
    }

    localStorage.removeItem(PENDING_SIGNUP_EMAIL_KEY);
    setMessage('Customer registration completed successfully.');
    setStep('done');
  };

  const startFreshRegistration = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem(PENDING_SIGNUP_EMAIL_KEY);
    setHasActiveSession(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setDateOfBirth('');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setStep('details');
    clearAlerts();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="text-2xl font-mono text-neutral-800 mb-2">PharmaSphere</div>
          <div className="text-sm font-mono text-neutral-600">Customer Registration with Email Authentication</div>
        </div>
        <WireframeCard title="Register as Customer">
          <div className="space-y-4">
            

            <div className="text-xs font-mono text-neutral-600">
              Step: {step === 'details' ? '1/3 Details' : step === 'otp' ? '2/3 Verify Email' : step === 'password' ? '3/3 Set Password' : 'Completed'}
            </div>

            {step === 'details' && hasActiveSession && (
              <div className="space-y-2 border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                <div>
                  A previous signup session is active in this browser.
                </div>
                <div>
                  To register a different customer, clear the current session first.
                </div>
                <WireframeButton
                  label={loading ? 'Clearing...' : 'Start Fresh Registration'}
                  variant="secondary"
                  disabled={loading}
                  onClick={() => void startFreshRegistration()}
                />
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-3">
                <Field label="Full Name *">
                  <input className={inputClassName} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </Field>
                <Field label="Email *">
                  <input type="email" className={inputClassName} value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Phone Number (Optional)">
                  <input className={inputClassName} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
                <Field label="Date of Birth (Optional)">
                  <input type="date" className={inputClassName} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </Field>
                <WireframeButton
                  label={loading ? 'Sending authentication email...' : 'Send authentication email'}
                  className="w-full"
                  disabled={loading}
                  onClick={() => void sendOtp()}
                />
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-3">
                <Field label="Email Confirmation   *">
                  <input className={inputClassName} value={otp} onChange={(e) => setOtp(e.target.value)} />
                </Field>
                <div className="flex gap-3">
                  <WireframeButton
                    label={loading ? 'Verifying...' : 'Verify Email'}
                    disabled={loading}
                    onClick={() => void verifyOtp()}
                  />
                  <WireframeButton
                    label={loading ? 'Resending...' : 'Resend Email'}
                    variant="secondary"
                    disabled={loading}
                    onClick={() => void sendOtp()}
                  />
                </div>
              </div>
            )}

            {step === 'password' && (
              <div className="space-y-3">
                <Field label="Create Password *">
                  <input type="password" className={inputClassName} value={password} onChange={(e) => setPassword(e.target.value)} />
                </Field>
                <Field label="Confirm Password *">
                  <input type="password" className={inputClassName} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </Field>
                <WireframeButton
                  label={loading ? 'Creating Account...' : 'Finish Registration'}
                  className="w-full"
                  disabled={loading}
                  onClick={() => void finishRegistration()}
                />
              </div>
            )}

            {step === 'done' && (
              <div className="space-y-3">
                <div className="text-sm font-mono text-emerald-700 border border-emerald-300 bg-emerald-50 p-3">
                  Registration complete. You can now sign in as customer.
                </div>
                <WireframeButton label="Go to Login" className="w-full" onClick={() => navigate('/login')} />
              </div>
            )}

            {error && (
              <div className="space-y-3 border border-red-300 bg-red-50 p-3">
                <div className="text-sm text-red-800">{error}</div>
                <WireframeButton
                  label={loading ? 'Resetting...' : 'Back to Registration Details'}
                  className="w-full"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => void startFreshRegistration()}
                />
              </div>
            )}
            {message && <div className="border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}

            <div className="text-center text-xs font-mono">
              <button
                className="text-neutral-600 underline"
                onClick={() => navigate('/login')}
              >
                Already have an account? Login
              </button>
            </div>
          </div>
        </WireframeCard>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-mono text-neutral-700">{label}</div>
      {children}
    </label>
  );
}

const inputClassName =
  'w-full border-2 border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900';

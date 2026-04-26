import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { showError, showSuccess } from '../lib/notifications';
import { supabase } from '../lib/supabase';

type Role = 'customer' | 'pharmacist' | 'inventory_manager' | 'admin';

interface RoleConfig {
  id: Role;
  label: string;
  dashboard: string;
}

const roles: RoleConfig[] = [
  {
    id: 'customer',
    label: 'Customer',
    dashboard: '/customer/dashboard',
  },
  {
    id: 'pharmacist',
    label: 'Pharmacist',
    dashboard: '/pharmacist/dashboard',
  },
  {
    id: 'inventory_manager',
    label: 'Inventory Manager',
    dashboard: '/inventory/dashboard',
  },
  {
    id: 'admin',
    label: 'Administrator',
    dashboard: '/admin/dashboard',
  },
];

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const routeCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const queryParams = new URLSearchParams(window.location.search);

      const authType = hashParams.get('type') ?? queryParams.get('type');
      const accessToken = hashParams.get('access_token');
      const code = queryParams.get('code');
      const tokenHash = queryParams.get('token_hash');
      const isAuthCallback = Boolean(accessToken || code || tokenHash);

      if (!isAuthCallback) return;

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      if (authType === 'recovery') {
        navigate('/reset-password', { replace: true });
        return;
      }

      navigate('/register', { replace: true });
    };

    void routeCallback();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const user = authData.user;

      if (!user) {
        setError('Login failed: no user returned.');
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, full_name, role, status')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(`Could not fetch user profile: ${profileError.message}`);
        return;
      }

      if (!userProfile) {
        setError('User profile not found.');
        return;
      }

      if (userProfile.status !== 'active') {
        setError(`Your account is ${userProfile.status}. Please contact support.`);
        return;
      }

      const roleDashboard = roles.find((role) => role.id === userProfile.role)?.dashboard;

      if (!roleDashboard) {
        setError('Invalid role configuration.');
        return;
      }

      showSuccess(`Login successful. Welcome back, ${userProfile.full_name || userProfile.email}.`);
      navigate(roleDashboard);
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>Rx</div>
          <div style={styles.brandName}>PharmaSphere</div>
          <div style={styles.brandTagline}>
            Prescription Management and Pharmacy Operations Platform
          </div>
        </div>

        <div style={styles.leftFooter}>
          <span style={styles.footerText}>
            Secure - Role-Based - Compliant
          </span>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <div style={styles.formTitle}>Sign in</div>
            <div style={styles.formSubtitle}>
              One login screen for everyone. Enter your email and password, and the system will open the correct dashboard.
            </div>
          </div>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pharmasphere.com"
                style={styles.input}
                autoComplete="email"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={styles.input}
                autoComplete="current-password"
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.forgotRow}>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={styles.forgotLink}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {}),
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={styles.registerRow}>
            <span style={styles.registerText}>New customer? </span>
            <button
              onClick={() => navigate('/register')}
              style={styles.registerLink}
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'DM Mono', 'Courier New', monospace",
    backgroundColor: '#f5f4f0',
  },
  left: {
    width: '42%',
    backgroundColor: '#111110',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '60px 56px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  brandMark: {
    width: 56,
    height: 56,
    backgroundColor: '#e8e4d4',
    color: '#111110',
    fontFamily: "'DM Mono', monospace",
    fontWeight: 700,
    fontSize: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: 1,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 700,
    color: '#f5f4f0',
    letterSpacing: '-0.5px',
  },
  brandTagline: {
    fontSize: 13,
    color: '#6b6b67',
    lineHeight: 1.6,
    maxWidth: 280,
  },
  leftFooter: {
    borderTop: '1px solid #2a2a28',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 11,
    color: '#4a4a46',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 32px',
  },
  formCard: {
    width: '100%',
    maxWidth: 480,
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  formHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#111110',
    letterSpacing: '-0.5px',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#888884',
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#444440',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    padding: '11px 14px',
    border: '2px solid #e0dfd8',
    backgroundColor: '#fff',
    fontSize: 13,
    fontFamily: 'inherit',
    color: '#111110',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  forgotRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: -4,
  },
  forgotLink: {
    background: 'none',
    border: 'none',
    fontSize: 12,
    color: '#888884',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: 'inherit',
  },
  error: {
    fontSize: 12,
    color: '#c0392b',
    backgroundColor: '#fdf0ee',
    border: '1px solid #f0c0b8',
    padding: '10px 14px',
  },
  submitBtn: {
    padding: '13px 20px',
    backgroundColor: '#111110',
    color: '#f5f4f0',
    border: 'none',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    letterSpacing: 0.5,
    marginTop: 4,
    transition: 'background-color 0.15s',
  },
  submitBtnDisabled: {
    backgroundColor: '#888884',
    cursor: 'not-allowed',
  },
  registerRow: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: -8,
  },
  registerText: {
    color: '#888884',
  },
  registerLink: {
    background: 'none',
    border: 'none',
    fontSize: 12,
    color: '#111110',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontFamily: 'inherit',
    fontWeight: 700,
  },
};

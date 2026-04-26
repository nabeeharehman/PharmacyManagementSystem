import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { showError, showSuccess } from '../lib/notifications';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (sessionError) {
        setError(sessionError.message);
        showError(sessionError.message);
        return;
      }

      if (!data.session) {
        const errorMessage = 'Open the reset link from your email first, then set the new password here.';
        setError(errorMessage);
        showError(errorMessage);
        return;
      }

      setReady(true);
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      const errorMessage = 'Password must be at least 8 characters long.';
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    if (password !== confirmPassword) {
      const errorMessage = 'Passwords do not match.';
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      showError(updateError.message);
      setSaving(false);
      return;
    }

    const successMessage = 'Password updated successfully. You can now sign in with the new password.';
    setMessage(successMessage);
    showSuccess(successMessage);
    setSaving(false);
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.title}>Reset Password</div>
        <div style={styles.subtitle}>
          Set a new password for your PharmaSphere account.
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={styles.input}
            placeholder="Enter a new password"
            disabled={!ready}
          />

          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            style={styles.input}
            placeholder="Confirm the new password"
            disabled={!ready}
          />

          {error && <div style={styles.error}>{error}</div>}
          {message && <div style={styles.success}>{message}</div>}

          <button type="submit" disabled={!ready || saving} style={styles.primaryButton}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
          <button type="button" onClick={() => navigate('/login')} style={styles.secondaryButton}>
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f4f0',
    padding: '24px',
    fontFamily: "'DM Mono', 'Courier New', monospace",
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: '#ffffff',
    border: '2px solid #d4d4cf',
    padding: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#111110',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#66665f',
    marginBottom: '24px',
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#444440',
  },
  input: {
    border: '2px solid #d4d4cf',
    padding: '12px 14px',
    fontFamily: 'inherit',
    fontSize: '14px',
  },
  primaryButton: {
    border: 'none',
    background: '#111110',
    color: '#f5f4f0',
    padding: '12px 16px',
    fontFamily: 'inherit',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryButton: {
    border: '2px solid #d4d4cf',
    background: '#ffffff',
    color: '#111110',
    padding: '12px 16px',
    fontFamily: 'inherit',
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    border: '1px solid #f0b3b3',
    background: '#fff2f2',
    color: '#9f1d1d',
    padding: '10px 12px',
    fontSize: '12px',
  },
  success: {
    border: '1px solid #b8dfc2',
    background: '#effcf2',
    color: '#166534',
    padding: '10px 12px',
    fontSize: '12px',
  },
};

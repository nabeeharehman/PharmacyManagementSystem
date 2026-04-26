import { useState } from 'react';
import { useNavigate } from 'react-router';
import { showError, showSuccess } from '../lib/notifications';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      const errorMessage = 'Enter the email address for your account.';
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    setSending(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      showError(resetError.message);
      setSending(false);
      return;
    }

    const successMessage = 'A password reset email has been sent if the address exists in the system.';
    setMessage(successMessage);
    showSuccess(successMessage);
    setSending(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.title}>Forgot Password</div>
        <div style={styles.subtitle}>
          Enter your account email and we will send the reset link.
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={styles.input}
            placeholder="name@example.com"
          />

          {error && <div style={styles.error}>{error}</div>}
          {message && <div style={styles.success}>{message}</div>}

          <button type="submit" disabled={sending} style={styles.primaryButton}>
            {sending ? 'Sending...' : 'Send Reset Email'}
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

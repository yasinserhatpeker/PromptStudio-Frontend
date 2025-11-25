import { useState } from 'react';
import { useAuthStore } from '../store';
import { authApi } from '../services';
import type { AxiosError } from 'axios';
import type { ApiError } from '../types/api';

type Mode = 'login' | 'register';

// Gemini Dark Theme Colors
const COLORS = {
  background: '#131314',
  surface: '#1E1F20',
  input: '#282A2C',
  textPrimary: '#E3E3E3',
  textSecondary: '#C4C7C5',
  accent: '#A8C7FA',
  border: '#444746',
  buttonPrimary: '#8AB4F8',
  buttonPrimaryText: '#041E49',
  error: '#F2B8B5',
  errorBg: '#8C1D18',
  success: '#81C995',
  successBg: '#1E4620',
};

export function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await authApi.register({ email, password, username });
        setMode('login');
        setSuccessMessage('Account created successfully! Please log in.');
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message);
      } else if (axiosError.message) {
        setError(axiosError.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setSuccessMessage(null);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: COLORS.input,
    border: 'none',
    borderRadius: '24px',
    color: COLORS.textPrimary,
    fontSize: '14px',
    outline: 'none',
    transition: 'box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: COLORS.textSecondary,
    marginBottom: '8px',
    paddingLeft: '4px',
  };

  return (
    <div style={{ width: '100%', maxWidth: '340px' }}>
      {/* Form Container */}
      <div
        style={{
          width: '100%',
          backgroundColor: COLORS.surface,
          borderRadius: '24px',
          padding: '32px 24px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 500,
            color: COLORS.textPrimary,
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>

        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              marginBottom: '16px',
              backgroundColor: COLORS.successBg,
              borderRadius: '12px',
            }}
          >
            <p style={{ fontSize: '13px', color: COLORS.success, margin: 0 }}>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                placeholder="Enter your username"
                required
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: COLORS.errorBg,
                borderRadius: '12px',
              }}
            >
              <p style={{ fontSize: '13px', color: COLORS.error, margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: COLORS.buttonPrimary,
              color: COLORS.buttonPrimaryText,
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'opacity 0.2s, background-color 0.2s',
              marginTop: '8px',
            }}
          >
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: COLORS.textSecondary, margin: 0 }}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={toggleMode}
              style={{
                marginLeft: '6px',
                color: COLORS.accent,
                background: 'none',
                border: 'none',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

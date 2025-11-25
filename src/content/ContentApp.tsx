import { useState, useEffect } from 'react';
import { Dashboard } from '../components/Dashboard';
import { Login } from '../components/Login';
import { useAuthStore } from '../store';

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
};

export function ContentApp() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, isAuthenticated, loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  return (
    <>
      {/* Floating Trigger Button - Gemini Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: isOpen ? '474px' : '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 2147483647,
          backgroundColor: isOpen ? COLORS.surface : COLORS.buttonPrimary,
          border: 'none',
          cursor: 'pointer',
        }}
        title="PromptStudio"
      >
        {isOpen ? (
          <svg style={{ width: '24px', height: '24px', color: COLORS.textPrimary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg style={{ width: '28px', height: '28px', color: COLORS.buttonPrimaryText }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            <path d="M7 9h10v2H7zm0-3h10v2H7z"/>
          </svg>
        )}
      </button>

      {/* Fixed Right Sidebar - Gemini Style */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '450px',
          backgroundColor: COLORS.background,
          borderLeft: `1px solid ${COLORS.border}`,
          zIndex: 2147483646,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Google Sans, Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Sidebar Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.background,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '28px', height: '28px', color: COLORS.accent }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <path d="M7 9h10v2H7zm0-3h10v2H7z"/>
            </svg>
            <span style={{ fontWeight: 500, fontSize: '18px', color: COLORS.textPrimary }}>PromptStudio</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: '8px',
              color: COLORS.textSecondary,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.surface)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>
          {isLoading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    border: `3px solid ${COLORS.surface}`,
                    borderTopColor: COLORS.accent,
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <p style={{ color: COLORS.textSecondary, fontSize: '14px' }}>Loading...</p>
              </div>
            </div>
          ) : isAuthenticated ? (
            <Dashboard />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
              <Login />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default ContentApp;

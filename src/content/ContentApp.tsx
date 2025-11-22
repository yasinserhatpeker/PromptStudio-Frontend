import { useState, useEffect } from 'react';
import { Dashboard } from '../components/Dashboard';
import { Login } from '../components/Login';
import { useAuthStore } from '../store';

export function ContentApp() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoading, isAuthenticated, loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  return (
    <>
      {/* Floating Trigger Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: isOpen ? '474px' : '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 2147483647,
          backgroundColor: isOpen ? '#1e293b' : '#2563eb',
          border: 'none',
          cursor: 'pointer',
        }}
        title="PromptStudio"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '24px', height: '24px', color: 'white' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg style={{ width: '32px', height: '32px', color: 'white' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            <path d="M7 9h10v2H7zm0-3h10v2H7z"/>
          </svg>
        )}
      </button>

      {/* Fixed Right Sidebar - No backdrop overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '450px',
          backgroundColor: '#020617',
          borderLeft: '1px solid #1e293b',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.5)',
          zIndex: 2147483646,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Sidebar Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: '1px solid #1e293b',
          backgroundColor: '#0f172a',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg style={{ width: '32px', height: '32px', color: '#3b82f6' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              <path d="M7 9h10v2H7zm0-3h10v2H7z"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#f1f5f9', letterSpacing: '-0.025em' }}>PromptStudio</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: '8px',
              color: '#94a3b8',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isLoading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="animate-spin" style={{
                  width: '32px',
                  height: '32px',
                  border: '4px solid #3b82f6',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  margin: '0 auto 8px',
                  animation: 'spin 1s linear infinite',
                }}></div>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</p>
              </div>
            </div>
          ) : isAuthenticated ? (
            <Dashboard />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <Login />
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default ContentApp;

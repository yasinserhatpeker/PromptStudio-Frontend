import { useEffect } from 'react';
import { useAuthStore } from './store';
import { Login, Dashboard } from './components';

function App() {
  const { isLoading, isAuthenticated, loadAuth, logout } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  if (isLoading) {
    return (
      <div className="w-[400px] h-[500px] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#1e293b,_#0a192f,_#061224)]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[500px] bg-[radial-gradient(ellipse_at_top,_#1e293b,_#0a192f,_#061224)] flex flex-col relative">
      {/* Navbar */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-950/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img
            src="./icons/logo.svg"
            alt="PromptStudio"
            className="h-10 w-10"
          />
          <span className="font-bold text-lg text-slate-100 tracking-tight">PromptStudio</span>
        </div>
        {isAuthenticated && (
          <button
            onClick={logout}
            className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex items-center justify-center">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </main>
    </div>
  );
}

export default App;

import { useEffect } from 'react';
import { useAuthStore } from './store';
import { Login } from './components';

function App() {
  const { isLoading, isAuthenticated, user, loadAuth, logout } = useAuthStore();

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
    <div className="w-[400px] h-[500px] bg-[radial-gradient(ellipse_at_top,_#1e293b,_#0a192f,_#061224)] flex flex-col">
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
            className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex items-center justify-center">
        {isAuthenticated ? (
          <div className="p-4 w-full">
            <div className="bg-slate-900/40 rounded-xl shadow p-4 mb-4 border border-slate-800/50 backdrop-blur-sm">
              <p className="text-emerald-400 font-medium">You are logged in!</p>
              {user && (
                <p className="text-slate-300 text-sm mt-1">
                  Welcome, {user.username || user.email}
                </p>
              )}
            </div>
            <p className="text-slate-400 text-sm text-center">
              Your prompts will appear here.
            </p>
          </div>
        ) : (
          <Login />
        )}
      </main>
    </div>
  );
}

export default App;

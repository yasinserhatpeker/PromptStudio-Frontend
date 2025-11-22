import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentApp from './ContentApp';

// Comprehensive CSS for Shadow DOM - includes all Tailwind utilities we use
const STYLES = `
/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Base */
#promptstudio-app {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #e2e8f0;
  -webkit-font-smoothing: antialiased;
}

/* Form elements reset */
input, button, textarea {
  font-family: inherit;
  font-size: inherit;
}

input::placeholder {
  color: #64748b;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #475569; }

/* Layout */
.fixed { position: fixed; }
.absolute { position: absolute; }
.relative { position: relative; }
.inset-0 { inset: 0; }
.top-0 { top: 0; }
.right-0 { right: 0; }
.bottom-4 { bottom: 1rem; }
.bottom-6 { bottom: 1.5rem; }
.right-4 { right: 1rem; }
.right-6 { right: 1.5rem; }
.left-1\\/2 { left: 50%; }

/* Sizing */
.w-full { width: 100%; }
.w-3 { width: 0.75rem; }
.w-3\\.5 { width: 0.875rem; }
.w-4 { width: 1rem; }
.w-5 { width: 1.25rem; }
.w-6 { width: 1.5rem; }
.w-8 { width: 2rem; }
.w-10 { width: 2.5rem; }
.w-12 { width: 3rem; }
.w-14 { width: 3.5rem; }
.w-1\\/4 { width: 25%; }
.w-\\[400px\\] { width: 400px; }
.h-full { height: 100%; }
.h-3 { height: 0.75rem; }
.h-3\\.5 { height: 0.875rem; }
.h-4 { height: 1rem; }
.h-5 { height: 1.25rem; }
.h-6 { height: 1.5rem; }
.h-8 { height: 2rem; }
.h-10 { height: 2.5rem; }
.h-12 { height: 3rem; }
.h-14 { height: 3.5rem; }
.min-w-0 { min-width: 0; }
.min-w-\\[90px\\] { min-width: 90px; }
.max-w-\\[150px\\] { max-width: 150px; }
.max-w-sm { max-width: 24rem; }

/* Flexbox */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1 1 0%; }
.flex-shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.flex-wrap { flex-wrap: wrap; }

/* Grid */
.grid { display: grid; }

/* Overflow */
.overflow-auto { overflow: auto; }
.overflow-hidden { overflow: hidden; }

/* Display */
.hidden { display: none; }
.block { display: block; }

/* Spacing */
.p-1 { padding: 0.25rem; }
.p-1\\.5 { padding: 0.375rem; }
.p-2 { padding: 0.5rem; }
.p-2\\.5 { padding: 0.625rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.pl-8 { padding-left: 2rem; }
.pl-10 { padding-left: 2.5rem; }
.pr-2 { padding-right: 0.5rem; }
.pr-4 { padding-right: 1rem; }
.pt-1 { padding-top: 0.25rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-1\\.5 { margin-bottom: 0.375rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mt-0\\.5 { margin-top: 0.125rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-1\\.5 { margin-top: 0.375rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.ml-1 { margin-left: 0.25rem; }
.ml-1\\.5 { margin-left: 0.375rem; }
.space-y-4 > * + * { margin-top: 1rem; }

/* Border Radius */
.rounded { border-radius: 0.25rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-full { border-radius: 9999px; }

/* Borders */
.border { border-width: 1px; border-style: solid; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; }
.border-r { border-right-width: 1px; border-right-style: solid; }
.border-r-2 { border-right-width: 2px; border-right-style: solid; }
.border-slate-600 { border-color: #475569; }
.border-slate-700 { border-color: #334155; }
.border-slate-800 { border-color: #1e293b; }
.border-slate-800\\/50 { border-color: rgba(30, 41, 59, 0.5); }
.border-blue-500 { border-color: #3b82f6; }
.border-blue-500\\/50 { border-color: rgba(59, 130, 246, 0.5); }
.border-emerald-900\\/50 { border-color: rgba(6, 78, 59, 0.5); }
.border-red-900\\/50 { border-color: rgba(127, 29, 29, 0.5); }
.border-transparent { border-color: transparent; }

/* Backgrounds */
.bg-transparent { background-color: transparent; }
.bg-white { background-color: #ffffff; }
.bg-black\\/30 { background-color: rgba(0, 0, 0, 0.3); }
.bg-slate-700 { background-color: #334155; }
.bg-slate-800 { background-color: #1e293b; }
.bg-slate-800\\/50 { background-color: rgba(30, 41, 59, 0.5); }
.bg-slate-900 { background-color: #0f172a; }
.bg-slate-900\\/40 { background-color: rgba(15, 23, 42, 0.4); }
.bg-slate-900\\/60 { background-color: rgba(15, 23, 42, 0.6); }
.bg-slate-900\\/80 { background-color: rgba(15, 23, 42, 0.8); }
.bg-slate-950 { background-color: #020617; }
.bg-slate-950\\/30 { background-color: rgba(2, 6, 23, 0.3); }
.bg-slate-950\\/50 { background-color: rgba(2, 6, 23, 0.5); }
.bg-blue-600 { background-color: #2563eb; }
.bg-blue-600\\/20 { background-color: rgba(37, 99, 235, 0.2); }
.bg-blue-900\\/30 { background-color: rgba(30, 58, 138, 0.3); }
.bg-emerald-950\\/50 { background-color: rgba(2, 44, 34, 0.5); }
.bg-red-950\\/50 { background-color: rgba(69, 10, 10, 0.5); }

/* Text Colors */
.text-white { color: #ffffff; }
.text-slate-100 { color: #f1f5f9; }
.text-slate-200 { color: #e2e8f0; }
.text-slate-300 { color: #cbd5e1; }
.text-slate-400 { color: #94a3b8; }
.text-slate-500 { color: #64748b; }
.text-slate-700 { color: #334155; }
.text-blue-400 { color: #60a5fa; }
.text-blue-500 { color: #3b82f6; }
.text-emerald-400 { color: #34d399; }
.text-red-400 { color: #f87171; }

/* Typography */
.text-\\[9px\\] { font-size: 9px; }
.text-\\[10px\\] { font-size: 10px; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.tracking-tight { letter-spacing: -0.025em; }
.tracking-wider { letter-spacing: 0.05em; }
.uppercase { text-transform: uppercase; }
.text-left { text-align: left; }
.text-center { text-align: center; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Shadows */
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.shadow-blue-600\\/20 { --tw-shadow-color: rgba(37, 99, 235, 0.2); }

/* Transforms */
.transform { transform: translateX(var(--tw-translate-x, 0)) translateY(var(--tw-translate-y, 0)) rotate(var(--tw-rotate, 0)); }
.translate-x-0 { --tw-translate-x: 0; transform: translateX(0); }
.translate-x-full { --tw-translate-x: 100%; transform: translateX(100%); }
.-translate-x-1\\/2 { transform: translateX(-50%); }
.-translate-y-1\\/2 { transform: translateY(-50%); }
.rotate-45 { transform: rotate(45deg); }
.scale-110 { transform: scale(1.1); }

/* Transitions */
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-colors { transition-property: color, background-color, border-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.duration-300 { transition-duration: 300ms; }
.ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }

/* Opacity */
.opacity-70 { opacity: 0.7; }
.opacity-100 { opacity: 1; }

/* Z-index */
.z-\\[9998\\] { z-index: 9998; }
.z-\\[9999\\] { z-index: 9999; }
.z-\\[10000\\] { z-index: 10000; }

/* Focus */
.focus\\:outline-none:focus { outline: none; }
.focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
.focus\\:ring-blue-500:focus { --tw-ring-color: #3b82f6; }
.focus\\:border-transparent:focus { border-color: transparent; }
.outline-none { outline: none; }

/* Hover states */
.hover\\:bg-blue-500:hover { background-color: #3b82f6; }
.hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
.hover\\:bg-slate-700:hover { background-color: #334155; }
.hover\\:bg-slate-800:hover { background-color: #1e293b; }
.hover\\:bg-slate-800\\/50:hover { background-color: rgba(30, 41, 59, 0.5); }
.hover\\:bg-slate-900\\/80:hover { background-color: rgba(15, 23, 42, 0.8); }
.hover\\:text-slate-200:hover { color: #e2e8f0; }
.hover\\:text-blue-300:hover { color: #93c5fd; }
.hover\\:border-blue-500\\/50:hover { border-color: rgba(59, 130, 246, 0.5); }
.hover\\:scale-110:hover { transform: scale(1.1); }

/* Group hover */
.group:hover .group-hover\\:opacity-100 { opacity: 1; }

/* Disabled */
.disabled\\:opacity-50:disabled { opacity: 0.5; }
.disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }

/* Background gradient */
.bg-gradient-navy {
  background: radial-gradient(ellipse at top, #1e293b, #0a192f, #061224);
}

/* Backdrop blur */
.backdrop-blur-sm { backdrop-filter: blur(4px); }

/* Animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin { animation: spin 1s linear infinite; }
`;

// Initialize the extension
const init = () => {
  // Check if already injected
  if (document.getElementById('promptstudio-root')) {
    return;
  }

  // Create container
  const container = document.createElement('div');
  container.id = 'promptstudio-root';
  document.body.appendChild(container);

  // Create Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  shadowRoot.appendChild(styleEl);

  // Create React mount point
  const appRoot = document.createElement('div');
  appRoot.id = 'promptstudio-app';
  shadowRoot.appendChild(appRoot);

  // Mount React
  ReactDOM.createRoot(appRoot).render(
    <React.StrictMode>
      <ContentApp />
    </React.StrictMode>
  );
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

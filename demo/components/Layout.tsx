
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <i className="fa-solid fa-bolt-lightning"></i>
            <span>GeminiApp</span>
          </div>
          <div className="flex gap-4">
            <button className="text-slate-500 hover:text-slate-900 transition-colors">Documentation</button>
            <button className="text-slate-500 hover:text-slate-900 transition-colors">Github</button>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
};

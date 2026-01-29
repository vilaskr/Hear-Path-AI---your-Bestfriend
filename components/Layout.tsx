import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeTab: 'chat' | 'mood' | 'journal';
  setActiveTab: (tab: 'chat' | 'mood' | 'journal') => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activeTab, setActiveTab, onLogout }) => {
  return (
    <div className="h-screen flex flex-col bg-transparent text-white overflow-hidden">
      {/* Unified Header */}
      <header className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-4 shrink-0 bg-transparent relative z-30">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl">
            <span className="text-xl">❤️</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none">HeartPath</h1>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Vilas K R Edition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onLogout}
            className="px-4 py-2 rounded-2xl bg-zinc-900/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all active:scale-95"
          >
            Logout
          </button>
          <div className="w-10 h-10 rounded-2xl bg-zinc-800/50 border border-white/10 flex items-center justify-center font-black text-zinc-500 text-xs">
            {user.email[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* Scrollable Main View */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative z-10">
        <div className={`max-w-3xl mx-auto px-6 pb-40 ${activeTab === 'chat' ? 'pt-0' : 'pt-6'}`}>
          {children}
        </div>
      </main>

      {/* Enhanced Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 ios-tab-bar z-50">
        <div className="max-w-md mx-auto flex justify-around items-center px-6 h-16">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'chat' ? 'text-white scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <svg className="w-6 h-6" fill={activeTab === 'chat' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Chat</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('mood')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'mood' ? 'text-white scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <svg className="w-6 h-6" fill={activeTab === 'mood' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Mood</span>
          </button>

          <button 
            onClick={() => setActiveTab('journal')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'journal' ? 'text-white scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <svg className="w-6 h-6" fill={activeTab === 'journal' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Reflect</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
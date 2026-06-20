import { useState } from 'react';
import { Gamepad2, Users, Settings, Send, MessageSquare, LogOut, Lock } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'tournaments' | 'admin';
  setView: (view: 'home' | 'tournaments' | 'admin') => void;
  isAdmin: boolean;
  onLogout: () => Promise<void>;
  whatsappLink?: string;
  telegramLink?: string;
}

export default function Navbar({
  currentView,
  setView,
  isAdmin,
  onLogout,
  whatsappLink = "https://wa.me/919999999999",
  telegramLink = "https://t.me/bgmi_tournaments"
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0f111a]/95 backdrop-blur-md border-b border-[#f4a61d]/20 sticky top-0 z-40" id="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setView('home')}
            id="nav-logo"
          >
            <div className="bg-[#f4a61d] p-2 rounded-xl shadow-[0_0_15px_rgba(244,166,29,0.3)] transition-transform duration-300 group-hover:scale-110">
              <Gamepad2 className="w-6 h-6 text-[#0f111a]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider text-white uppercase font-sans">
                BGMI <span className="text-[#f4a61d]">ARENA</span>
              </span>
              <p className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">Tournament Hub</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-8" id="desktop-nav-links">
            <button
              onClick={() => setView('home')}
              className={`text-sm font-medium tracking-wide transition-colors ${
                currentView === 'home' 
                  ? 'text-[#f4a61d] font-bold border-b-2 border-[#f4a61d] pb-1' 
                  : 'text-gray-300 hover:text-white'
              }`}
              id="btn-nav-home"
            >
              Home
            </button>
            <button
              onClick={() => setView('tournaments')}
              className={`text-sm font-medium tracking-wide transition-colors ${
                currentView === 'tournaments' 
                  ? 'text-[#f4a61d] font-bold border-b-2 border-[#f4a61d] pb-1' 
                  : 'text-gray-300 hover:text-white'
              }`}
              id="btn-nav-tournaments"
            >
              Battle List
            </button>
            
            {/* Social Buttons */}
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#25D366]/10 text-[#25D366] rounded-lg border border-[#25D366]/20 text-xs font-semibold hover:bg-[#25D366]/20 transition-all shadow-[0_0_10px_rgba(37,211,102,0.1)]"
              id="nav-whatsapp-btn"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Chat</span>
            </a>
            <a 
              href={telegramLink} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0088cc]/10 text-[#0088cc] rounded-lg border border-[#0088cc]/20 text-xs font-semibold hover:bg-[#0088cc]/20 transition-all shadow-[0_0_10px_rgba(0,136,204,0.1)]"
              id="nav-telegram-btn"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Group</span>
            </a>

            {/* Admin Buttons */}
            {isAdmin ? (
              <div className="flex items-center space-x-4 border-l border-gray-700 pl-4">
                <button
                  onClick={() => setView('admin')}
                  className={`flex items-center space-x-2 text-sm font-medium tracking-wide px-3 py-1.5 rounded-lg border border-[#f4a61d]/40 transition-colors ${
                    currentView === 'admin' 
                      ? 'bg-[#f4a61d]/15 text-[#f4a61d]' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  id="btn-nav-admin"
                >
                  <Settings className="w-4 h-4 text-[#f4a61d]" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Logout Admin"
                  id="btn-nav-logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView('admin')}
                className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-[#f4a61d]/50 px-3 py-1.5 rounded-lg transition-colors"
                id="btn-nav-admin-login"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={() => setView('admin')}
                className="p-2 text-[#f4a61d] bg-[#f4a61d]/10 rounded-lg"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none border border-gray-800"
              id="mobile-menu-toggle"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f111a] border-b border-[#f4a61d]/20 px-4 pt-2 pb-4 space-y-3" id="mobile-menu-container">
          <button
            onClick={() => { setView('home'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-3 py-2.5 rounded-xl text-base font-medium ${
              currentView === 'home' ? 'bg-[#f4a61d]/10 text-[#f4a61d]' : 'text-gray-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => { setView('tournaments'); setMobileMenuOpen(false); }}
            className={`block w-full text-left px-3 py-2.5 rounded-xl text-base font-medium ${
              currentView === 'tournaments' ? 'bg-[#f4a61d]/10 text-[#f4a61d]' : 'text-gray-300'
            }`}
          >
            Battle List
          </button>

          <hr className="border-gray-800" />

          {/* Social buttons in mobile */}
          <div className="grid grid-cols-2 gap-2">
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#25D366]/10 text-[#25D366] rounded-xl border border-[#25D366]/20 text-xs font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <a 
              href={telegramLink} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#0088cc]/10 text-[#0088cc] rounded-xl border border-[#0088cc]/20 text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>
          </div>

          {isAdmin ? (
            <div className="space-y-2">
              <button
                onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
                className="flex items-center justify-center space-x-2 w-full py-2.5 bg-[#f4a61d]/10 text-[#f4a61d] rounded-xl border border-[#f4a61d]/30 text-base font-medium"
              >
                <Settings className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="flex items-center justify-center space-x-2 w-full py-2.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-base font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Admin</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
              className="flex items-center justify-center space-x-2 w-full py-2.5 bg-gray-900 text-gray-300 rounded-xl border border-gray-800 text-base font-medium"
            >
              <Lock className="w-4 h-4 text-gray-400" />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

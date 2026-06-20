import { Gamepad2, Send, MessageSquare, Award, Users, ShieldAlert, Zap } from 'lucide-react';

interface HeroProps {
  setView: (view: 'home' | 'tournaments' | 'admin') => void;
  whatsappLink?: string;
  telegramLink?: string;
}

export default function Hero({
  setView,
  whatsappLink = "https://wa.me/919999999999",
  telegramLink = "https://t.me/bgmi_tournaments"
}: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-[#0a0b10] py-16 md:py-24 border-b border-[#f4a61d]/10" id="hero-section">
      {/* Background Visual Enhancers */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#f4a61d]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#f4a61d]/15 to-[#d27d00]/15 px-4 py-1.5 rounded-full border border-[#f4a61d]/30 mb-6 animate-pulse" id="hero-badge">
            <Zap className="w-4 h-4 text-[#f4a61d]" />
            <span className="text-xs font-bold text-[#f4a61d] tracking-wider uppercase font-sans">
              BGMI Esports Tournament Hub
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 uppercase" id="hero-title">
            REGISTER. BATTLE. <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f4a61d] via-[#ffd68a] to-[#f4a61d] drop-shadow-[0_2px_10px_rgba(244,166,29,0.2)]">
              CONQUER THE ARENA
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 mb-8 font-sans leading-relaxed" id="hero-description">
            Join India's premium BGMI tournament platform. Daily custom matches, squad challenges, free and paid listings, secure registrations, and automated prize distributions. Are you ready for the Chicken Dinner?
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" id="hero-cta-buttons">
            <button
              onClick={() => setView('tournaments')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#f4a61d] to-[#d27d00] text-[#0f111a] font-extrabold tracking-wider rounded-xl hover:shadow-[0_0_25px_rgba(244,166,29,0.4)] hover:scale-103 active:scale-98 transition-all duration-300 uppercase flex items-center justify-center space-x-2"
              id="get-started-btn"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Explore Tournaments</span>
            </button>
            
            <a
              href={telegramLink}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 border border-gray-800 text-white font-bold tracking-wide rounded-xl hover:border-sky-500 hover:text-sky-400 hover:bg-sky-500/5 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all duration-300 flex items-center justify-center space-x-2"
              id="hero-join-telegram"
            >
              <Send className="w-5 h-5 text-sky-400" />
              <span>Join Telegram Channel</span>
            </a>
          </div>

          {/* Performance Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto" id="hero-stats">
            <div className="bg-[#11131c] border border-gray-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-[#f4a61d]/40 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#f4a61d]"></div>
              <div className="text-gray-400 mb-1 text-xs uppercase tracking-widest font-mono">PRIZE POOLS</div>
              <div className="text-2xl font-black text-white font-sans tracking-wide">₹15,000+</div>
              <p className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center justify-center gap-1">
                <Award className="w-3 h-3" /> Paid Daily
              </p>
            </div>

            <div className="bg-[#11131c] border border-gray-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-[#25D366]/40 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#25D366]"></div>
              <div className="text-gray-400 mb-1 text-xs uppercase tracking-widest font-mono">WhatsApp Support</div>
              <div className="text-lg font-bold text-[#25D366] font-sans truncate">24x7 Helpdesk</div>
              <p className="text-[10px] text-gray-400 mt-1">Direct admin access</p>
            </div>

            <div className="bg-[#11131c] border border-gray-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-sky-500/40 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
              <div className="text-gray-400 mb-1 text-xs uppercase tracking-widest font-mono">Telegram Community</div>
              <div className="text-2xl font-black text-sky-400 font-sans">8.4K+</div>
              <p className="text-[10px] text-gray-400 mt-1">Real players waiting</p>
            </div>

            <div className="bg-[#11131c] border border-gray-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div className="text-gray-400 mb-1 text-xs uppercase tracking-widest font-mono">Anti-Cheat System</div>
              <div className="text-lg font-bold text-amber-500 font-sans flex items-center justify-center gap-1">
                <ShieldAlert className="w-4 h-4" /> Secure Lobby
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Manual ID Verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Tournament } from './types';

// Importing Custom Subcomponents
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TournamentCard from './components/TournamentCard';
import TournamentDetailsModal from './components/TournamentDetailsModal';
import AdminPanel from './components/AdminPanel';

// Icons
import { 
  Gamepad2, Search, Filter, MessageSquare, Send, 
  ChevronRight, Sparkles, SlidersHorizontal, Info, ShieldAlert
} from 'lucide-react';

// Seeding Default Tournaments if none exist, so the user experiences immediate gamified visuals
const seedDefaultTournaments = async () => {
  try {
    const colRef = collection(db, 'tournaments');
    const snap = await getDocs(colRef);
    
    if (snap.empty) {
      console.log("Seeding initial BGMI premium tournaments...");
      const mockTournaments: Omit<Tournament, 'id'>[] = [
        {
          title: "BGMI Underdog Showdown [SQUAD]",
          type: "Squad",
          map: "Erangel",
          prizePool: 15000,
          entryFee: 50,
          dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 5 days from now
          maxSlots: 100,
          joinedSlots: 45,
          status: "Upcoming",
          rules: [
            "All squad players must download and run BGMI on mobile devices only. No emulators or iPads.",
            "Match Custom Room ID & Password will be distributed precisely 15 minutes before the battle in our custom WhatsApp group.",
            "Hacks, scripts, teaming, or third-party modifications lead to instant disqualification and a lifetime ban.",
            "Top 3 rankers and highest killer must submit final screenshot of results to claim cash prize."
          ],
          whatsappLink: "https://chat.whatsapp.com/invite/bgmi_underdog_showdown",
          telegramLink: "https://t.me/bgmi_tournaments",
          createdAt: new Date().toISOString()
        },
        {
          title: "Miramar Ultimate Duo Duel",
          type: "Duo",
          map: "Miramar",
          prizePool: 8000,
          entryFee: 0, // Free
          dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 3 days from now
          maxSlots: 50,
          joinedSlots: 18,
          status: "Upcoming",
          rules: [
            "This is a Duo matchmaking lobby. Pre-registration of both players triggers verification.",
            "All participants must join our Discord & WhatsApp support channel.",
            "Spectating is disabled to prevent screen sniping stream cheating.",
            "No active hacks or teaming is permitted."
          ],
          whatsappLink: "https://chat.whatsapp.com/invite/bgmi_ultimate_duo",
          telegramLink: "https://t.me/bgmi_tournaments",
          createdAt: new Date().toISOString()
        },
        {
          title: "Sanhok Solo Quick Blitz",
          type: "Solo",
          map: "Sanhok",
          prizePool: 3000,
          entryFee: 20,
          dateTime: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // tomorrow
          maxSlots: 100,
          joinedSlots: 94, // Almost full
          status: "Upcoming",
          rules: [
            "This is a solo Erangel/Sanhok Blitz match. Fast-paced map circle speeds applies.",
            "Custom Room credentials will be sent to your registered WhatsApp number and on Telegram.",
            "No iPad, triggers or emulators. Mobile-only screen play is allowed.",
            "Decision of Admin remains final."
          ],
          whatsappLink: "https://chat.whatsapp.com/invite/sanhok_solo_blitz",
          telegramLink: "https://t.me/bgmi_tournaments",
          createdAt: new Date().toISOString()
        }
      ];

      for (const t of mockTournaments) {
        await addDoc(colRef, t);
      }
      console.log("Successfully seeded 3 tournaments on cloud firestore.");
    }
  } catch (err) {
    console.error("Failed seeding tournaments", err);
  }
};

export default function App() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setView] = useState<'home' | 'tournaments' | 'admin'>('home');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter and Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | 'Solo' | 'Duo' | 'Squad'>('All');
  const [selectedMapFilter, setSelectedMapFilter] = useState<'All' | 'Erangel' | 'Miramar' | 'Sanhok' | 'Vikendi' | 'Livik'>('All');

  // Fetch tournaments from Firestore
  const loadTournaments = async () => {
    setLoading(true);
    try {
      await seedDefaultTournaments(); // Seeds on first run
      
      const q = query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tournament[];
      
      setTournaments(list);
    } catch (err) {
      console.error("Error loading tournament lobby:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Listen for Auth states
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    // 2. Fetch Tournaments
    loadTournaments();

    return () => unsubscribe();
  }, []);

  const handleRegistrationDone = async (updatedNumSlots: number) => {
    // Refresh list data to show live slot counts
    await loadTournaments();
    
    // Optionally update local mock state if selected
    if (selectedTournament) {
      setSelectedTournament(prev => {
        if (!prev) return null;
        return {
          ...prev,
          joinedSlots: updatedNumSlots
        };
      });
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsAdmin(false);
      setView('home');
    } catch (err) {
      console.error("Logout issue: ", err);
    }
  };

  // Filter application
  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.map.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypeFilter === 'All' || t.type === selectedTypeFilter;
    const matchesMap = selectedMapFilter === 'All' || t.map === selectedMapFilter;
    
    return matchesSearch && matchesType && matchesMap;
  });

  return (
    <div className="min-h-screen bg-[#07080d] text-gray-100 flex flex-col font-sans selection:bg-[#f4a61d] selection:text-slate-900" id="main-application-container">
      {/* Navbar Section */}
      <Navbar 
        currentView={currentView} 
        setView={setView} 
        isAdmin={isAdmin} 
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <div className="space-y-12 pb-16">
            {/* Hero Banner Grid */}
            <Hero setView={setView} />

            {/* Featured Active Tournaments section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="featured-section">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#f4a61d]" />
                    Featured Active Tournaments
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Claim your slot before circles shrink.</p>
                </div>
                
                <button
                  onClick={() => setView('tournaments')}
                  className="text-xs font-bold text-[#f4a61d] uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>View All Listings</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#11131c]/50 rounded-3xl border border-gray-800">
                  <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-[#f4a61d] animate-spin"></div>
                  <p className="text-xs text-gray-500 mt-3 font-mono">Loading dynamic tournament database...</p>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="text-center py-16 bg-[#11131c]/50 rounded-3xl border border-gray-800 max-w-lg mx-auto">
                  <Info className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-bold uppercase">No Active Tournaments Found!</p>
                  <p className="text-xs text-gray-600 mt-1">Check back later or log as Admin to create new battle room schedules.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="featured-grid">
                  {tournaments.slice(0, 3).map((t) => (
                    <TournamentCard 
                      key={t.id} 
                      tournament={t} 
                      onSelect={(tour) => setSelectedTournament(tour)} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Support section info */}
            <div className="bg-[#11131c]/40 border-y border-gray-800 py-12" id="info-callout">
              <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Need Custom Room Assistance?</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Our live support desk operates 24/7. Once you register for any cash-prize matches, you'll join the private WhatsApp group. If you encounter credential bugs, name coordinate mismatch, or require custom host services, ping our command center instantly.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a 
                    href="https://wa.me/919999999999" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-[#0f111a] hover:bg-[#20ba59] active:scale-98 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Helpdesk</span>
                  </a>
                  <a 
                    href="https://t.me/bgmi_tournaments" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 text-white hover:bg-sky-600 active:scale-98 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Join Channel Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'tournaments' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" id="tournament-lobby-page">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Active Battle Lobby</h2>
              <p className="text-xs text-gray-400 mt-1">Daily Custom Matches listing. Choose your favorite map and team size.</p>
            </div>

            {/* Filter controls */}
            <div className="bg-[#11131c] border border-gray-800 p-5 rounded-2xl space-y-4" id="lobby-filters">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                {/* Search string */}
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by battle title, game maps (Erangel, Sanhok, Miramar)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#f4a61d]"
                  />
                </div>

                {/* Clear selectors */}
                <div className="flex flex-wrap gap-2">
                  {/* Map filter selector */}
                  <select
                    value={selectedMapFilter}
                    onChange={(e: any) => setSelectedMapFilter(e.target.value)}
                    className="bg-gray-950 border border-gray-800 text-gray-300 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    title="Map Selection"
                  >
                    <option value="All">All Maps</option>
                    <option value="Erangel">Erangel (Classic)</option>
                    <option value="Miramar">Miramar (Desert)</option>
                    <option value="Sanhok">Sanhok (Jungle)</option>
                    <option value="Vikendi">Vikendi (Snow)</option>
                    <option value="Livik">Livik (Mini)</option>
                  </select>
                </div>
              </div>

              {/* Mode Badges filters */}
              <div className="flex items-center gap-2 flex-wrap border-t border-gray-800/60 pt-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-500 font-mono flex items-center gap-1 mr-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  BATTLE SIZE:
                </span>
                
                {['All', 'Solo', 'Duo', 'Squad'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedTypeFilter(mode as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      selectedTypeFilter === mode 
                        ? 'bg-[#f4a61d] text-[#0f111a]' 
                        : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {mode} Matches
                  </button>
                ))}
              </div>
            </div>

            {/* List result container */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 select-none">
                <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-[#f4a61d] animate-spin"></div>
                <p className="text-xs text-gray-500 mt-3 font-mono">Updating battle list...</p>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="text-center py-20 bg-[#11131c]/30 rounded-3xl border border-gray-800 max-w-md mx-auto">
                <ShieldAlert className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-300 uppercase">No Matches match current criteria</p>
                <p className="text-xs text-gray-650 mt-1">Try resetting search filters or exploration options.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="battles-grid">
                {filteredTournaments.map((t) => (
                  <TournamentCard 
                    key={t.id} 
                    tournament={t} 
                    onSelect={(tour) => setSelectedTournament(tour)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'admin' && (
          <AdminPanel 
            tournaments={tournaments} 
            refreshData={loadTournaments} 
            isAdmin={isAdmin} 
            setIsAdmin={setIsAdmin} 
          />
        )}
      </main>

      {/* Details / Register pop-up context */}
      {selectedTournament && (
        <TournamentDetailsModal 
          tournament={selectedTournament} 
          onClose={() => setSelectedTournament(null)}
          onRegistrationSuccess={handleRegistrationDone}
        />
      )}

      {/* Primary Landing Footer */}
      <footer className="bg-[#0b0c10] border-t border-gray-800 py-8 text-center text-xs text-gray-500" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-extrabold uppercase tracking-widest text-[#f4a61d]">BGMI ARENA TOURNAMENT SERVICE</p>
          <p className="max-w-md mx-auto leading-relaxed">
            Battlegrounds Mobile India is a trademark of KRAFTON Inc. This platform provides custom matchmaking systems and holds no official affiliation with KRAFTON. Participate responsibly.
          </p>
          <p className="text-[10px] text-gray-600 font-mono pt-2">© 2026 BGMI Arena Inc. Powered by Firebase cloud storage & Auth engine.</p>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, 
  getDocs, query, where, writeBatch, increment 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { Tournament, PlayerRegistration } from '../types';
import { 
  Plus, Edit, Trash2, Users, Calendar, Award, 
  Map, DollarSign, Settings, ListPlus, Loader2, 
  Lock, KeyRound, Mail, AlertCircle, CheckCircle2, UserX 
} from 'lucide-react';

interface AdminPanelProps {
  tournaments: Tournament[];
  refreshData: () => Promise<void>;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export default function AdminPanel({ tournaments, refreshData, isAdmin, setIsAdmin }: AdminPanelProps) {
  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Tournament management states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Player viewer states
  const [selectedTournamentForPlayers, setSelectedTournamentForPlayers] = useState<string>('');
  const [registrations, setRegistrations] = useState<PlayerRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Solo' | 'Duo' | 'Squad'>('Squad');
  const [map, setMap] = useState<'Erangel' | 'Miramar' | 'Sanhok' | 'Vikendi' | 'Livik'>('Erangel');
  const [prizePool, setPrizePool] = useState<number>(5000);
  const [entryFee, setEntryFee] = useState<number>(0);
  const [dateTime, setDateTime] = useState('');
  const [maxSlots, setMaxSlots] = useState<number>(100);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [status, setStatus] = useState<'Upcoming' | 'Live' | 'Closed' | 'Completed'>('Upcoming');
  const [rules, setRules] = useState<string>('');

  // Fetch registrations when selected tournament changes
  useEffect(() => {
    if (selectedTournamentForPlayers) {
      loadRegistrationsForTournament(selectedTournamentForPlayers);
    } else if (tournaments.length > 0) {
      setSelectedTournamentForPlayers(tournaments[0].id);
    }
  }, [selectedTournamentForPlayers, tournaments]);

  const loadRegistrationsForTournament = async (tId: string) => {
    setLoadingRegistrations(true);
    try {
      const q = query(collection(db, 'registrations'), where('tournamentId', '==', tId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlayerRegistration[];
      setRegistrations(data);
    } catch (err) {
      console.error("Error loading tournament registrations:", err);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Auth Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    if (!email || !password) {
      setAuthError('Please fill in both email and password.');
      setAuthLoading(false);
      return;
    }

    try {
      if (authMode === 'login') {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        setIsAdmin(true);
        setAuthSuccess('Logged in successfully!');
        refreshData();
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        setIsAdmin(true);
        setAuthSuccess('Account created and logged in!');
        refreshData();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid credentials. Try "admin@bgmi.com" & "admin123" if setup.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already in use by another admin.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('The password must be at least 6 characters long.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please check network.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Populate form for editing
  const handleStartEdit = (t: Tournament) => {
    setEditingTournament(t);
    setTitle(t.title);
    setType(t.type);
    setMap(t.map);
    setPrizePool(t.prizePool);
    setEntryFee(t.entryFee);
    setDateTime(t.dateTime);
    setMaxSlots(t.maxSlots);
    setWhatsappLink(t.whatsappLink || '');
    setTelegramLink(t.telegramLink || '');
    setStatus(t.status);
    setRules(t.rules ? t.rules.join('\n') : '');
    setShowAddForm(true); // Re-uses form
  };

  const handleResetForm = () => {
    setEditingTournament(null);
    setTitle('');
    setType('Squad');
    setMap('Erangel');
    setPrizePool(5000);
    setEntryFee(0);
    setDateTime('');
    setMaxSlots(100);
    setWhatsappLink('');
    setTelegramLink('');
    setStatus('Upcoming');
    setRules('');
    setShowAddForm(false);
  };

  // Save or Update Tournament
  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!title.trim() || !dateTime) {
      alert('Please fill in all core details (Title, Schedule).');
      setSubmitting(false);
      return;
    }

    const rulesArray = rules
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const tournamentPayload = {
      title: title.trim(),
      type,
      map,
      prizePool: Number(prizePool),
      entryFee: Number(entryFee),
      dateTime,
      maxSlots: Number(maxSlots),
      rules: rulesArray,
      whatsappLink: whatsappLink.trim() || null,
      telegramLink: telegramLink.trim() || null,
      status,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingTournament) {
        // Edit Mode
        const docRef = doc(db, 'tournaments', editingTournament.id);
        await updateDoc(docRef, tournamentPayload);
      } else {
        // Add Mode
        const colRef = collection(db, 'tournaments');
        await addDoc(colRef, {
          ...tournamentPayload,
          joinedSlots: 0,
          createdAt: new Date().toISOString()
        });
      }
      handleResetForm();
      await refreshData();
    } catch (err: any) {
      alert('Failed to save tournament: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Tournament
  const handleDeleteTournament = async (tId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this tournament? This will permanent remove the match listing.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tournaments', tId));
      await refreshData();
      if (selectedTournamentForPlayers === tId) {
        setRegistrations([]);
        setSelectedTournamentForPlayers('');
      }
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  // Remove Registered Player/Team (Frees a slot!)
  const handleRemoveRegistration = async (regId: string, tourId: string) => {
    if (!window.confirm('Delete this registration? This will open up their slot counter.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'registrations', regId));
      
      // Decrement joinedSlots
      const docRef = doc(db, 'tournaments', tourId);
      await updateDoc(docRef, {
        joinedSlots: increment(-1)
      });

      // Reload
      await loadRegistrationsForTournament(tourId);
      await refreshData();
    } catch (err: any) {
      alert('Error removing registration: ' + err.message);
    }
  };

  // Log Out Admin
  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    setAuthSuccess(null);
  };

  // Render Login state first if not logged in
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12" id="admin-login-view">
        <div className="bg-[#11131c] border border-gray-800 p-8 rounded-3xl shadow-xl space-y-6">
          <div className="text-center">
            <div className="inline-flex p-3 bg-[#f4a61d]/10 text-[#f4a61d] rounded-2xl mb-4 border border-[#f4a61d]/20">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Admin Gate</h2>
            <p className="text-xs text-gray-400 mt-1">Authenticate to manage esports parameters.</p>
          </div>

          <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800/80">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${
                authMode === 'login' ? 'bg-[#f4a61d] text-[#0f111a]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${
                authMode === 'register' ? 'bg-[#f4a61d] text-[#0f111a]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="bg-rose-950/40 border border-rose-900/40 p-3 rounded-xl flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-950/40 p-3 rounded-xl flex items-start gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{authSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 font-mono">ADMIN EMAIL</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="admin@bgmi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-[#f4a61d]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 font-mono">GATEWAY PASSWORD</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-[#f4a61d]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#f4a61d] to-[#d27d00] text-[#0f111a] font-extrabold text-xs uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(244,166,29,0.3)] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring Authenticator...</span>
                </>
              ) : (
                <span>{authMode === 'login' ? 'Log In as Admin' : 'Deploy New Admin'}</span>
              )}
            </button>
          </form>

          {/* Quick Creds Tip */}
          <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800/50 text-[10px] text-gray-500">
            <p className="font-extrabold text-yellow-500 uppercase tracking-widest mb-1 font-mono">🧪 DEMO TESTING CORNER:</p>
            <p>If you have deployed rules, feel free to register a new admin or use email: <strong className="text-gray-300">admin@bgmi.com</strong> with pass: <strong className="text-gray-300">admin123</strong> to experience direct Firestore sync.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-dashboard">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#11131c] border border-gray-800/80 p-6 rounded-3xl">
        <div className="flex items-center space-x-3.5 text-center sm:text-left">
          <div className="p-3 bg-[#f4a61d]/15 text-[#f4a61d] rounded-2xl border border-[#f4a61d]/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white uppercase font-sans">Admin HQ</h2>
            <p className="text-xs text-[#f4a61d] font-semibold mt-0.5">Control Center • Active Firestore Database Sync</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 p-3.5 bg-gradient-to-r from-[#f4a61d] to-[#d27d00] text-[#0f111a] font-extrabold text-xs uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(244,166,29,0.3)] transition-all cursor-pointer"
            id="btn-admin-add-tournament"
          >
            <Plus className="w-4 h-4" />
            <span>Create Battle</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs uppercase tracking-wider border border-rose-500/25 rounded-xl transition-all cursor-pointer"
            id="btn-admin-logout"
          >
            Exit Access
          </button>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#11131c] border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="bg-[#181a26] border-b border-gray-800 p-5 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ListPlus className="w-4 h-4 text-[#f4a61d]" />
                {editingTournament ? 'Edit Tournament Specs' : 'Schedule New Tournament'}
              </h3>
              <button 
                onClick={handleResetForm}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveTournament} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-sans">
              {/* Row 1 */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">BATTLE TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BGMI PRO SHOWDOWN - STAGE-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#f4a61d]"
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">BATTLE TYPE *</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-[#f4a61d]"
                  >
                    <option value="Solo">Solo Match</option>
                    <option value="Duo">Duo Match</option>
                    <option value="Squad">Squad Match</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">MAP ARENA *</label>
                  <select
                    value={map}
                    onChange={(e: any) => setMap(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                  >
                    <option value="Erangel">Erangel (Classic)</option>
                    <option value="Miramar">Miramar (Desert)</option>
                    <option value="Sanhok">Sanhok (Jungle)</option>
                    <option value="Vikendi">Vikendi (Snow)</option>
                    <option value="Livik">Livik (Mini)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">STATUS *</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Live">Live Now</option>
                    <option value="Closed">Registration Closed</option>
                    <option value="Completed">Match Completed</option>
                  </select>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">PRIZE POOL (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={prizePool}
                    onChange={(e) => setPrizePool(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">ENTRY ENTRY FEE (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none font-mono"
                  />
                  <span className="text-[9px] text-gray-500 block mt-1">Set 0 for Free Match</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">MAX TEAMS/SLOTS *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={maxSlots}
                    onChange={(e) => setMaxSlots(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3 text-xs focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">SCHEDULE *</label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2 py-2.5 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">WhatsApp Group Link</label>
                  <input
                    type="url"
                    placeholder="https://chat.whatsapp.com/..."
                    value={whatsappLink}
                    onChange={(e) => setWhatsappLink(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3.5 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">Telegram Channel Link</label>
                  <input
                    type="url"
                    placeholder="https://t.me/..."
                    value={telegramLink}
                    onChange={(e) => setTelegramLink(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Rules List */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 font-mono">Rules & Guidelines (One per line)</label>
                <textarea
                  placeholder="Only mobile players permitted.&#10;No emulators/iPad.&#10;Hacks will be strictly penalised."
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#f4a61d] font-mono leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 bg-gray-950 text-gray-400 rounded-xl text-xs hover:text-white border border-gray-800 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#f4a61d] to-[#d27d00] text-[#0f111a] font-extrabold rounded-xl text-xs uppercase flex items-center justify-center gap-1 hover:shadow-[0_0_15px_rgba(244,166,29,0.3)] disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to cloud...</span>
                    </>
                  ) : (
                    <span>{editingTournament ? 'Save Changes' : 'Confirm & Deploy'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Playlists Management */}
        <div className="lg:col-span-12 space-y-4">
          <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-800 pb-2">
            <Settings className="w-4 h-4 text-[#f4a61d]" />
            Manage Active Battle Tournaments ({tournaments.length})
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-gray-800/80 bg-[#11131c]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#181a26] border-b border-gray-800 text-gray-400 font-mono">
                  <th className="p-4 uppercase tracking-wider text-[10px]">Title / Mode</th>
                  <th className="p-4 uppercase tracking-wider text-[10px]">Map</th>
                  <th className="p-4 uppercase tracking-wider text-[10px]">Prize Tree</th>
                  <th className="p-4 uppercase tracking-wider text-[10px]">Entry Fee</th>
                  <th className="p-4 uppercase tracking-wider text-[10px]">Slot occupancy</th>
                  <th className="p-4 uppercase tracking-wider text-[10px]">Lobby Status</th>
                  <th className="p-4 uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-sans">
                {tournaments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-12 text-gray-500 font-mono">
                      No matches configured. Use "Create Battle" to start.
                    </td>
                  </tr>
                ) : (
                  tournaments.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-950/40 transition-colors">
                      <td className="p-4">
                        <span className="font-extrabold text-white text-sm uppercase block truncate max-w-[200px]">{t.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-950 border border-gray-800 text-gray-400 rounded-md font-bold inline-block mt-1 font-mono uppercase">
                          {t.type}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-gray-300 font-bold">{t.map}</td>
                      <td className="p-4 font-semibold text-emerald-400">₹{t.prizePool}</td>
                      <td className="p-4 text-white">
                        {t.entryFee === 0 ? <span className="text-[#C5FF1A] font-bold">FREE</span> : `₹${t.entryFee}`}
                      </td>
                      <td className="p-4">
                        <span className="font-mono bg-[#161824] px-2 py-1 rounded-lg border border-gray-800 text-gray-300">
                          {t.joinedSlots} / {t.maxSlots}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          t.status === 'Live' ? 'bg-rose-600 text-white animate-pulse' :
                          t.status === 'Completed' ? 'bg-gray-800 text-gray-400' :
                          t.status === 'Closed' ? 'bg-rose-950 text-rose-300' :
                          'bg-[#f4a61d]/15 text-[#f4a61d] border border-[#f4a61d]/30'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStartEdit(t)}
                            className="p-2 bg-gray-950 border border-gray-800/80 hover:border-[#f4a61d]/30 hover:text-[#f4a61d] text-gray-300 rounded-xl transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTournament(t.id)}
                            className="p-2 bg-gray-950 border border-gray-800/80 hover:border-rose-500/30 hover:text-rose-500 text-gray-300 rounded-xl transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Player audit trail section */}
        <div className="lg:col-span-12 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-800 pb-2 gap-3">
            <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#f4a61d]" />
              Registrations List for Tournaments
            </h3>
            
            <div className="w-full sm:w-auto">
              <select
                value={selectedTournamentForPlayers}
                onChange={(e) => setSelectedTournamentForPlayers(e.target.value)}
                className="w-full sm:w-60 bg-[#11131c] border border-gray-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none"
              >
                <option value="">Select Tournament...</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-800/80 bg-[#11131c]" id="admin-registrations-table">
            {loadingRegistrations ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#f4a61d] animate-spin" />
                <p className="text-xs text-gray-500 font-mono mt-2">Loading registrations from cloud...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center p-16 text-gray-500 font-mono">
                No active registrations found for this match lobby.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="bg-[#181a26] border-b border-gray-800 text-gray-400 font-mono">
                    <th className="p-4 uppercase tracking-wider text-[10px]">Leader In-game name (IGN)</th>
                    <th className="p-4 uppercase tracking-wider text-[10px]">Character ID</th>
                    <th className="p-4 uppercase tracking-wider text-[10px]">WhatsApp Phone</th>
                    <th className="p-4 uppercase tracking-wider text-[10px]">Email Address</th>
                    <th className="p-4 uppercase tracking-wider text-[10px]">Team Info</th>
                    <th className="p-4 uppercase tracking-wider text-[10px] text-right">Lobby management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-950/30 transition-colors">
                      <td className="p-4 font-bold text-white text-emerald-400 font-mono select-all">{reg.ign}</td>
                      <td className="p-4 font-mono select-all tracking-wider text-white font-semibold">{reg.characterId}</td>
                      <td className="p-4 font-mono select-all text-[#25D366] font-semibold">{reg.phoneNumber}</td>
                      <td className="p-4 select-all">{reg.email}</td>
                      <td className="p-4">
                        {reg.teamName ? (
                          <div>
                            <span className="font-extrabold text-white text-xs block font-sans uppercase">{reg.teamName}</span>
                            <span className="text-[10px] text-gray-500 block truncate max-w-[200px]" title={reg.teammates?.join(', ')}>
                              TMs: {reg.teammates?.join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 font-mono text-[10px]">SOLO MODE</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRemoveRegistration(reg.id, reg.tournamentId)}
                          className="p-1.5 bg-rose-950/20 text-rose-500 border border-thin border-rose-900/40 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Remove player"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

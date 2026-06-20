import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Tournament, PlayerRegistration } from '../types';
import { 
  X, Calendar, Map, Users, Award, ShieldCheck, 
  MessageSquare, Send, Copy, CheckCircle2, UserCheck, Play 
} from 'lucide-react';
import RegistrationForm from './RegistrationForm';

interface TournamentDetailsModalProps {
  tournament: Tournament;
  onClose: () => void;
  onRegistrationSuccess: (updatedNumSlots: number) => void;
}

export default function TournamentDetailsModal({ 
  tournament, 
  onClose,
  onRegistrationSuccess 
}: TournamentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'players'>('info');
  const [showRegForm, setShowRegForm] = useState(false);
  const [registrations, setRegistrations] = useState<PlayerRegistration[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [successDetails, setSuccessDetails] = useState<PlayerRegistration | null>(null);

  // Fetch registered players for this tournament
  const fetchRegistrations = async () => {
    setLoadingPlayers(true);
    try {
      const q = query(collection(db, 'registrations'), where('tournamentId', '==', tournament.id));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlayerRegistration[];
      
      // Sort by registered date descending
      list.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
      setRegistrations(list);
    } catch (err) {
      console.error("Error fetching registrants:", err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [tournament.id, successDetails]);

  const handleRegSuccess = (regDetails: PlayerRegistration) => {
    setSuccessDetails(regDetails);
    setShowRegForm(false);
    
    // Notify parent to refresh list slot count representation
    onRegistrationSuccess(tournament.joinedSlots + 1);
  };

  const isFull = tournament.joinedSlots >= tournament.maxSlots;
  const isClosed = tournament.status === 'Closed' || tournament.status === 'Completed';

  // Format Date and Time
  const formatMatchDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" id="modal-container">
      <div 
        className="relative w-full max-w-2xl bg-[#0a0b10] border border-gray-800 rounded-3xl overflow-hidden shadow-[0_10px_50px_rgba(244,166,29,0.15)] my-8"
        id="modal-content"
      >
        {/* Header Cover Banner */}
        <div className="relative h-44 bg-gray-950 flex items-end p-6">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-cover bg-center" 
               style={{ 
                 backgroundImage: `linear-gradient(rgba(10,11,16,0.3), rgba(10,11,16,0.9)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800')`
               }} 
          />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-gray-400 hover:text-white rounded-full border border-gray-800 transition-all cursor-pointer z-35"
            id="btn-close-modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-20">
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-0.5 bg-[#f4a61d] text-[#0f111a] text-[10px] font-black uppercase tracking-wider rounded-md">
                {tournament.type} Battle
              </span>
              <span className="px-3 py-0.5 bg-gray-900 border border-gray-800 text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                <Map className="w-3 h-3 text-[#f4a61d]" />
                {tournament.map}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {tournament.title}
            </h2>
          </div>
        </div>

        {/* Option Tabs */}
        {!successDetails && (
          <div className="flex border-b border-gray-800/80 px-6 bg-[#0f111a]" id="modal-tabs">
            <button
              onClick={() => { setActiveTab('info'); setShowRegForm(false); }}
              className={`py-4 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'info' && !showRegForm
                  ? 'border-[#f4a61d] text-[#f4a61d]' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Battle Information
            </button>
            <button
              onClick={() => { setActiveTab('players'); setShowRegForm(false); }}
              className={`py-4 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'players' 
                  ? 'border-[#f4a61d] text-[#f4a61d]' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Players ({registrations.length})</span>
            </button>
          </div>
        )}

        {/* Scrollable Container */}
        <div className="p-6 max-h-[60vh] overflow-y-auto" id="modal-body-scroller">
          {/* Success View */}
          {successDetails ? (
            <div className="text-center py-6 space-y-6 animate-scale-up" id="registration-success-view">
              <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30 mb-2">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white uppercase">Slot Blocked Successfully!</h3>
                <p className="text-xs text-gray-400 mt-1">Ready for custom matches. ID & Password will be shared on WhatsApp group.</p>
              </div>

              {/* Ticket details */}
              <div className="bg-[#11131c] border border-gray-800 p-5 rounded-2xl max-w-md mx-auto text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1.5 bg-emerald-500/15 border-l border-b border-emerald-500/30 rounded-bl-xl text-emerald-400 text-[8px] font-black tracking-widest uppercase">
                  CONFIRMED
                </div>

                <p className="text-[10px] text-gray-500 font-mono tracking-wider mb-2">CONFIRMATION TICKET: {successDetails.id}</p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-sans">
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px] tracking-wider font-mono">TOURNAMENT</span>
                    <span className="font-bold text-white truncate max-w-[120px] block">{tournament.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px] tracking-wider font-mono">LEADER IGN</span>
                    <span className="font-bold text-white text-emerald-400 font-mono">{successDetails.ign}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px] tracking-wider font-mono">CHARACTER ID</span>
                    <span className="font-bold text-white font-mono tracking-wider">{successDetails.characterId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[9px] tracking-wider font-mono">MAP / MODE</span>
                    <span className="font-bold text-white">{tournament.map} ({tournament.type})</span>
                  </div>
                </div>
              </div>

              {/* Social Channels Call to actions */}
              <div className="pt-2 max-w-md mx-auto space-y-3">
                <p className="text-[11px] text-yellow-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  ⚠️ CRITICAL: JOIN GROUP FOR CUSTOM LOBBY INFO
                </p>
                
                {tournament.whatsappLink ? (
                  <a 
                    href={tournament.whatsappLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-slate-950 font-extrabold text-sm rounded-xl hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all uppercase"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Join WhatsApp Match Group</span>
                  </a>
                ) : (
                  <a 
                    href="https://wa.me/919999999999" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-slate-950 font-extrabold text-sm rounded-xl hover:shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all uppercase"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Contact WhatsApp Admin</span>
                  </a>
                )}
                
                {tournament.telegramLink && (
                  <a 
                    href={tournament.telegramLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-sky-600/10 text-sky-400 border border-sky-500/20 hover:bg-sky-600/20 text-xs font-bold rounded-xl transition-all uppercase"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Join Official Tournament Telegram</span>
                  </a>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#f4a61d] text-[#0f111a] rounded-xl text-xs font-bold uppercase"
                >
                  Done, Return to Lobby
                </button>
              </div>
            </div>
          ) : showRegForm ? (
            /* Registration Form */
            <RegistrationForm 
              tournament={tournament} 
              onSuccess={handleRegSuccess} 
              onCancel={() => setShowRegForm(false)} 
            />
          ) : activeTab === 'players' ? (
            /* Player Registered List */
            <div className="space-y-4" id="registered-players-list">
              <div className="flex justify-between items-center bg-gray-950/40 p-3 rounded-xl border border-gray-800/30">
                <span className="text-xs text-gray-400">Total Teams/Players Loaded:</span>
                <span className="font-mono text-sm text-[#f4a61d] font-bold">{registrations.length}</span>
              </div>

              {loadingPlayers ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#f4a61d] animate-spin"></div>
                  <p className="text-xs text-gray-500 mt-2 font-mono">Loading participants...</p>
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No registrations yet!</p>
                  <p className="text-xs text-gray-600 mt-1">Be the first to claim a spot in this battle.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="player-grid">
                  {registrations.map((reg) => (
                    <div 
                      key={reg.id} 
                      className="bg-[#11131c] border border-gray-800/80 p-3.5 rounded-xl flex items-center justify-between"
                    >
                      <div className="truncate max-w-[80%]">
                        <span className="text-[10px] text-gray-500 font-mono block">
                          {reg.teamName ? `TEAM: ${reg.teamName}` : 'SOLO PLAYER'}
                        </span>
                        <span className="font-bold text-white text-xs block font-sans truncate text-emerald-400">
                          {reg.ign}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono tracking-wider select-all block">
                          ID: {reg.characterId}
                        </span>
                      </div>
                      <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/25">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Main Info Tab */
            <div className="space-y-6" id="tournament-info-view">
              {/* Core Details Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#11131c] border border-gray-800 p-3 rounded-2xl text-center">
                  <span className="text-[9px] text-gray-500 block uppercase font-mono mb-1">TOTAL PRIZE</span>
                  <span className="text-sm font-black text-white block">₹{tournament.prizePool}</span>
                </div>
                <div className="bg-[#11131c] border border-gray-800 p-3 rounded-2xl text-center">
                  <span className="text-[9px] text-gray-500 block uppercase font-mono mb-1">ENTRY PASS</span>
                  <span className="text-sm font-black text-[#C5FF1A] block">
                    {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
                  </span>
                </div>
                <div className="bg-[#11131c] border border-gray-800 p-3 rounded-2xl text-center">
                  <span className="text-[9px] text-gray-500 block uppercase font-mono mb-1">SLOTS LEFT</span>
                  <span className="text-sm font-black text-rose-400 block">
                    {Math.max(tournament.maxSlots - tournament.joinedSlots, 0)} / {tournament.maxSlots}
                  </span>
                </div>
              </div>

              {/* Match Date & Time */}
              <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-800/30 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-500 block uppercase font-mono">BATTLE SCHEDULE</span>
                  <span className="text-sm text-gray-200 font-bold">{formatMatchDateTime(tournament.dateTime)}</span>
                </div>
                <Calendar className="w-5 h-5 text-[#f4a61d]" />
              </div>

              {/* Match Prize Tree Mock */}
              <div className="bg-[#11131c] border border-gray-800 p-4 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2.5 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-400" />
                  Prize Distribution Pool
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs font-sans">
                  <div className="bg-amber-500/5 border border-amber-500/20 p-2 rounded-xl text-center">
                    <span className="text-[8px] text-amber-500 font-mono block uppercase">1ST RANK</span>
                    <span className="font-extrabold text-white">50% POOL</span>
                  </div>
                  <div className="bg-gray-400/5 border border-thin border-gray-700 p-2 rounded-xl text-center">
                    <span className="text-[8px] text-gray-400 font-mono block uppercase">2ND RANK</span>
                    <span className="font-extrabold text-white">30% POOL</span>
                  </div>
                  <div className="bg-emerald-400/5 border border-thin border-emerald-500/20 p-2 rounded-xl text-center">
                    <span className="text-[8px] text-emerald-400 font-mono block uppercase">MOST KILLS</span>
                    <span className="font-extrabold text-white">20% POOL</span>
                  </div>
                </div>
              </div>

              {/* Rules & Guidelines */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#f4a61d]" />
                  Tournament Rules & Regulations
                </h4>
                <ul className="text-xs text-gray-400 space-y-2 list-none pl-1">
                  {tournament.rules && tournament.rules.length > 0 ? (
                    tournament.rules.map((rule, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{rule}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex gap-2 items-start">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Players using emulators, iPads, hacks, or cheats will be immediately banned and blacklisted.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Match Custom room ID & Password will be shared on WhatsApp group exactly 15 minutes before scheduled match.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Always make sure your BGMI In-game name and Character ID matches your registered ticket.</span>
                      </li>
                      <li className="flex gap-2 items-start">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>Screenshot of the final match results table is mandatory to claim cash prize distributions.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Action area */}
              <div className="pt-4 border-t border-gray-800">
                {isClosed ? (
                  <div className="text-center py-3 bg-gray-950 text-gray-500 rounded-xl border border-gray-800/80 text-xs font-black uppercase tracking-wider">
                    Registration Has Closed
                  </div>
                ) : isFull ? (
                  <div className="text-center py-3 bg-rose-950/40 text-rose-400 rounded-xl border border-rose-900/60 text-xs font-black uppercase tracking-wider">
                    Lobby is completely Full!
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRegForm(true)}
                    className="w-full py-4 bg-gradient-to-r from-[#f4a61d] to-[#d27d00] text-[#0f111a] font-extrabold text-xs tracking-wider uppercase rounded-xl hover:shadow-[0_0_20px_rgba(244,166,29,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1"
                    id="btn-register-match"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Open Registration Form</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

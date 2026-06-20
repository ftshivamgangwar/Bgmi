import React from 'react';
import { Calendar, DollarSign, Map, Users, Award, ShieldCheck, ChevronRight } from 'lucide-react';
import { Tournament } from '../types';

interface TournamentCardProps {
  key?: string;
  tournament: Tournament;
  onSelect: (tournament: Tournament) => void;
}

export default function TournamentCard({ tournament, onSelect }: TournamentCardProps) {
  const isFull = tournament.joinedSlots >= tournament.maxSlots;
  const isClosed = tournament.status === 'Closed' || tournament.status === 'Completed';
  
  // Calculate slot occupancy percentage
  const slotPercentage = Math.min((tournament.joinedSlots / tournament.maxSlots) * 100, 100);
  
  // Custom styling elements based on slot occupancy levels
  let progressColor = 'bg-emerald-500';
  let slotTextColor = 'text-emerald-400';
  if (slotPercentage >= 90) {
    progressColor = 'bg-rose-500';
    slotTextColor = 'text-rose-500 font-bold';
  } else if (slotPercentage >= 65) {
    progressColor = 'bg-amber-400';
    slotTextColor = 'text-amber-400';
  }

  // Type badge colors
  const typeBadgeStyles = {
    Solo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    Duo: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    Squad: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
  }[tournament.type] || 'bg-gray-500/10 text-gray-400 border border-gray-500/30';

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
    <div 
      className={`bg-[#11131c] border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group hover:-translate-y-1.5 flex flex-col h-full ${
        isClosed 
          ? 'border-gray-800/60 opacity-75' 
          : 'border-gray-800 hover:border-[#f4a61d]/40 hover:shadow-[0_4px_20px_rgba(244,166,29,0.15)]'
      }`}
      id={`tournament-card-${tournament.id}`}
    >
      {/* Top Banner (Map Graphic Representation) */}
      <div className="relative h-32 bg-gray-900 overflow-hidden select-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#11131c] via-transparent to-transparent z-10"></div>
        {/* Abstract Map Imagery or Gradient */}
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(15, 17, 26, 0.4), rgba(15, 17, 26, 0.85)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400')`
             }} 
        />
        
        {/* Upper Left Info Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-20">
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${typeBadgeStyles}`}>
            {tournament.type}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-black/60 text-gray-300 border border-gray-800 uppercase tracking-wider flex items-center gap-1">
            <Map className="w-2.5 h-2.5 text-[#f4a61d]" />
            {tournament.map}
          </span>
        </div>

        {/* Status indicator badge (Upper Right) */}
        <div className="absolute top-3 right-3 z-20" id={`status-badge-${tournament.id}`}>
          {tournament.status === 'Live' && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white uppercase tracking-widest animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
            </span>
          )}
          {tournament.status === 'Completed' && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-gray-800 text-gray-400 uppercase tracking-wider">
              COMPLETED
            </span>
          )}
          {tournament.status === 'Closed' && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-900 uppercase tracking-wider">
              CLOSED
            </span>
          )}
          {tournament.status === 'Upcoming' && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-[#f4a61d]/15 text-[#f4a61d] border border-[#f4a61d]/30 uppercase tracking-wider">
              UPCOMING
            </span>
          )}
        </div>

        {/* Title overlay in Map portion */}
        <div className="absolute bottom-3 left-4 right-4 z-20">
          <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-[#f4a61d] transition-colors truncate">
            {tournament.title}
          </h3>
        </div>
      </div>

      {/* Card Details Area */}
      <div className="p-4 flex-grow flex flex-col justify-between" id="card-content">
        {/* Core Financials Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#181a26] p-2.5 rounded-xl border border-gray-800/80">
            <p className="text-[9px] text-gray-400 font-mono tracking-wider uppercase mb-0.5">PRIZE POOL</p>
            <p className="text-base font-black text-white flex items-center gap-0.5">
              <span className="text-emerald-400">₹</span>{tournament.prizePool.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-[#181a26] p-2.5 rounded-xl border border-gray-800/80">
            <p className="text-[9px] text-gray-400 font-mono tracking-wider uppercase mb-0.5">ENTRY FEE</p>
            <p className="text-base font-black text-white">
              {tournament.entryFee === 0 ? (
                <span className="text-[#C5FF1A] uppercase tracking-wider text-xs">FREE</span>
              ) : (
                <span>₹{tournament.entryFee}</span>
              )}
            </p>
          </div>
        </div>

        {/* Clock/Date Indicator */}
        <div className="flex items-center space-x-2 text-xs text-gray-300 mb-4 bg-gray-950/40 p-2.5 rounded-xl border border-gray-800/30">
          <Calendar className="w-4 h-4 text-[#f4a61d] flex-shrink-0" />
          <span className="font-medium truncate">{formatMatchDateTime(tournament.dateTime)}</span>
        </div>

        {/* Dynamic Slots Section */}
        <div className="mb-5 bg-[#181a26] p-3 rounded-xl border border-gray-800/50">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              Slots Booked
            </span>
            <span className={`font-mono text-sm ${slotTextColor}`}>
              {tournament.joinedSlots} / {tournament.maxSlots}
            </span>
          </div>
          {/* Progress gauge */}
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${slotPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Footer Button trigger */}
        <button
          onClick={() => onSelect(tournament)}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1 transition-all ${
            isClosed
              ? 'bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed'
              : isFull
              ? 'bg-rose-950/40 text-rose-400 border border-rose-900/60 hover:bg-rose-950/60'
              : 'bg-[#f4a61d] text-[#0f111a] hover:bg-[#ffb433] hover:shadow-[0_0_15px_rgba(244,166,29,0.3)] active:scale-[0.98]'
          }`}
          id={`btn-card-action-${tournament.id}`}
        >
          {isClosed ? (
            <span>Registration Closed</span>
          ) : isFull ? (
            <span>Spectate / Details (Full)</span>
          ) : (
            <>
              <span>Join Tournament</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

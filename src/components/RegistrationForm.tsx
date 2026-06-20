import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment, getDocs, query, where } from 'firebase/firestore';
import { Tournament, PlayerRegistration } from '../types';
import { CheckCircle2, AlertCircle, Loader2, Send, Phone, User, Mail, ShieldAlert } from 'lucide-react';

interface RegistrationFormProps {
  tournament: Tournament;
  onSuccess: (regDetails: any) => void;
  onCancel: () => void;
}

export default function RegistrationForm({ tournament, onSuccess, onCancel }: RegistrationFormProps) {
  const [ign, setIgn] = useState('');
  const [characterId, setCharacterId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState('');
  
  // Teammates list based on Solo/Duo/Squad
  const [teammates, setTeammates] = useState<string[]>(
    tournament.type === 'Duo' ? [''] : tournament.type === 'Squad' ? ['', '', ''] : []
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTeammateChange = (index: number, value: string) => {
    const updated = [...teammates];
    updated[index] = value;
    setTeammates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Basic Validations
    if (!ign.trim() || !characterId.trim() || !phoneNumber.trim() || !email.trim()) {
      setErrorMessage('Please fill in all core player details.');
      setLoading(false);
      return;
    }

    if (characterId.length < 5 || isNaN(Number(characterId))) {
      setErrorMessage('Please enter a valid BGMI Character ID (numeric, typically 5-12 digits).');
      setLoading(false);
      return;
    }

    if (phoneNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for WhatsApp support.');
      setLoading(false);
      return;
    }

    if (tournament.type !== 'Solo' && !teamName.trim()) {
      setErrorMessage('Team Name is required for Duo or Squad battles.');
      setLoading(false);
      return;
    }

    // Verify empty teammate slots
    if (tournament.type !== 'Solo') {
      const emptyTeammates = teammates.some(t => !t.trim());
      if (emptyTeammates) {
        setErrorMessage(`Please fill in all teammate IGNs. This is a ${tournament.type} tournament.`);
        setLoading(false);
        return;
      }
    }

    try {
      // 1. Double check slot availability
      const q = query(collection(db, 'registrations'), where('tournamentId', '==', tournament.id));
      const snapshot = await getDocs(q);
      const currentRegCount = snapshot.size;

      if (currentRegCount >= tournament.maxSlots) {
        setErrorMessage('This battle is full! No spots left.');
        setLoading(false);
        return;
      }

      // 2. Check if this character ID is already registered for this tournament
      const dupCheck = query(
        collection(db, 'registrations'), 
        where('tournamentId', '==', tournament.id),
        where('characterId', '==', characterId.trim())
      );
      const dupSnapshot = await getDocs(dupCheck);
      if (!dupSnapshot.empty) {
        setErrorMessage('This Character ID is already registered for this tournament!');
        setLoading(false);
        return;
      }

      // 3. Create registration structure
      const newRegistration = {
        tournamentId: tournament.id,
        ign: ign.trim(),
        characterId: characterId.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        teamName: tournament.type !== 'Solo' ? teamName.trim() : null,
        teammates: tournament.type !== 'Solo' ? teammates : [],
        registeredAt: new Date().toISOString()
      };

      // 4. Save to Firestore
      const regRef = await addDoc(collection(db, 'registrations'), newRegistration);
      
      // 5. Increment slots in Tournament Document
      const tourRef = doc(db, 'tournaments', tournament.id);
      await updateDoc(tourRef, {
        joinedSlots: increment(1)
      });

      // 6. Complete flow
      onSuccess({
        id: regRef.id,
        ...newRegistration
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      setErrorMessage(err.message || 'Server error occurred during booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-[#0f111a] p-5 rounded-2xl border border-[#f4a61d]/10" id="player-reg-form">
      {/* Title */}
      <div className="border-b border-gray-800 pb-3 flex items-center gap-2">
        <Send className="w-5 h-5 text-[#f4a61d]" />
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Player Registration Form
        </h3>
      </div>

      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-900/60 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leader IGN */}
        <div>
          <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">
            Leader In-Game Name (IGN) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <User className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g. DynamicSoul"
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              className="w-full bg-[#161824] border border-gray-800 text-white rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-[#f4a61d]/60 focus:bg-gray-900/40 placeholder-gray-600 transition-colors"
            />
          </div>
        </div>

        {/* Character ID */}
        <div>
          <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">
            BGMI Character ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            pattern="[0-9]*"
            maxLength={12}
            placeholder="e.g. 5183920194"
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            className="w-full bg-[#161824] border border-gray-800 text-white rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-[#f4a61d]/60 focus:bg-gray-900/40 placeholder-gray-600 font-mono tracking-wider transition-colors"
          />
        </div>

        {/* Phone number */}
        <div>
          <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">
            WhatsApp Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 font-mono text-[10px] font-bold">
              +91
            </span>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="10-digit number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#161824] border border-gray-800 text-white rounded-xl py-2.5 pl-12 pr-4 text-xs focus:outline-none focus:border-[#f4a61d]/60 focus:bg-gray-900/40 placeholder-gray-600 font-mono tracking-wider transition-colors"
            />
          </div>
          <span className="text-[9px] text-gray-500 mt-1 block">Required to share custom match ID & password.</span>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-mono">
              <Mail className="w-3.5 h-3.5" />
            </span>
            <input
              type="email"
              required
              placeholder="e.g. player@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#161824] border border-gray-800 text-white rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-[#f4a61d]/60 focus:bg-gray-900/40 placeholder-gray-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Duo / Squad Fields */}
      {tournament.type !== 'Solo' && (
        <div className="border-t border-gray-800/80 pt-4 mt-4 space-y-4 animate-fade-in">
          <div>
            <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Soul Esports"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-[#161824] border border-gray-800 text-white rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-[#f4a61d]/60 focus:bg-gray-900/40 placeholder-gray-600 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <span className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">
              Teammate Details (In-game Name + Character ID) <span className="text-red-500">*</span>
            </span>
            
            <div className="space-y-2">
              {teammates.map((teammate, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-[10px] font-mono text-gray-500 w-8">
                    #{index + 2}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={`Teammate #${index + 2} IGN & ID`}
                    value={teammate}
                    onChange={(e) => handleTeammateChange(index, e.target.value)}
                    className="w-full bg-[#161824] border border-gray-800 text-white rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#f4a61d]/60 placeholder-gray-600 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Register buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-800/80">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-950 text-gray-400 rounded-xl text-xs hover:text-white border border-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-[#f4a61d] to-[#d27d00] text-[#0f111a] font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-1 hover:shadow-[0_0_15px_rgba(244,166,29,0.3)] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Confirm Registration</span>
          )}
        </button>
      </div>
    </form>
  );
}

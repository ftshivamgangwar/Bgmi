export interface Tournament {
  id: string;
  title: string;
  type: 'Solo' | 'Duo' | 'Squad';
  map: 'Erangel' | 'Miramar' | 'Sanhok' | 'Vikendi' | 'Livik';
  prizePool: number;
  entryFee: number;
  dateTime: string;
  maxSlots: number;
  joinedSlots: number;
  rules: string[];
  whatsappLink?: string;
  telegramLink?: string;
  status: 'Upcoming' | 'Live' | 'Closed' | 'Completed';
  createdAt: string;
}

export interface PlayerRegistration {
  id: string;
  tournamentId: string;
  ign: string;
  characterId: string;
  phoneNumber: string;
  email: string;
  teamName?: string;
  teammates?: string[]; // For Duo/Squad character IDs or IGNs
  registeredAt: string;
}

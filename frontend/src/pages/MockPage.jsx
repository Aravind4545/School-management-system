import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Trophy } from 'lucide-react';
import api from '../api/axios';

export default function MockPage() {
  const [access, setAccess] = useState({ unlocked: false, mock: null });

  useEffect(() => {
    api.get('/mock/access').then((r) => setAccess(r.data));
  }, []);

  if (!access.unlocked) {
    return (
      <div className="text-center py-20">
        <Lock className="mx-auto text-navy/30 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-navy">Mock Test Locked</h2>
        <p className="text-navy/60 mt-2 max-w-md mx-auto">
          Earn the <span className="text-gold font-bold">Gold badge</span> by scoring 16+ on the Hard quiz to unlock the full 160-question EAMCET mock test.
        </p>
        <Link to="/eamcet/quiz" className="inline-block mt-6 bg-navy text-gold px-6 py-3 rounded-xl font-semibold">
          Take Hard Quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center py-12">
      <Trophy className="mx-auto text-gold mb-4" size={56} />
      <h1 className="text-2xl font-bold text-navy mb-2">EAMCET Full Mock Test</h1>
      <p className="text-navy/60 mb-2">{access.mock?.title || 'Active Mock Test'}</p>
      <p className="text-sm text-navy/50 mb-8">160 Questions • 3 Hours • Fullscreen • Anti-cheat enabled</p>
      <p className="text-xs text-gold mb-6">Set {access.mock?.set_code} • Rotates every 3 days</p>
      <Link
        to="/eamcet/mock/exam"
        className="inline-block bg-navy text-gold px-10 py-4 rounded-2xl font-bold text-lg shadow-premium hover:scale-105 transition"
      >
        Start Mock Test
      </Link>
    </div>
  );
}

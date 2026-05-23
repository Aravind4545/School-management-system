import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, BookOpen, Brain, Trophy } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [badges, setBadges] = useState({ badges: [], hasGoldAccess: false });

  useEffect(() => {
    api.get('/quiz/badges').then((r) => setBadges(r.data)).catch(() => {});
  }, []);

  const cards = [
    { to: '/ipe/syllabus', icon: BookOpen, title: 'IPE Syllabus', color: 'bg-navy' },
    { to: '/eamcet/quiz', icon: Brain, title: 'EAMCET Quiz', color: 'bg-navy' },
    { to: '/eamcet/mock', icon: Trophy, title: 'Mock Test', color: badges.hasGoldAccess ? 'bg-gold text-navy' : 'bg-navy/50', locked: !badges.hasGoldAccess },
    { to: '/analytics', icon: Award, title: 'Analytics', color: 'bg-navy' },
  ];

  return (
    <div>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-navy mb-2">
        Dashboard
      </motion.h1>
      <p className="text-navy/60 mb-8">Hello {user?.name}, continue your preparation journey.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link
              to={c.locked ? '#' : c.to}
              className={`block ${c.color} text-white rounded-2xl p-6 shadow-premium hover:scale-105 transition ${c.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={(e) => c.locked && e.preventDefault()}
            >
              <c.icon className="text-gold mb-4" size={32} />
              <h3 className="font-bold text-lg">{c.title}</h3>
              {c.locked && <p className="text-xs mt-2 text-white/70">Earn Gold badge to unlock</p>}
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-navy/10 p-6">
        <h3 className="font-bold text-navy mb-4">Your Badges</h3>
        <div className="flex gap-4 flex-wrap">
          {['bronze', 'silver', 'gold'].map((b) => {
            const earned = badges.badges?.find((x) => x.badge_type === b);
            return (
              <div
                key={b}
                className={`px-6 py-4 rounded-xl border-2 ${earned ? 'border-gold bg-gold/10' : 'border-navy/10 opacity-40'}`}
              >
                <Award className={earned ? 'text-gold' : 'text-navy/30'} />
                <p className="font-semibold capitalize mt-2">{b}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

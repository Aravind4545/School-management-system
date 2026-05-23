import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Target, Flame } from 'lucide-react';

const levels = [
  { id: 'easy', title: 'Easy', desc: '25 Questions • 8+ correct for Bronze', icon: Zap, color: 'border-[#CD7F32]' },
  { id: 'intermediate', title: 'Intermediate', desc: '25 Questions • 12+ correct for Silver', icon: Target, color: 'border-[#C0C0C0]' },
  { id: 'hard', title: 'Hard', desc: '25 Questions • 16+ correct for Gold', icon: Flame, color: 'border-gold' },
];

export default function QuizLevels() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-2">EAMCET Quiz</h1>
      <p className="text-navy/60 mb-8">Choose your difficulty level. Earn badges to unlock the full mock test.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {levels.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link
              to={`/eamcet/quiz/${l.id}/exam`}
              className={`block bg-white rounded-2xl shadow-premium border-2 ${l.color} p-8 hover:scale-105 transition`}
            >
              <l.icon className="text-navy mb-4" size={40} />
              <h3 className="text-xl font-bold text-navy">{l.title}</h3>
              <p className="text-navy/60 text-sm mt-2">{l.desc}</p>
              <span className="inline-block mt-4 bg-navy text-gold px-4 py-2 rounded-xl text-sm font-semibold">Start Quiz</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Award, X } from 'lucide-react';

const BADGE_COLORS = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#D4AF37' };

export default function BadgeUnlockModal({ badge, onClose }) {
  if (!badge) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="bg-white rounded-3xl p-10 text-center shadow-premium max-w-md mx-4"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: BADGE_COLORS[badge] + '33', border: `4px solid ${BADGE_COLORS[badge]}` }}
        >
          <Award size={48} style={{ color: BADGE_COLORS[badge] }} />
        </motion.div>
        <h2 className="text-2xl font-bold text-navy mb-2">Badge Unlocked!</h2>
        <p className="text-3xl font-bold uppercase mb-4" style={{ color: BADGE_COLORS[badge] }}>{badge}</p>
        <p className="text-navy/70 mb-6">Congratulations on your achievement!</p>
        <button onClick={onClose} className="bg-navy text-gold px-8 py-3 rounded-xl font-semibold hover:opacity-90">
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}

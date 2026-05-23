import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock } from 'lucide-react';
import api from '../api/axios';

export default function ResultPage({ type = 'quiz' }) {
  const { attemptId, level } = useParams();
  const { state } = useLocation();
  const [result, setResult] = useState(state?.result);

  useEffect(() => {
    if (!result) {
      const ep = type === 'mock' ? `/mock/${attemptId}/result` : `/quiz/${attemptId}/result`;
      api.get(ep).then((r) => setResult(r.data));
    }
  }, [attemptId, result, type]);

  if (!result) return <div className="text-center py-20">Loading results...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-premium border border-navy/10 p-10 text-center">
        <Trophy className="mx-auto text-gold mb-4" size={56} />
        <h1 className="text-3xl font-bold text-navy mb-2">Score Card</h1>
        <p className="text-5xl font-bold text-gold my-6">{result.score} / {result.total}</p>
        <p className="text-navy/60">Accuracy: {result.accuracy}%</p>

        {result.rank && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-navy/5 rounded-xl p-4">
              <Target className="mx-auto text-navy mb-2" />
              <p className="font-bold">Rank #{result.rank.overall_rank}</p>
            </div>
            <div className="bg-navy/5 rounded-xl p-4">
              <Clock className="mx-auto text-navy mb-2" />
              <p className="font-bold">{result.rank.percentile}% Percentile</p>
            </div>
          </div>
        )}

        {type === 'mock' && result.sectionScores && (
          <div className="mt-8 text-left">
            <h3 className="font-bold mb-3">Subject-wise Analysis</h3>
            {Object.entries(result.sectionScores).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-navy/10 capitalize">
                <span>{k}</span><span className="font-semibold">{v} correct</span>
              </div>
            ))}
          </div>
        )}

        {result.badge && (
          <p className="mt-6 text-gold font-bold text-xl capitalize">🏅 {result.badge} Badge Earned!</p>
        )}

        <Link to="/dashboard" className="inline-block mt-8 bg-navy text-gold px-8 py-3 rounded-xl font-semibold">
          Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../api/axios';

export default function AnalyticsPage() {
  const [weekly, setWeekly] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get('/analytics/weekly').then((r) => setWeekly(r.data));
    api.get('/analytics/leaderboard?type=mock').then((r) => setLeaderboard(r.data));
    api.get('/analytics/my-results').then((r) => setResults(r.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-8">Performance Analytics</h1>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-premium border border-navy/10 p-6">
          <h3 className="font-bold text-navy mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weekly}>
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgAccuracy" stroke="#D4AF37" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-premium border border-navy/10 p-6">
          <h3 className="font-bold text-navy mb-4">Recent Accuracy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={results.slice(0, 8).map((r, i) => ({ name: `#${i + 1}`, accuracy: parseFloat(r.accuracy) }))}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#0F172A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-navy/10 p-6">
        <h3 className="font-bold text-navy mb-4">Topper Leaderboard</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-navy/60 text-sm border-b">
              <th className="pb-3">Rank</th><th>Name</th><th>PIN</th><th>Score</th><th>Percentile</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, i) => (
              <tr key={i} className="border-b border-navy/5">
                <td className="py-3 font-bold text-gold">#{row.overall_rank}</td>
                <td>{row.name}</td>
                <td>{row.pin}</td>
                <td>{row.total_marks}</td>
                <td>{row.percentile}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

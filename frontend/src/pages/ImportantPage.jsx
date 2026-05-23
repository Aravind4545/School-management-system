import { useEffect, useState } from 'react';
import api from '../api/axios';

const typeLabels = { repeated: 'Frequently Repeated', concept: 'Important Concepts', bit: 'Chapter-wise Bits' };

export default function ImportantPage() {
  const [bits, setBits] = useState([]);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    api.get('/content/important', { params: subject ? { subject } : {} }).then((r) => setBits(r.data));
  }, [subject]);

  const subjects = [...new Set(bits.map((b) => b.subject))];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Important Questions</h1>
      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mb-6 border rounded-xl px-4 py-2">
        <option value="">All Subjects</option>
        {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="grid gap-4">
        {bits.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl shadow-premium border border-navy/10 p-6">
            <span className="text-xs font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full">{typeLabels[b.content_type]}</span>
            <h3 className="font-bold text-navy mt-3">{b.title}</h3>
            <p className="text-sm text-navy/50">{b.subject} • {b.chapter}</p>
            <p className="text-navy/80 mt-2">{b.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

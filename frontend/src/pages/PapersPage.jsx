import { useEffect, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import api from '../api/axios';
import PdfViewer from '../components/PdfViewer';

export default function PapersPage({ module, category, title, showYearFilter }) {
  const [papers, setPapers] = useState([]);
  const [year, setYear] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    const params = { module, category };
    if (year) params.year = year;
    api.get('/content/papers', { params }).then((r) => setPapers(r.data));
  }, [module, category, year]);

  const years = [...new Set(papers.map((p) => p.year).filter(Boolean))].sort((a, b) => b - a);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">{title}</h1>
      {showYearFilter && (
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="mb-6 border border-navy/20 rounded-xl px-4 py-2"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      )}
      <div className="grid gap-4">
        {papers.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-premium border border-navy/10 p-5 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-navy">{p.title}</h3>
              <p className="text-sm text-navy/50">{p.subject} {p.year && `• ${p.year}`}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewing(p)} className="flex items-center gap-1 bg-navy text-gold px-4 py-2 rounded-xl text-sm">
                <Eye size={16} /> View
              </button>
              <a href={p.file_path} download className="flex items-center gap-1 border border-navy text-navy px-4 py-2 rounded-xl text-sm hover:bg-navy/5">
                <Download size={16} /> Download
              </a>
            </div>
          </div>
        ))}
      </div>
      {viewing && (
        <div className="fixed inset-0 z-50 bg-navy/50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <PdfViewer url={viewing.file_path} title={viewing.title} />
            <button onClick={() => setViewing(null)} className="mt-4 bg-white text-navy px-6 py-2 rounded-xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

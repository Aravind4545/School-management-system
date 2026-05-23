import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/analytics').then((r) => setAnalytics(r.data));
    api.get('/admin/students').then((r) => setStudents(r.data));
  }, []);

  const createStudent = async () => {
    const pin = prompt('Enter new PIN (e.g. STU004):');
    const name = prompt('Student name:');
    if (!pin || !name) return;
    await api.post('/admin/students', { pin, name, college: 'AP College' });
    const { data } = await api.get('/admin/students');
    setStudents(data);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-navy text-white px-8 py-4 flex justify-between">
        <h1 className="font-bold text-gold">Admin Panel</h1>
        <button onClick={() => { logout(); navigate('/admin/login'); }} className="text-sm hover:text-gold">Logout</button>
      </nav>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Students', value: analytics?.totalStudents },
            { label: 'Quiz Attempts', value: analytics?.quizAttempts },
            { label: 'Mock Attempts', value: analytics?.mockAttempts },
            { label: 'Badges', value: analytics?.badges?.length },
          ].map((s) => (
            <div key={s.label} className="bg-navy text-white rounded-2xl p-6">
              <p className="text-white/60 text-sm">{s.label}</p>
              <p className="text-3xl font-bold text-gold">{s.value ?? '—'}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <button onClick={createStudent} className="bg-navy text-gold px-4 py-2 rounded-xl font-semibold">+ Add Student</button>
          <button onClick={() => api.post('/admin/mock/schedule')} className="border border-navy text-navy px-4 py-2 rounded-xl">Rotate Mock Sets</button>
          <Link to="/" className="border border-navy/30 px-4 py-2 rounded-xl text-navy/70">View Site</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-premium border border-navy/10 p-6">
          <h3 className="font-bold text-navy mb-4">Students</h3>
          <table className="w-full text-sm">
            <thead><tr className="text-navy/60 border-b"><th className="text-left py-2">PIN</th><th>Name</th><th>College</th><th>Status</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-navy/5">
                  <td className="py-2 font-mono">{s.pin}</td>
                  <td>{s.name}</td>
                  <td>{s.college}</td>
                  <td>{s.is_active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

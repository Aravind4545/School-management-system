import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, true);
      navigate('/admin');
    } catch {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-10 w-full max-w-md shadow-premium">
        <h1 className="text-2xl font-bold text-navy mb-6">Admin Login</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-xl px-4 py-3 mb-4" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-xl px-4 py-3 mb-4" required />
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <button type="submit" className="w-full bg-navy text-gold py-3 rounded-xl font-semibold">Login</button>
      </form>
    </div>
  );
}

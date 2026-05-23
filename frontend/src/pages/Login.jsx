import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(pin, password);
      if (data.user.mustChangePassword) navigate('/change-password');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-premium p-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <GraduationCap className="mx-auto text-gold mb-4" size={48} />
          <h1 className="text-2xl font-bold text-navy">Student Login</h1>
          <p className="text-navy/60 text-sm mt-1">AP Inter & EAMCET Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Student PIN</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border border-navy/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold outline-none"
              placeholder="e.g. STU001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-navy/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-gold outline-none"
              placeholder="First login: same as PIN"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-gold py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-navy/50 mt-6">
          <Link to="/" className="hover:text-gold">← Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}

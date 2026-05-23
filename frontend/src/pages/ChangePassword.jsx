import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) return setError('Passwords do not match');
    if (newPassword.length < 6) return setError('Minimum 6 characters');
    try {
      await api.post('/auth/change-password', { newPassword });
      updateUser({ ...JSON.parse(localStorage.getItem('user')), mustChangePassword: false });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-4">
      <div className="bg-white rounded-3xl shadow-premium p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-navy mb-2">Change Password</h1>
        <p className="text-navy/60 text-sm mb-6">Required on first login for security.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-navy text-gold py-3 rounded-xl font-semibold">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

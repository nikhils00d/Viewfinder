import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const url = `http://localhost:5000${endpoint}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin) {
        setMessage('Logged in successfully!');
        // In Step 7, we will redirect to a dashboard based on the user's role
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage(data.message); // "Registration successful. Waiting for admin approval."
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0A0A0A] p-8 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white font-['DM_Mono',_monospace]"
          style={{ fontFamily: '"DM Mono", monospace' }}
        >
          [ CLOSE ]
        </button>

        <h2
          className="text-3xl italic"
          style={{ fontFamily: '"Playfair Display", serif', marginBottom: '20px' }}
        >
          {isLogin ? 'Access Portal' : 'Request Access'}
        </h2>

        {error && <div className="text-[#E8202A] text-sm mb-4" style={{ fontFamily: '"DM Mono", monospace' }}>{error}</div>}
        {message && <div className="text-green-500 text-sm mb-4" style={{ fontFamily: '"DM Mono", monospace' }}>{message}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" style={{ fontFamily: '"Inter", sans-serif' }}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className="bg-transparent border border-white/20 p-3 outline-none focus:border-white transition-colors"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="bg-transparent border border-white/20 p-3 outline-none focus:border-white transition-colors"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="College Email"
            className="bg-transparent border border-white/20 p-3 outline-none focus:border-white transition-colors"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent border border-white/20 p-3 outline-none focus:border-white transition-colors"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <button
            type="submit"
            className="mt-4 border border-[#E8202A] bg-[#E8202A]/10 hover:bg-[#E8202A]/20 text-[#E8202A] p-3 tracking-widest uppercase transition-colors"
            style={{ fontFamily: '"DM Mono", monospace' }}
          >
            {isLogin ? 'Authenticate' : 'Submit Request'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50" style={{ fontFamily: '"DM Mono", monospace' }}>
          {isLogin ? "Don't have access? " : "Already registered? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-white hover:underline">
            {isLogin ? 'Join Here' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

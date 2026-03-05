import React, { useState } from 'react';
import { UserRole } from '../types';
import { LogIn, Key, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, houseId?: string, token?: string) => void;
  houses: any[];
}

const API_URL = import.meta.env?.VITE_API_URL || 'https://thcontrol.es';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas');
        return;
      }

      const role = data.rol === 'admin' ? UserRole.ADMIN : UserRole.RESIDENT;
      onLogin(role, data.casa_numero, data.token);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-yellow-500">
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
            T
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">TH Control</h1>
        <p className="text-center text-slate-600 mb-8">Sistema de Gestión de Condominio</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700 flex items-center gap-2">
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700 flex items-center gap-2">
              <Key size={16} /> Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg disabled:opacity-50"
          >
            <LogIn size={24} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-slate-500">
            ©℗ 2026 Powered by <span className="text-yellow-500 font-bold">Pastorelli</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

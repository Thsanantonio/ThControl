import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface PerfilProps {
  token: string;
  apiUrl: string;
}

const Perfil: React.FC<PerfilProps> = ({ token, apiUrl }) => {
  const [perfil, setPerfil] = useState<any>(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/perfil/mi-perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setPerfil(data));
  }, [token, apiUrl]);

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    if (nuevaPassword !== confirmarPassword) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden' });
      return;
    }
    if (nuevaPassword.length < 6) {
      setMensaje({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/perfil/cambiar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nueva_password: nuevaPassword })
      });
      const data = await res.json();
      if (data.success) {
        setMensaje({ tipo: 'ok', texto: '¡Contraseña cambiada exitosamente!' });
        setNuevaPassword('');
        setConfirmarPassword('');
      } else {
        setMensaje({ tipo: 'error', texto: data.error || 'Error al cambiar contraseña' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  if (!perfil) return (
    <div className="p-4 md:p-8 flex items-center justify-center">
      <p className="text-slate-500">Cargando perfil...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Mi Perfil</h1>

      <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-yellow-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{perfil.nombre}</h2>
            <p className="text-slate-500">{perfil.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-300">
            <p className="text-xs text-slate-500 mb-1">Casa</p>
            <p className="font-bold text-lg text-slate-800">{perfil.casa_numero}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-300">
            <p className="text-xs text-slate-500 mb-1">Rol</p>
            <p className="font-bold text-lg text-slate-800 capitalize">{perfil.rol}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Lock size={20} /> Cambiar Contraseña
        </h2>

        {mensaje && (
          <div className={`rounded-xl p-4 mb-4 flex items-center gap-2 font-bold ${mensaje.tipo === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensaje.tipo === 'ok' && <CheckCircle size={18} />}
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleCambiarPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700">Nueva Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                className="w-full p-3 pr-12 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700">Confirmar Contraseña *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
              placeholder="Repite la contraseña"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-all"
          >
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Perfil;

import React, { useState } from 'react';
import { UserRole, House } from '../types';
import { ADMIN_KEYS, RESIDENT_KEY } from '../constants';
import { LogIn, Key, Home } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, houseId?: string) => void;
  houses: House[];
}

const Login: React.FC<LoginProps> = ({ onLogin, houses }) => {
  const [role, setRole] = useState<UserRole>(UserRole.RESIDENT);
  const [condoKey, setCondoKey] = useState('');
  const [houseId, setHouseId] = useState('');
  const [selectedStreet, setSelectedStreet] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === UserRole.ADMIN) {
      if (!ADMIN_KEYS.includes(condoKey)) {
        alert('Clave de administrador incorrecta');
        return;
      }
    } else {
      if (condoKey !== RESIDENT_KEY) {
        alert('Clave de residente incorrecta');
        return;
      }
      if (!houseId) {
        alert('Por favor selecciona tu casa');
        return;
      }
    }

    onLogin(role, houseId || undefined);
  };

  const filteredHouses = selectedStreet 
    ? houses.filter(h => h.street === selectedStreet)
    : houses;

  const streets = ['Calle A', 'Calle B', 'Calle C', 'Calle P'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 flex items-center justify-center p-4">
      <div className="bg-gray-200 rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-yellow-600">
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg">
            T
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">TH Control</h1>
        <p className="text-center text-slate-600 mb-8">Sistema de Gestión de Condominio</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700">Tipo de Usuario</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(UserRole.ADMIN)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  role === UserRole.ADMIN
                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-gray-300 text-slate-600 hover:bg-gray-400'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.RESIDENT)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  role === UserRole.RESIDENT
                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-gray-300 text-slate-600 hover:bg-gray-400'
                }`}
              >
                Residente
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700 flex items-center gap-2">
              <Key size={16} /> Clave
            </label>
            <input
              type="password"
              value={condoKey}
              onChange={(e) => setCondoKey(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
              placeholder="Ingresa tu clave"
              autoComplete="off"
            />
          </div>

          {role === UserRole.RESIDENT && (
            <>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Calle</label>
                <select
                  value={selectedStreet}
                  onChange={(e) => {
                    setSelectedStreet(e.target.value);
                    setHouseId('');
                  }}
                  className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                >
                  <option value="">Selecciona tu calle</option>
                  {streets.map(street => (
                    <option key={street} value={street}>{street}</option>
                  ))}
                </select>
              </div>

              {selectedStreet && (
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700 flex items-center gap-2">
                    <Home size={16} /> Tu Casa
                  </label>
                  <select
                    value={houseId}
                    onChange={(e) => setHouseId(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                  >
                    <option value="">Selecciona tu casa</option>
                    {filteredHouses.map(house => (
                      <option key={house.id} value={house.id}>
                        {house.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
          >
            <LogIn size={24} />
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
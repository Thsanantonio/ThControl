import React, { useState } from 'react';
import { AppState, Suggestion, UserRole } from '../types';
import { MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface SuggestionsProps {
  state: AppState;
  onAddSuggestion: (suggestion: Suggestion) => void;
  onUpdateStatus: (id: string, status: 'pending' | 'reviewed' | 'resolved') => void;
}

const Suggestions: React.FC<SuggestionsProps> = ({ state, onAddSuggestion, onUpdateStatus }) => {
  const [message, setMessage] = useState('');
  const isAdmin = state.user?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      alert('Por favor escribe un mensaje');
      return;
    }

    if (!state.user?.houseId && !isAdmin) {
      alert('Error: No se pudo identificar tu casa');
      return;
    }

    // Capturar IP del usuario
    let ipAddress = '';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      ipAddress = ipData.ip;
    } catch (error) {
      console.error('No se pudo obtener la IP:', error);
    }

    const suggestion: Suggestion = {
      id: Date.now().toString(),
      houseId: state.user?.houseId || 'admin',
      message: message.trim(),
      date: new Date().toISOString(),
      status: 'pending',
      ipAddress
    };

    onAddSuggestion(suggestion);
    setMessage('');
  };

  const filteredSuggestions = isAdmin
    ? state.suggestions
    : state.suggestions.filter(s => s.houseId === state.user?.houseId);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Buzón de Sugerencias</h1>

      {!isAdmin && (
        <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Nueva Sugerencia</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Tu Casa</label>
              <input
                type="text"
                value={state.houses.find(h => h.id === state.user?.houseId)?.name || ''}
                className="w-full p-4 rounded-xl border-2 border-gray-300 bg-gray-100 text-slate-600 font-bold"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Tu Mensaje</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white min-h-[120px]"
                placeholder="Escribe aquí tu sugerencia, comentario o reporte..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
            >
              Enviar Sugerencia
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredSuggestions.length === 0 ? (
          <div className="bg-gray-200 rounded-2xl p-12 text-center border-2 border-gray-300">
            <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500">No hay sugerencias registradas</p>
          </div>
        ) : (
          filteredSuggestions.map(suggestion => {
            const house = state.houses.find(h => h.id === suggestion.houseId);
            
            return (
              <div key={suggestion.id} className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-500 w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {house ? house.name : 'Administrador'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <Clock size={14} />
                        {new Date(suggestion.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {isAdmin && suggestion.ipAddress && (
                        <p className="text-xs text-slate-500 mt-1">IP: {suggestion.ipAddress}</p>
                      )}
                    </div>
                  </div>
                  
                  <StatusBadge status={suggestion.status} />
                </div>

                <p className="text-slate-700 leading-relaxed mb-4 ml-15">{suggestion.message}</p>

                {isAdmin && (
                  <div className="flex gap-2 ml-15 flex-wrap">
                    {suggestion.status !== 'reviewed' && (
                      <button
                        onClick={() => onUpdateStatus(suggestion.id, 'reviewed')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all"
                      >
                        Marcar como Revisado
                      </button>
                    )}
                    {suggestion.status !== 'resolved' && (
                      <button
                        onClick={() => onUpdateStatus(suggestion.id, 'resolved')}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-all"
                      >
                        Marcar como Resuelto
                      </button>
                    )}
                    {suggestion.status !== 'pending' && (
                      <button
                        onClick={() => onUpdateStatus(suggestion.id, 'pending')}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg text-sm font-bold transition-all"
                      >
                        Marcar como Pendiente
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: 'pending' | 'reviewed' | 'resolved' }> = ({ status }) => {
  const config = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: <Clock size={14} />, label: 'Pendiente' },
    reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <CheckCircle size={14} />, label: 'Revisado' },
    resolved: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: <CheckCircle size={14} />, label: 'Resuelto' }
  };

  const { bg, text, icon, label } = config[status];

  return (
    <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2`}>
      {icon}
      {label}
    </span>
  );
};

export default Suggestions;
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, Clock, Eye } from 'lucide-react';

interface SuggestionsProps {
  token: string;
  apiUrl: string;
  isAdmin: boolean;
}

const Suggestions: React.FC<SuggestionsProps> = ({ token, apiUrl, isAdmin }) => {
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [respuesta, setRespuesta] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    cargarSugerencias();
  }, []);

  const cargarSugerencias = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/sugerencias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSugerencias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const enviarSugerencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/sugerencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mensaje })
      });
      const data = await res.json();
      if (data.sugerencia) {
        setSugerencias(s => [data.sugerencia, ...s]);
        setMensaje('');
        setEnviado(true);
        setTimeout(() => setEnviado(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const responderSugerencia = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/sugerencias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: 'respondido', respuesta: respuesta[id] || '' })
      });
      const data = await res.json();
      if (data.sugerencia) {
        setSugerencias(s => s.map(sg => sg.id === id ? data.sugerencia : sg));
        setRespuesta(r => ({ ...r, [id]: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const marcarLeido = async (id: string) => {
    try {
      await fetch(`${apiUrl}/api/sugerencias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: 'leido' })
      });
      setSugerencias(s => s.map(sg => sg.id === id ? { ...sg, estado: 'leido' } : sg));
    } catch (err) {
      console.error(err);
    }
  };

  const getEstadoColor = (estado: string) => {
    if (estado === 'respondido') return 'bg-green-100 text-green-700';
    if (estado === 'leido') return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getEstadoLabel = (estado: string) => {
    if (estado === 'respondido') return 'Respondido';
    if (estado === 'leido') return 'Leído';
    return 'Pendiente';
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Buzón de Sugerencias</h1>

      {!isAdmin && (
        <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare size={20} /> Enviar Sugerencia
          </h2>
          {enviado && (
            <div className="bg-green-100 text-green-700 rounded-xl p-4 mb-4 flex items-center gap-2 font-bold">
              <CheckCircle size={18} /> ¡Sugerencia enviada correctamente!
            </div>
          )}
          <form onSubmit={enviarSugerencia} className="space-y-4">
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white min-h-[120px] resize-none"
              placeholder="Escribe tu sugerencia o comentario aquí..."
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Send size={18} /> {loading ? 'Enviando...' : 'Enviar Sugerencia'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          {isAdmin ? 'Todas las Sugerencias' : 'Mis Sugerencias'}
        </h2>
        {sugerencias.length === 0 ? (
          <div className="bg-gray-200 rounded-2xl p-12 text-center border-2 border-gray-300">
            <p className="text-slate-500">No hay sugerencias aún</p>
          </div>
        ) : (
          sugerencias.map((sug: any) => (
            <div key={sug.id} className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  {isAdmin && (
                    <p className="font-bold text-slate-800">{sug.perfiles?.nombre} — {sug.perfiles?.casa_numero}</p>
                  )}
                  <p className="text-xs text-slate-500">{new Date(sug.created_at).toLocaleDateString('es-ES')}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getEstadoColor(sug.estado)}`}>
                  {getEstadoLabel(sug.estado)}
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-300 mb-3">
                <p className="text-slate-700">{sug.mensaje}</p>
              </div>

              {sug.respuesta && (
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 mb-3">
                  <p className="text-xs font-bold text-yellow-700 mb-1">Respuesta de la administración:</p>
                  <p className="text-slate-700">{sug.respuesta}</p>
                </div>
              )}

              {isAdmin && sug.estado !== 'respondido' && (
                <div className="space-y-2 mt-3">
                  {sug.estado === 'pendiente' && (
                    <button
                      onClick={() => marcarLeido(sug.id)}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-bold"
                    >
                      <Eye size={14} /> Marcar como leído
                    </button>
                  )}
                  <textarea
                    value={respuesta[sug.id] || ''}
                    onChange={(e) => setRespuesta(r => ({ ...r, [sug.id]: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white min-h-[80px] resize-none"
                    placeholder="Escribe una respuesta..."
                  />
                  <button
                    onClick={() => responderSugerencia(sug.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 text-sm"
                  >
                    <Send size={14} /> Responder
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Suggestions;

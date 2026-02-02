import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, AppState, Payment, Expense, Suggestion } from './types';
import { INITIAL_HOUSES, ADMIN_WHATSAPP } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Payments from './components/Payments';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import Suggestions from './components/Suggestions';
import { LayoutDashboard, Receipt, ShoppingCart, BarChart3, LogOut, Settings, Cloud, RefreshCw, Key, MessageSquare, MessageCircle, AlertCircle, Copy, CheckCircle2, WifiOff } from 'lucide-react';

const API_URL = 'https://jsonblob.com/api/jsonBlob';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    houses: INITIAL_HOUSES,
    payments: [],
    expenses: [],
    suggestions: [],
    googleScriptUrl: ''
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [currentBlobId, setCurrentBlobId] = useState<string | null>(localStorage.getItem('th_control_blob_id'));
  const [copied, setCopied] = useState(false);
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('th_control_state', JSON.stringify(state));
    }
  }, [state]);

  const saveToCloud = async (data: AppState) => {
    const blobId = currentBlobId || localStorage.getItem('th_control_blob_id');
    if (!blobId || !state.user) return;
    
    if (Date.now() - lastSyncRef.current < 2000) return;
    lastSyncRef.current = Date.now();

    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/${blobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          houses: data.houses, 
          payments: data.payments, 
          expenses: data.expenses,
          suggestions: data.suggestions || [],
          lastUpdate: Date.now()
        })
      });
      
      if (!res.ok) {
        console.error(`Error Nube (Save): ${res.status} ${res.statusText}`);
        setSyncError(true);
      } else {
        setSyncError(false);
      }
    } catch (e) { 
      console.error("Fallo de red al guardar:", e);
      setSyncError(true);
    } finally { 
      setIsSyncing(false); 
    }
  };

  const createInitialCloudId = async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houses: INITIAL_HOUSES, payments: [], expenses: [], suggestions: [] })
      });
      if (res.ok) {
        const location = res.headers.get('Location');
        const newId = location?.split('/').pop();
        if (newId) {
          console.log("Nuevo ID Nube generado:", newId);
          setCurrentBlobId(newId);
          localStorage.setItem('th_control_blob_id', newId);
          return newId;
        }
      } else {
        console.error("JsonBlob rechazó la creación de ID:", res.status);
      }
    } catch (e) {
      console.error("Error crítico creando sesión en nube:", e);
    }
    return null;
  };

  const loadFromCloud = useCallback(async (manualId?: string) => {
    setIsSyncing(true);
    setSyncError(false);
    
    try {
      let blobId = manualId || currentBlobId || localStorage.getItem('th_control_blob_id');

      if (!blobId) {
        console.log("No hay ID activo. Intentando crear uno nuevo...");
        blobId = await createInitialCloudId();
      }

      if (blobId) {
        const dataRes = await fetch(`${API_URL}/${blobId}`);
        if (dataRes.ok) {
          const cloudData = await dataRes.json();
          console.log("✅ Datos descargados de la nube correctamente.");
          
          setCurrentBlobId(blobId);
          localStorage.setItem('th_control_blob_id', blobId);
          
          setState(prev => ({
            ...prev,
            houses: cloudData.houses || INITIAL_HOUSES,
            payments: cloudData.payments || [],
            expenses: cloudData.expenses || [],
            suggestions: cloudData.suggestions || [],
          }));
          setSyncError(false);
        } else {
          console.warn(`ID ${blobId} no responde (404 o similar). Reintentando...`);
          if (manualId) {
            alert("El código ingresado no existe o ha expirado.");
          } else {
            localStorage.removeItem('th_control_blob_id');
            await createInitialCloudId();
          }
          setSyncError(true);
        }
      }
    } catch (e) {
      console.error("Error en proceso de carga:", e);
      setSyncError(true);
    } finally {
      setIsSyncing(false);
    }
  }, [currentBlobId]);

  const handleLogin = async (role: UserRole, username: string, condoKey: string, houseId?: string, manualBlobId?: string) => {
    setState(prev => ({ ...prev, user: { role, username, condoKey, houseId } }));
    await loadFromCloud(manualBlobId);
  };

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión? Los datos se mantienen en este equipo.')) {
        setState(prev => ({ ...prev, user: null }));
        setActiveTab('dashboard');
    }
  };

  const addPayment = (p: Payment) => { 
    setState(s => { 
      const ns = {...s, payments: [p, ...s.payments]}; 
      saveToCloud(ns); 
      return ns; 
    }); 
  };
  
  const deletePayment = (id: string) => { 
    if (confirm('¿Eliminar registro?')) {
      setState(s => { 
        const ns = {...s, payments: s.payments.filter(p => p.id !== id)}; 
        saveToCloud(ns); 
        return ns; 
      }); 
    }
  };

  const addExpense = (e: Expense) => { 
    setState(s => { 
      const ns = {...s, expenses: [e, ...s.expenses]}; 
      saveToCloud(ns); 
      return ns; 
    }); 
  };

  const addSuggestion = (sug: Suggestion) => { 
    setState(s => { 
      const ns = {...s, suggestions: [sug, ...(s.suggestions || [])]}; 
      saveToCloud(ns); 
      return ns; 
    }); 
  };

  const updateSuggestion = (id: string, status: any) => { 
    setState(s => { 
      const ns = {...s, suggestions: s.suggestions.map(sug => sug.id === id ? {...sug, status} : sug)}; 
      saveToCloud(ns); 
      return ns; 
    }); 
  };

  const copyCode = () => {
    if (!currentBlobId) return;
    navigator.clipboard.writeText(currentBlobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!state.user) return <Login onLogin={handleLogin} houses={state.houses} />;

  return (
    <div className="min-h-screen flex bg-gray-100 flex-col md:flex-row">
      {/* Sidebar PC - AMARILLO */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-200 border-r border-gray-300 sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">T</div>
            <h1 className="font-bold text-slate-800 text-sm">TH Control</h1>
          </div>
          <nav className="space-y-1">
            <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Tablero" />
            <NavItem active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<Receipt size={20} />} label="Pagos" />
            <NavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<ShoppingCart size={20} />} label="Gastos" />
            <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 size={20} />} label="Reportes" />
            <NavItem active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} icon={<MessageSquare size={20} />} label="Buzón" />
            <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Sincronizar" />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-300">
           <SyncBadge isSyncing={isSyncing} error={syncError} onRetry={() => loadFromCloud()} />
           <button onClick={() => window.open(`https://wa.me/${ADMIN_WHATSAPP}`, '_blank')} className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl transition-all shadow-md font-bold text-xs"><MessageCircle size={14}/> WhatsApp Admin</button>
           <button onClick={handleLogout} className="text-slate-400 text-xs mt-4 flex items-center gap-1 hover:text-red-500"><LogOut size={12}/> Cerrar sesión</button>
        </div>
      </aside>

      {/* Main Content - GRIS CLARO */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0 relative">
        <div className="md:hidden bg-gray-200 border-b p-4 flex items-center justify-between sticky top-0 z-50">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">T</div>
             <span className="font-bold text-slate-800">TH Control</span>
           </div>
           <button onClick={() => loadFromCloud()} className="p-2 bg-gray-300 rounded-lg active:scale-95 transition-transform">
             <RefreshCw size={18} className={`${isSyncing ? 'animate-spin' : ''} text-slate-600`}/>
           </button>
        </div>

        {activeTab === 'dashboard' && <Dashboard state={state} />}
        {activeTab === 'payments' && <Payments state={state} onAddPayment={addPayment} onDeletePayment={deletePayment} isAdmin={state.user.role === UserRole.ADMIN} />}
        {activeTab === 'expenses' && <Expenses state={state} onAddExpense={addExpense} isAdmin={state.user.role === UserRole.ADMIN} />}
        {activeTab === 'reports' && <Reports state={state} />}
        {activeTab === 'suggestions' && <Suggestions state={state} onAddSuggestion={addSuggestion} onUpdateStatus={updateSuggestion} />}
        {activeTab === 'settings' && (
            <div className="p-4 md:p-8 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Sincronización de Datos</h1>
                
                <div className="bg-gray-200 border rounded-3xl p-6 shadow-sm mb-6 border-gray-300">
                    <h2 className="font-bold text-lg mb-4 text-yellow-600 flex items-center gap-2"><Key size={20}/> Código de Vinculación</h2>
                    <p className="text-sm text-slate-600 mb-6">Usa este código en tu celular para sincronizar ambos dispositivos.</p>
                    
                    <div className="relative mb-6">
                      <div className="bg-slate-900 text-emerald-400 p-6 rounded-2xl font-mono text-center break-all text-xs border-4 border-slate-800 shadow-xl min-h-[80px] flex items-center justify-center">
                          {currentBlobId ? currentBlobId : (isSyncing ? 'CONECTANDO...' : 'ERROR DE RED')}
                      </div>
                      {currentBlobId && (
                        <button onClick={copyCode} className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                          {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={copyCode} className="flex-1 bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
                        {copied ? '¡COPIADO!' : 'COPIAR CÓDIGO'}
                      </button>
                      <button onClick={() => loadFromCloud()} className="flex-1 bg-yellow-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-600 transition-all shadow-lg">
                        <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} /> REFRESCAR NUBE
                      </button>
                    </div>
                </div>

                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
                    <AlertCircle className="text-amber-500 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-amber-800 mb-1">Nota sobre "Error Nube"</h3>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Si ves un mensaje de error, tus datos se siguen guardando en este equipo. El error solo significa que la app no pudo enviar una copia a la nube en este momento (posiblemente por internet lento o bloqueo del servidor). Pulsa "Refrescar Nube" para intentar de nuevo.
                        </p>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Nav Mobile - AMARILLO */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-200 border-t border-gray-300 flex justify-around p-2 z-50 shadow-2xl">
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} />
        <MobileNavItem active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<Receipt size={24} />} />
        <MobileNavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<ShoppingCart size={24} />} />
        <MobileNavItem active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} icon={<MessageSquare size={24} />} />
        <MobileNavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={24} />} />
      </nav>
    </div>
  );
};

const SyncBadge: React.FC<{ isSyncing: boolean, error: boolean, onRetry: () => void }> = ({ isSyncing, error, onRetry }) => (
    <div className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${error ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-gray-100 border-gray-200 text-slate-500'}`}>
        {isSyncing ? <RefreshCw size={16} className="text-yellow-500 animate-spin" /> : error ? <WifiOff size={16} /> : <Cloud size={16} className="text-emerald-500" />}
        <span className="text-[10px] font-black uppercase tracking-widest">
            {isSyncing ? 'Sincronizando' : error ? 'Modo Local' : 'Nube Activa'}
        </span>
    </div>
);

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold transition-all ${active ? 'bg-yellow-500 text-white shadow-lg' : 'text-slate-500 hover:bg-gray-300'}`}>{icon}{label}</button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'text-yellow-500 bg-yellow-50 scale-110' : 'text-slate-400'}`}>{icon}</button>
);

export default App;
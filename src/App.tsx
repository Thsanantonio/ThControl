import React, { useState, useEffect } from 'react';
import { UserRole, AppState, Payment, Expense, Suggestion } from './types';
import { INITIAL_HOUSES } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Payments from './components/Payments';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import Suggestions from './components/Suggestions';
import Perfil from './components/Perfil';
import { LayoutDashboard, Receipt, ShoppingCart, BarChart3, LogOut, MessageSquare, User } from 'lucide-react';

const API_URL = (import.meta.env?.VITE_API_URL || 'https://thcontrol.es') as string;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    houses: INITIAL_HOUSES,
    payments: [],
    expenses: [],
    suggestions: []
  });
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state.user && token) {
      loadData();
    }
  }, [state.user, token]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const isAdmin = state.user?.role === UserRole.ADMIN;
      const paymentsUrl = isAdmin ? `${API_URL}/api/pagos` : `${API_URL}/api/pagos/mis-pagos`;
      const [paymentsRes, expensesRes] = await Promise.all([
        fetch(paymentsUrl, { headers: authHeaders() }),
        fetch(`${API_URL}/api/gastos/publicos`, { headers: authHeaders() })
      ]);
      const payments = await paymentsRes.json();
      const expenses = await expensesRes.json();
      setState(prev => ({
        ...prev,
        payments: Array.isArray(payments) ? payments : [],
        expenses: Array.isArray(expenses) ? expenses : [],
        suggestions: []
      }));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (role: UserRole, houseId?: string, userToken?: string) => {
    setToken(userToken || null);
    setState(prev => ({ ...prev, user: { role, houseId } }));
  };

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      setToken(null);
      setState(prev => ({ ...prev, user: null, payments: [], expenses: [], suggestions: [] }));
      setActiveTab('dashboard');
    }
  };

  const addPayment = async (p: Payment) => {
    try {
      const formData = new FormData();
      formData.append('tipo_cuota', p.paymentType || 'ordinaria');
      formData.append('monto', String(p.amount));
      formData.append('numero_comprobante', p.referenciaBancaria || '');
      formData.append('fecha_pago', p.date || new Date().toISOString().split('T')[0]);
      if (p.receiptUrl && (p.receiptUrl as any) instanceof File) {
        formData.append('comprobante', p.receiptUrl as any);
      }
      const res = await fetch(`${API_URL}/api/pagos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.pago) setState(s => ({ ...s, payments: [data.pago, ...s.payments] }));
    } catch (error) {
      console.error('Error guardando pago:', error);
      alert('Error al guardar el pago');
    }
  };

  const deletePayment = async (idWithAction: string) => {
    const [id, action] = idWithAction.split('|');
    if (action === 'verificado' || action === 'rechazado') {
      try {
        await fetch(`${API_URL}/api/pagos/${id}/estado`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ estado: action })
        });
        setState(s => ({ ...s, payments: s.payments.map((p: any) => p.id === id ? { ...p, estado: action } : p) }));
      } catch (error) {
        console.error('Error actualizando estado:', error);
      }
    } else {
      if (confirm('¿Eliminar registro?')) {
        try {
          await fetch(`${API_URL}/api/pagos/${id}/estado`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ estado: 'rechazado' })
          });
          setState(s => ({ ...s, payments: s.payments.filter((p: any) => p.id !== id) }));
        } catch (error) {
          console.error('Error eliminando pago:', error);
        }
      }
    }
  };

  const addExpense = async (e: Expense) => {
    try {
      const formData = new FormData();
      formData.append('descripcion', e.concept || '');
      formData.append('monto', String(e.amount));
      formData.append('categoria', e.category || 'general');
      formData.append('fecha_gasto', e.date || new Date().toISOString().split('T')[0]);
      if (e.invoiceUrl && (e.invoiceUrl as any) instanceof File) {
        formData.append('factura', e.invoiceUrl as any);
      }
      const res = await fetch(`${API_URL}/api/gastos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.gasto) setState(s => ({ ...s, expenses: [data.gasto, ...s.expenses] }));
    } catch (error) {
      console.error('Error guardando gasto:', error);
      alert('Error al guardar el gasto');
    }
  };

  const addSuggestion = async (sug: Suggestion) => {
    setState(s => ({ ...s, suggestions: [{ ...sug, id: Date.now().toString() }, ...(s.suggestions || [])] }));
  };

  const updateSuggestion = async (id: string, status: any) => {
    setState(s => ({
      ...s,
      suggestions: s.suggestions.map(sug => sug.id === id ? { ...sug, status } : sug)
    }));
  };

  if (!state.user) return <Login onLogin={handleLogin} houses={state.houses} />;

  return (
    <div className="min-h-screen flex bg-gray-100 flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-64 bg-gray-200 border-r border-gray-300 sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">T</div>
            <h1 className="font-bold text-slate-800 text-sm">TH Control</h1>
          </div>
          <nav className="space-y-1">
            <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Inicio" />
            <NavItem active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<Receipt size={20} />} label="Pagos" />
            {state.user.role === UserRole.ADMIN && (
              <NavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<ShoppingCart size={20} />} label="Gastos" />
            )}
            <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 size={20} />} label="Reportes" />
            <NavItem active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} icon={<MessageSquare size={20} />} label="Buzón" />
            <NavItem active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} icon={<User size={20} />} label="Mi Perfil" />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-300">
          <button onClick={handleLogout} className="text-slate-600 text-sm flex items-center gap-2 hover:text-red-500 font-bold">
            <LogOut size={16}/> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-24 md:pb-0 relative">
        <div className="md:hidden bg-gray-200 border-b p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">T</div>
            <span className="font-bold text-slate-800">TH Control</span>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-slate-600">Cargando datos...</div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard state={state} />}
            {activeTab === 'payments' && <Payments state={state} onAddPayment={addPayment} onDeletePayment={deletePayment} isAdmin={state.user.role === UserRole.ADMIN} />}
            {activeTab === 'expenses' && <Expenses state={state} onAddExpense={addExpense} isAdmin={state.user.role === UserRole.ADMIN} />}
            {activeTab === 'reports' && <Reports state={state} />}
            {activeTab === 'suggestions' && <Suggestions state={state} onAddSuggestion={addSuggestion} onUpdateStatus={updateSuggestion} />}
            {activeTab === 'perfil' && <Perfil token={token!} apiUrl={API_URL} />}
          </>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-200 border-t border-gray-300 flex justify-around p-2 z-50 shadow-2xl overflow-x-auto">
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22} />} label="Inicio" />
        <MobileNavItem active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<Receipt size={22} />} label="Pagos" />
        {state.user.role === UserRole.ADMIN && (
          <MobileNavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<ShoppingCart size={22} />} label="Gastos" />
        )}
        <MobileNavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 size={22} />} label="Reportes" />
        <MobileNavItem active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} icon={<MessageSquare size={22} />} label="Buzón" />
        <MobileNavItem active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} icon={<User size={22} />} label="Perfil" />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold transition-all ${active ? 'bg-yellow-500 text-white shadow-lg' : 'text-slate-500 hover:bg-gray-300'}`}>{icon}{label}</button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px] ${active ? 'text-yellow-500 bg-yellow-50' : 'text-slate-400'}`}>
    {icon}
    <span className="text-xs font-bold">{label}</span>
  </button>
);

export default App;

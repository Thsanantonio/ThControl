import React, { useState, useEffect } from 'react';
import { UserRole, AppState, Payment, Expense, Suggestion } from './types';
import { INITIAL_HOUSES } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Payments from './components/Payments';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import Suggestions from './components/Suggestions';
import { LayoutDashboard, Receipt, ShoppingCart, BarChart3, LogOut, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    houses: INITIAL_HOUSES,
    payments: [],
    expenses: [],
    suggestions: []
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos al iniciar sesión
  useEffect(() => {
    if (state.user) {
      loadData();
    }
  }, [state.user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [paymentsRes, expensesRes, suggestionsRes] = await Promise.all([
        fetch(`${API_URL}/payments`),
        fetch(`${API_URL}/expenses`),
        fetch(`${API_URL}/suggestions`)
      ]);

      const payments = await paymentsRes.json();
      const expenses = await expensesRes.json();
      const suggestions = await suggestionsRes.json();

      setState(prev => ({
        ...prev,
        payments,
        expenses,
        suggestions
      }));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (role: UserRole, houseId?: string) => {
    setState(prev => ({ ...prev, user: { role, houseId } }));
  };

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      setState(prev => ({ ...prev, user: null }));
      setActiveTab('dashboard');
    }
  };

  const addPayment = async (p: Payment) => {
    try {
      const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      const newPayment = await res.json();
      setState(s => ({ ...s, payments: [newPayment, ...s.payments] }));
    } catch (error) {
      console.error('Error guardando pago:', error);
      alert('Error al guardar el pago');
    }
  };

  const deletePayment = async (id: string) => {
    if (confirm('¿Eliminar registro?')) {
      try {
        await fetch(`${API_URL}/payments/${id}`, { method: 'DELETE' });
        setState(s => ({ ...s, payments: s.payments.filter(p => p.id !== id) }));
      } catch (error) {
        console.error('Error eliminando pago:', error);
      }
    }
  };

  const addExpense = async (e: Expense) => {
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e)
      });
      const newExpense = await res.json();
      setState(s => ({ ...s, expenses: [newExpense, ...s.expenses] }));
    } catch (error) {
      console.error('Error guardando gasto:', error);
      alert('Error al guardar el gasto');
    }
  };

  const addSuggestion = async (sug: Suggestion) => {
    try {
      const res = await fetch(`${API_URL}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sug)
      });
      const newSuggestion = await res.json();
      setState(s => ({ ...s, suggestions: [newSuggestion, ...(s.suggestions || [])] }));
    } catch (error) {
      console.error('Error guardando sugerencia:', error);
      alert('Error al enviar la sugerencia');
    }
  };

  const updateSuggestion = async (id: string, status: any) => {
    try {
      await fetch(`${API_URL}/suggestions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setState(s => ({
        ...s,
        suggestions: s.suggestions.map(sug => sug.id === id ? { ...sug, status } : sug)
      }));
    } catch (error) {
      console.error('Error actualizando sugerencia:', error);
    }
  };

  if (!state.user) return <Login onLogin={handleLogin} houses={state.houses} />;

  return (
    <div className="min-h-screen flex bg-gray-100 flex-col md:flex-row">
      {/* Sidebar PC */}
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
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-300">
          <button onClick={handleLogout} className="text-slate-600 text-sm flex items-center gap-2 hover:text-red-500 font-bold">
            <LogOut size={16}/> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
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
          </>
        )}
      </main>

      {/* Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-200 border-t border-gray-300 flex justify-around p-2 z-50 shadow-2xl">
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} />
        <MobileNavItem active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} icon={<Receipt size={24} />} />
        {state.user.role === UserRole.ADMIN && (
          <MobileNavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<ShoppingCart size={24} />} />
        )}
        <MobileNavItem active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')} icon={<MessageSquare size={24} />} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold transition-all ${active ? 'bg-yellow-500 text-white shadow-lg' : 'text-slate-500 hover:bg-gray-300'}`}>{icon}{label}</button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl transition-all ${active ? 'text-yellow-500 bg-yellow-50 scale-110' : 'text-slate-400'}`}>{icon}</button>
);

export default App;
import React, { useState } from 'react';
import { AppState } from '../types';
import { DollarSign, TrendingUp, Home, AlertCircle } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [selectedStreet, setSelectedStreet] = useState('');
  
  const totalIncome = state.payments.reduce((sum, p: any) => sum + (parseFloat(p.monto) || parseFloat(p.amount) || 0), 0);
  const totalExpenses = state.expenses.reduce((sum, e: any) => sum + (parseFloat(e.monto) || parseFloat(e.amount) || 0), 0);
  const balance = totalIncome - totalExpenses;

  const streets = ['Calle A', 'Calle B', 'Calle C', 'Calle P'];

  const getPaymentsByCasa = (casaNumero: string) => {
    return state.payments
      .filter((p: any) => (p.perfiles?.casa_numero || p.casa_numero) === casaNumero)
      .reduce((sum, p: any) => sum + (parseFloat(p.monto) || 0), 0);
  };

  const allCasas = [
    ...Array.from({length: 36}, (_, i) => {
      const nums = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,35,37];
      return { id: `TH${String(nums[i]).padStart(2,'0')}A`, name: `TH${String(nums[i]).padStart(2,'0')}A`, street: 'Calle A' };
    }),
    ...Array.from({length: 32}, (_, i) => ({ id: `TH${String(i+1).padStart(2,'0')}B`, name: `TH${String(i+1).padStart(2,'0')}B`, street: 'Calle B' })),
    ...[1,3,5,7,9,11,13,15,17,19,21,23].map(n => ({ id: `TH${String(n).padStart(2,'0')}C`, name: `TH${String(n).padStart(2,'0')}C`, street: 'Calle C' })),
    ...Array.from({length: 10}, (_, i) => ({ id: `TH${String(i+1).padStart(2,'0')}P`, name: `TH${String(i+1).padStart(2,'0')}P`, street: 'Calle P' })),
  ];

  const filteredCasas = selectedStreet ? allCasas.filter(h => h.street === selectedStreet) : allCasas;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Tablero General</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Ingresos Totales" value={`$${totalIncome.toFixed(2)}`} icon={<DollarSign size={32} />} color="bg-emerald-500" />
        <StatCard title="Gastos Totales" value={`$${totalExpenses.toFixed(2)}`} icon={<TrendingUp size={32} />} color="bg-red-500" />
        <StatCard title="Balance" value={`$${balance.toFixed(2)}`} icon={<DollarSign size={32} />} color={balance >= 0 ? 'bg-yellow-500' : 'bg-red-500'} />
        <StatCard title="Casas" value={allCasas.length.toString()} icon={<Home size={32} />} color="bg-purple-500" />
      </div>

      <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Resumen de Casas</h2>
          <select
            value={selectedStreet}
            onChange={(e) => setSelectedStreet(e.target.value)}
            className="p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white font-bold"
          >
            <option value="">Todas las calles</option>
            {streets.map(street => <option key={street} value={street}>{street}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
          {filteredCasas.map(casa => (
            <div key={casa.id} className="bg-white rounded-xl p-4 border border-gray-300 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{casa.name}</h3>
                  <p className="text-xs text-slate-500">{casa.street}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Pagado</p>
                  <p className="font-bold text-lg text-yellow-600">${getPaymentsByCasa(casa.id).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md`}>{icon}</div>
    </div>
    <h3 className="text-slate-600 text-sm font-bold mb-1">{title}</h3>
    <p className="text-3xl font-bold text-slate-800">{value}</p>
  </div>
);

export default Dashboard;

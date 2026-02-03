import React, { useState } from 'react';
import { AppState } from '../types';
import { DollarSign, TrendingUp, Home, AlertCircle } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [selectedStreet, setSelectedStreet] = useState('');
  
  const totalIncome = state.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  const pendingSuggestions = state.suggestions.filter(s => s.status === 'pending').length;

  const streets = ['Calle A', 'Calle B', 'Calle C', 'Calle P'];
  
  const filteredHouses = selectedStreet 
    ? state.houses.filter(h => h.street === selectedStreet)
    : state.houses;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Tablero General</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Ingresos Totales"
          value={`$${totalIncome.toFixed(2)}`}
          icon={<DollarSign size={32} />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Gastos Totales"
          value={`$${totalExpenses.toFixed(2)}`}
          icon={<TrendingUp size={32} />}
          color="bg-red-500"
        />
        <StatCard
          title="Balance"
          value={`$${balance.toFixed(2)}`}
          icon={<DollarSign size={32} />}
          color={balance >= 0 ? 'bg-yellow-500' : 'bg-red-500'}
        />
        <StatCard
          title="Casas"
          value={state.houses.length.toString()}
          icon={<Home size={32} />}
          color="bg-purple-500"
        />
      </div>

      {pendingSuggestions > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <AlertCircle className="text-amber-600 shrink-0" size={28} />
          <div>
            <h3 className="font-bold text-amber-900 text-lg mb-1">
              Tienes {pendingSuggestions} sugerencia{pendingSuggestions !== 1 ? 's' : ''} pendiente{pendingSuggestions !== 1 ? 's' : ''}
            </h3>
            <p className="text-amber-700 text-sm">Revisa el buzón de sugerencias para ver los comentarios de los residentes.</p>
          </div>
        </div>
      )}

      <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Resumen de Casas</h2>
          <select
            value={selectedStreet}
            onChange={(e) => setSelectedStreet(e.target.value)}
            className="p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white font-bold"
          >
            <option value="">Todas las calles</option>
            {streets.map(street => (
              <option key={street} value={street}>{street}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
          {filteredHouses.map(house => {
            const housePayments = state.payments
              .filter(p => p.houseId === house.id)
              .reduce((sum, p) => sum + p.amount, 0);
            
            return (
              <div key={house.id} className="bg-white rounded-xl p-4 border border-gray-300 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">{house.name}</h3>
                    <p className="text-xs text-slate-500">{house.street}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Pagado</p>
                    <p className="font-bold text-lg text-yellow-600">${housePayments.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md`}>
        {icon}
      </div>
    </div>
    <h3 className="text-slate-600 text-sm font-bold mb-1">{title}</h3>
    <p className="text-3xl font-bold text-slate-800">{value}</p>
  </div>
);

export default Dashboard;
import React from 'react';
import { AppState } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface ReportsProps {
  state: AppState;
}

const Reports: React.FC<ReportsProps> = ({ state }) => {
  const totalIncome = state.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = state.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const paymentsByHouse = state.houses.map(house => {
    const payments = state.payments
      .filter(p => p.houseId === house.id)
      .reduce((sum, p) => sum + p.amount, 0);
    return { ...house, payments };
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Reportes Financieros</h1>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-bold text-slate-800">Ingresos Totales</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-600">€{totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
              <TrendingDown size={24} />
            </div>
            <h3 className="font-bold text-slate-800">Gastos Totales</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</p>
        </div>

        <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300">
          <div className="flex items-center gap-3 mb-4">
            <div className={`${balance >= 0 ? 'bg-yellow-500' : 'bg-red-500'} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
              <DollarSign size={24} />
            </div>
            <h3 className="font-bold text-slate-800">Balance</h3>
          </div>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
            €{balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Gastos por Categoría */}
      <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Gastos por Categoría</h2>
        <div className="space-y-4">
          {Object.entries(expensesByCategory).length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay gastos registrados</p>
          ) : (
            Object.entries(expensesByCategory).map(([category, amount]) => {
              const percentage = (amount / totalExpenses) * 100;
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800">{category}</span>
                    <span className="text-slate-600">€{amount.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-yellow-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagos por Casa */}
      <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Pagos por Casa</h2>
        <div className="space-y-3">
          {paymentsByHouse.map(house => (
            <div key={house.id} className="bg-white rounded-xl p-4 flex justify-between items-center border border-gray-300">
              <div>
                <h3 className="font-bold text-slate-800">{house.name}</h3>
                <p className="text-sm text-slate-600">{house.owner}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">€{house.payments.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Total pagado</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos Movimientos */}
      <div className="bg-gray-200 rounded-2xl p-6 mt-8 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Últimos Movimientos</h2>
        <div className="space-y-3">
          {[...state.payments.slice(0, 5)].map(payment => {
            const house = state.houses.find(h => h.id === payment.houseId);
            return (
              <div key={payment.id} className="bg-white rounded-xl p-4 flex justify-between items-center border border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                    +
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{house?.name} - {payment.concept}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} />
                      {new Date(payment.date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
                <p className="font-bold text-emerald-600">+€{payment.amount.toFixed(2)}</p>
              </div>
            );
          })}
          {[...state.expenses.slice(0, 5)].map(expense => (
            <div key={expense.id} className="bg-white rounded-xl p-4 flex justify-between items-center border border-gray-300">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                  -
                </div>
                <div>
                  <p className="font-bold text-slate-800">{expense.concept}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={12} />
                    {new Date(expense.date).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
              <p className="font-bold text-red-600">-€{expense.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
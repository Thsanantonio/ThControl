import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download } from 'lucide-react';

interface ReportsProps {
  state: AppState;
}

const Reports: React.FC<ReportsProps> = ({ state }) => {
  const [filterType, setFilterType] = useState<'month' | 'year' | 'street'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedStreet, setSelectedStreet] = useState('');

  const streets = ['Calle A', 'Calle B', 'Calle C', 'Calle P'];

  // Filtrar datos según selección
  const filteredData = useMemo(() => {
    let payments = state.payments;
    let expenses = state.expenses;

    if (filterType === 'month') {
      payments = payments.filter(p => p.date.startsWith(selectedMonth));
      expenses = expenses.filter(e => e.date.startsWith(selectedMonth));
    } else if (filterType === 'year') {
      payments = payments.filter(p => p.date.startsWith(selectedYear));
      expenses = expenses.filter(e => e.date.startsWith(selectedYear));
    } else if (filterType === 'street' && selectedStreet) {
      const housesInStreet = state.houses.filter(h => h.street === selectedStreet).map(h => h.id);
      payments = payments.filter(p => housesInStreet.includes(p.houseId));
    }

    return { payments, expenses };
  }, [filterType, selectedMonth, selectedYear, selectedStreet, state.payments, state.expenses, state.houses]);

  const totalIncome = filteredData.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = filteredData.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const paymentsByHouse = state.houses.map(house => {
    const payments = filteredData.payments
      .filter(p => p.houseId === house.id)
      .reduce((sum, p) => sum + p.amount, 0);
    return { ...house, payments };
  }).filter(h => filterType !== 'street' || h.street === selectedStreet);

  const generatePDF = () => {
    // TODO: Implementar generación de PDF real con biblioteca como jsPDF
    const period = filterType === 'month' ? selectedMonth : 
                   filterType === 'year' ? selectedYear : 
                   selectedStreet;
    
    alert(`Generando PDF para: ${period}\n\nIngresos: $${totalIncome.toFixed(2)} USD\nGastos: $${totalExpenses.toFixed(2)} USD\nBalance: $${balance.toFixed(2)} USD\n\n(Funcionalidad pendiente de implementar con jsPDF)`);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Reportes Financieros</h1>
        <button
          onClick={generatePDF}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Download size={20} />
          Generar PDF
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700">Tipo de Reporte</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white font-bold"
            >
              <option value="month">Mensual</option>
              <option value="year">Anual</option>
              <option value="street">Por Calle</option>
            </select>
          </div>

          {filterType === 'month' && (
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Mes</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
              />
            </div>
          )}

          {filterType === 'year' && (
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Año</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                min="2020"
                max="2030"
              />
            </div>
          )}

          {filterType === 'street' && (
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Calle</label>
              <select
                value={selectedStreet}
                onChange={(e) => setSelectedStreet(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
              >
                <option value="">Selecciona una calle</option>
                {streets.map(street => (
                  <option key={street} value={street}>{street}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* Gastos por Categoría */}
      <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Gastos por Categoría</h2>
        <div className="space-y-4">
          {Object.entries(expensesByCategory).length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay gastos en este período</p>
          ) : (
            Object.entries(expensesByCategory).map(([category, amount]) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800">{category}</span>
                    <span className="text-slate-600">${amount.toFixed(2)} USD ({percentage.toFixed(1)}%)</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
          {paymentsByHouse.map(house => (
            <div key={house.id} className="bg-white rounded-xl p-4 border border-gray-300 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{house.name}</h3>
                  <p className="text-xs text-slate-500">{house.street}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-600">${house.payments.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">USD</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos Movimientos */}
      <div className="bg-gray-200 rounded-2xl p-6 mt-8 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Últimos Movimientos</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {[...filteredData.payments.slice(0, 10).map(p => ({ ...p, type: 'payment' })),
            ...filteredData.expenses.slice(0, 10).map(e => ({ ...e, type: 'expense' }))]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 15)
            .map((item: any) => {
              const isPayment = item.type === 'payment';
              const house = isPayment ? state.houses.find(h => h.id === item.houseId) : null;
              
              return (
                <div key={item.id} className="bg-white rounded-xl p-4 flex justify-between items-center border border-gray-300">
                  <div className="flex items-center gap-3">
                    <div className={`${isPayment ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'} w-10 h-10 rounded-lg flex items-center justify-center font-bold`}>
                      {isPayment ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {isPayment ? `${house?.name} - ${item.paymentType}` : item.concept}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        {new Date(item.date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  <p className={`font-bold ${isPayment ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPayment ? '+' : '-'}${item.amount.toFixed(2)} USD
                  </p>
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
    <p className="text-xs text-slate-500 mt-1">USD</p>
  </div>
);

export default Reports;
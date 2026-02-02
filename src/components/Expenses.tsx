import React, { useState } from 'react';
import { AppState, Expense } from '../types';
import { Plus, ShoppingCart, Calendar } from 'lucide-react';

interface ExpensesProps {
  state: AppState;
  onAddExpense: (expense: Expense) => void;
  isAdmin: boolean;
}

const Expenses: React.FC<ExpensesProps> = ({ state, onAddExpense, isAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Mantenimiento');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!concept || !amount) {
      alert('Por favor completa todos los campos');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      concept,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      category
    };

    onAddExpense(expense);
    setConcept('');
    setAmount('');
    setCategory('Mantenimiento');
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gastos</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={20} />
            Registrar Gasto
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Nuevo Gasto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Concepto</label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                  placeholder="Descripción del gasto"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Monto (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-slate-700">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                >
                  <option>Mantenimiento</option>
                  <option>Servicios</option>
                  <option>Reparaciones</option>
                  <option>Limpieza</option>
                  <option>Seguridad</option>
                  <option>Jardinería</option>
                  <option>Otros</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                Guardar Gasto
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {state.expenses.length === 0 ? (
          <div className="bg-gray-200 rounded-2xl p-12 text-center border-2 border-gray-300">
            <p className="text-slate-500">No hay gastos registrados</p>
          </div>
        ) : (
          state.expenses.map(expense => (
            <div key={expense.id} className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                      <ShoppingCart size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{expense.concept}</h3>
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                        {expense.category}
                      </span>
                    </div>
                  </div>
                  <div className="ml-15">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={14} />
                      {new Date(expense.date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-600">€{expense.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Expenses;
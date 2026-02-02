import React, { useState } from 'react';
import { AppState, Payment } from '../types';
import { Plus, Trash2, Calendar, CreditCard } from 'lucide-react';

interface PaymentsProps {
  state: AppState;
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
  isAdmin: boolean;
}

const Payments: React.FC<PaymentsProps> = ({ state, onAddPayment, onDeletePayment, isAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [houseId, setHouseId] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('Cuota mensual');
  const [method, setMethod] = useState('Transferencia');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!houseId || !amount) {
      alert('Por favor completa todos los campos');
      return;
    }

    const payment: Payment = {
      id: Date.now().toString(),
      houseId,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      concept,
      method
    };

    onAddPayment(payment);
    setHouseId('');
    setAmount('');
    setConcept('Cuota mensual');
    setMethod('Transferencia');
    setShowForm(false);
  };

  const filteredPayments = isAdmin 
    ? state.payments 
    : state.payments.filter(p => p.houseId === state.user?.houseId);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Pagos</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={20} />
            Registrar Pago
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Nuevo Pago</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Casa</label>
                <select
                  value={houseId}
                  onChange={(e) => setHouseId(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                  required
                >
                  <option value="">Seleccionar casa</option>
                  {state.houses.map(house => (
                    <option key={house.id} value={house.id}>
                      {house.name} - {house.owner}
                    </option>
                  ))}
                </select>
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
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Concepto</label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                  placeholder="Cuota mensual"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Método de Pago</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                >
                  <option>Transferencia</option>
                  <option>Efectivo</option>
                  <option>Tarjeta</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                Guardar Pago
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
        {filteredPayments.length === 0 ? (
          <div className="bg-gray-200 rounded-2xl p-12 text-center border-2 border-gray-300">
            <p className="text-slate-500">No hay pagos registrados</p>
          </div>
        ) : (
          filteredPayments.map(payment => {
            const house = state.houses.find(h => h.id === payment.houseId);
            return (
              <div key={payment.id} className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-yellow-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{house?.name}</h3>
                        <p className="text-sm text-slate-600">{house?.owner}</p>
                      </div>
                    </div>
                    <div className="ml-15 space-y-1">
                      <p className="text-sm text-slate-600"><strong>Concepto:</strong> {payment.concept}</p>
                      <p className="text-sm text-slate-600"><strong>Método:</strong> {payment.method}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} />
                        {new Date(payment.date).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-yellow-600">€{payment.amount.toFixed(2)}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => onDeletePayment(payment.id)}
                        className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Payments;
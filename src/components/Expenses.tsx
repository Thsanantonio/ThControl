import React, { useState, useEffect } from 'react';
import { AppState, Expense } from '../types';
import { Plus, ShoppingCart, Calendar, Upload, Eye, FileText } from 'lucide-react';

interface ExpensesProps {
  state: AppState;
  onAddExpense: (expense: Expense) => void;
  isAdmin: boolean;
}

const Expenses: React.FC<ExpensesProps> = ({ state, onAddExpense, isAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [concept, setConcept] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [montoBs, setMontoBs] = useState('');
  const [tasaCambio, setTasaCambio] = useState('');
  const [totalUsd, setTotalUsd] = useState('0.00');
  const [category, setCategory] = useState('Mantenimiento');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);

  useEffect(() => {
    if (montoBs && tasaCambio) {
      const bs = parseFloat(montoBs);
      const tasa = parseFloat(tasaCambio);
      if (!isNaN(bs) && !isNaN(tasa) && tasa > 0) {
        setTotalUsd((bs / tasa).toFixed(2));
      }
    } else {
      setTotalUsd('0.00');
    }
  }, [montoBs, tasaCambio]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!concept || !montoBs || !tasaCambio) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // TODO: Subir archivo al servidor
    let invoiceUrl = '';
    if (invoiceFile) {
      const formData = new FormData();
      formData.append('invoice', invoiceFile);
      // Aquí iría la llamada al backend para subir el archivo
      // invoiceUrl = await uploadInvoice(formData);
    }

    const expense: Expense = {
      id: Date.now().toString(),
      concept,
      amount: parseFloat(totalUsd),
      date: expenseDate,
      category,
      montoBs: parseFloat(montoBs),
      tasaCambio: parseFloat(tasaCambio),
      totalUsd: parseFloat(totalUsd),
      invoiceUrl
    };

    onAddExpense(expense);
    
    // Reset form
    setConcept('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setMontoBs('');
    setTasaCambio('');
    setTotalUsd('0.00');
    setCategory('Mantenimiento');
    setInvoiceFile(null);
    setShowForm(false);
  };

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-12 text-center">
          <p className="text-amber-800 font-bold">Solo los administradores pueden ver y registrar gastos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Gastos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} />
          Registrar Gasto
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Nuevo Gasto</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Concepto *</label>
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
                <label className="block text-sm font-bold mb-2 text-slate-700">Fecha *</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Monto en Bs. *</label>
                <input
                  type="number"
                  step="0.01"
                  value={montoBs}
                  onChange={(e) => setMontoBs(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Tasa de Cambio *</label>
                <input
                  type="number"
                  step="0.01"
                  value={tasaCambio}
                  onChange={(e) => setTasaCambio(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Total en USD (Calculado)</label>
                <div className="w-full p-4 rounded-xl border-2 border-yellow-500 bg-yellow-50 text-yellow-800 font-bold text-2xl text-center">
                  ${totalUsd} USD
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Categoría *</label>
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

              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-slate-700 flex items-center gap-2">
                  <Upload size={16} /> Factura o Comprobante
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-white file:font-bold hover:file:bg-yellow-600"
                />
                {invoiceFile && (
                  <p className="text-sm text-slate-600 mt-2">Archivo: {invoiceFile.name}</p>
                )}
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
                  <div className="ml-15 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={14} />
                      {new Date(expense.date).toLocaleDateString('es-ES')}
                    </div>
                    {expense.montoBs && expense.tasaCambio && (
                      <p className="text-sm text-slate-600">
                        <strong>Bs. {expense.montoBs.toFixed(2)}</strong> ÷ Tasa {expense.tasaCambio.toFixed(2)} = <strong>${expense.totalUsd?.toFixed(2)} USD</strong>
                      </p>
                    )}
                    {expense.invoiceUrl && (
                      <button
                        onClick={() => setViewingInvoice(expense.invoiceUrl!)}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2 font-bold"
                      >
                        <Eye size={14} /> Ver factura
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-600">${expense.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">USD</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para ver factura */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setViewingInvoice(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <FileText size={24} /> Factura
              </h3>
              <button onClick={() => setViewingInvoice(null)} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                Cerrar
              </button>
            </div>
            <img src={viewingInvoice} alt="Factura" className="w-full rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
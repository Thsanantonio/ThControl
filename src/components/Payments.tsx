import React, { useState } from 'react';
import { AppState, Payment, PaymentType } from '../types';
import { Plus, Trash2, Calendar, CreditCard, Upload, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PaymentsProps {
  state: AppState;
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
  isAdmin: boolean;
}

const Payments: React.FC<PaymentsProps> = ({ state, onAddPayment, onDeletePayment, isAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.ORDINARIA);
  const [extraordinaryReason, setExtraordinaryReason] = useState('');
  const [referenciaBancaria, setReferenciaBancaria] = useState('');
  const [montoBs, setMontoBs] = useState('');
  const [tasaCambio, setTasaCambio] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const totalUsd = montoBs && tasaCambio && parseFloat(tasaCambio) > 0
    ? (parseFloat(montoBs) / parseFloat(tasaCambio)).toFixed(2)
    : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenciaBancaria || !montoBs || !tasaCambio) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    if (paymentType === PaymentType.EXTRAORDINARIA && !extraordinaryReason.trim()) {
      alert('Por favor indica el motivo de la cuota extraordinaria');
      return;
    }
    const payment: Payment = {
      id: Date.now().toString(),
      houseId: state.user?.houseId || '',
      amount: parseFloat(totalUsd),
      date: paymentDate,
      paymentType,
      extraordinaryReason: paymentType === PaymentType.EXTRAORDINARIA ? extraordinaryReason : undefined,
      method: 'Transferencia',
      referenciaBancaria,
      montoBs: parseFloat(montoBs),
      tasaCambio: parseFloat(tasaCambio),
      totalUsd: parseFloat(totalUsd),
      receiptUrl: receiptFile as any
    };
    await onAddPayment(payment);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentType(PaymentType.ORDINARIA);
    setExtraordinaryReason('');
    setReferenciaBancaria('');
    setMontoBs('');
    setTasaCambio('');
    setReceiptFile(null);
    setShowForm(false);
  };

  const getEstadoIcon = (estado: string) => {
    if (estado === 'verificado') return <CheckCircle size={16} className="text-green-500" />;
    if (estado === 'rechazado') return <XCircle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-yellow-500" />;
  };

  const getEstadoLabel = (estado: string) => {
    if (estado === 'verificado') return 'Verificado';
    if (estado === 'rechazado') return 'Rechazado';
    return 'Pendiente';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Pagos</h1>
        {!isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={20} /> Registrar Pago
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Nuevo Pago</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Tu Casa</label>
                <input
                  type="text"
                  value={state.user?.houseId || ''}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 bg-gray-100 text-slate-600 font-bold"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Fecha *</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-slate-700">Tipo de Pago *</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white"
                >
                  <option value={PaymentType.ORDINARIA}>{PaymentType.ORDINARIA}</option>
                  <option value={PaymentType.EXTRAORDINARIA}>{PaymentType.EXTRAORDINARIA}</option>
                </select>
              </div>
              {paymentType === PaymentType.EXTRAORDINARIA && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-slate-700">Motivo *</label>
                  <textarea
                    value={extraordinaryReason}
                    onChange={(e) => setExtraordinaryReason(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white min-h-[80px]"
                    placeholder="Indica el motivo..."
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700">Últimos 6 dígitos Referencia *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={referenciaBancaria}
                  onChange={(e) => setReferenciaBancaria(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white font-mono text-lg tracking-wider"
                  placeholder="123456"
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
                <label className="block text-sm font-bold mb-2 text-slate-700">Total en USD</label>
                <div className="w-full p-4 rounded-xl border-2 border-yellow-500 bg-yellow-50 text-yellow-800 font-bold text-2xl text-center">
                  ${totalUsd} USD
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-slate-700 flex items-center gap-2">
                  <Upload size={16} /> Comprobante de Pago
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && setReceiptFile(e.target.files[0])}
                  className="w-full p-3 rounded-xl border-2 border-gray-300 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-white file:font-bold"
                />
                {receiptFile && <p className="text-sm text-slate-600 mt-2">Archivo: {receiptFile.name}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl">Guardar Pago</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {state.payments.length === 0 ? (
          <div className="bg-gray-200 rounded-2xl p-12 text-center border-2 border-gray-300">
            <p className="text-slate-500">No hay pagos registrados</p>
          </div>
        ) : (
          state.payments.map((payment: any) => (
            <div key={payment.id} className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-yellow-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{payment.perfiles?.casa_numero || payment.casa_numero || payment.vecino_id}</h3>
                      <p className="text-sm text-slate-600">{payment.tipo_cuota || payment.paymentType}</p>
                    </div>
                  </div>
                  <div className="space-y-1 ml-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={14} />
                      {new Date(payment.fecha_pago || payment.date).toLocaleDateString('es-ES')}
                    </div>
                    {payment.numero_comprobante && (
                      <p className="text-sm text-slate-600"><strong>Ref:</strong> ...{payment.numero_comprobante}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      {getEstadoIcon(payment.estado || 'pendiente')}
                      <span className="font-bold">{getEstadoLabel(payment.estado || 'pendiente')}</span>
                    </div>
                    {payment.comprobante_url && (
                      <a href={payment.comprobante_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
                        <FileText size={14} /> Ver comprobante
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-yellow-600">${(payment.monto || payment.amount || 0).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">USD</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => onDeletePayment(payment.id)} className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Payments;

import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { TrendingUp, DollarSign, Calendar, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  state: AppState;
}

const Reports: React.FC<ReportsProps> = ({ state }) => {
  const [filterType, setFilterType] = useState<'month' | 'year' | 'street'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedStreet, setSelectedStreet] = useState('');

  const streets = ['Calle A', 'Calle B', 'Calle C', 'Calle P'];

  const getDate = (p: any) => p.fecha_pago || p.date || '';
  const getMonto = (p: any) => parseFloat(p.monto || p.amount || 0);
  const getCasa = (p: any) => p.perfiles?.casa_numero || p.casa_numero || '';
  const getCalle = (p: any) => {
    const casa = getCasa(p);
    if (casa.endsWith('A')) return 'Calle A';
    if (casa.endsWith('B')) return 'Calle B';
    if (casa.endsWith('C')) return 'Calle C';
    if (casa.endsWith('P')) return 'Calle P';
    return '';
  };

  const filteredData = useMemo(() => {
    let payments = state.payments as any[];
    let expenses = state.expenses as any[];

    if (filterType === 'month') {
      payments = payments.filter(p => getDate(p).startsWith(selectedMonth));
      expenses = expenses.filter(e => (e.fecha_gasto || e.date || '').startsWith(selectedMonth));
    } else if (filterType === 'year') {
      payments = payments.filter(p => getDate(p).startsWith(selectedYear));
      expenses = expenses.filter(e => (e.fecha_gasto || e.date || '').startsWith(selectedYear));
    } else if (filterType === 'street' && selectedStreet) {
      payments = payments.filter(p => getCalle(p) === selectedStreet);
    }

    return { payments, expenses };
  }, [filterType, selectedMonth, selectedYear, selectedStreet, state.payments, state.expenses]);

  const totalIncome = filteredData.payments.reduce((sum, p) => sum + getMonto(p), 0);
  const totalExpenses = filteredData.expenses.reduce((sum, e: any) => sum + parseFloat(e.monto || e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = filteredData.expenses.reduce((acc: any, e: any) => {
    const cat = e.categoria || e.category || 'General';
    acc[cat] = (acc[cat] || 0) + parseFloat(e.monto || e.amount || 0);
    return acc;
  }, {});

  const allCasas = [
    ...[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,35,37].map(n => ({ id: `TH${String(n).padStart(2,'0')}A`, name: `TH${String(n).padStart(2,'0')}A`, street: 'Calle A' })),
    ...Array.from({length:32},(_,i)=>({id:`TH${String(i+1).padStart(2,'0')}B`,name:`TH${String(i+1).padStart(2,'0')}B`,street:'Calle B'})),
    ...[1,3,5,7,9,11,13,15,17,19,21,23].map(n=>({id:`TH${String(n).padStart(2,'0')}C`,name:`TH${String(n).padStart(2,'0')}C`,street:'Calle C'})),
    ...Array.from({length:10},(_,i)=>({id:`TH${String(i+1).padStart(2,'0')}P`,name:`TH${String(i+1).padStart(2,'0')}P`,street:'Calle P'})),
  ];

  const filteredCasas = filterType === 'street' && selectedStreet ? allCasas.filter(h => h.street === selectedStreet) : allCasas;

  const paymentsByCasa = filteredCasas.map(casa => ({
    ...casa,
    total: filteredData.payments.filter((p: any) => getCasa(p) === casa.id).reduce((sum, p) => sum + getMonto(p), 0)
  }));

  const getPeriodLabel = () => {
    if (filterType === 'month') return selectedMonth;
    if (filterType === 'year') return selectedYear;
    return selectedStreet || 'Todas las calles';
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const period = getPeriodLabel();

    // Header
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('TH CONTROL', 14, 15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporte Financiero — ${period}`, 14, 25);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 140, 25);

    // Resumen
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', 14, 50);

    autoTable(doc, {
      startY: 55,
      head: [['Concepto', 'Monto (USD)']],
      body: [
        ['Ingresos Totales', `$${totalIncome.toFixed(2)}`],
        ['Gastos Totales', `$${totalExpenses.toFixed(2)}`],
        ['Balance', `$${balance.toFixed(2)}`],
      ],
      headStyles: { fillColor: [234, 179, 8], textColor: [0, 0, 0], fontStyle: 'bold' },
      bodyStyles: { fontSize: 11 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    });

    // Pagos por casa
    const finalY1 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Pagos por Casa', 14, finalY1);

    const casasConPagos = paymentsByCasa.filter(c => c.total > 0);
    if (casasConPagos.length > 0) {
      autoTable(doc, {
        startY: finalY1 + 5,
        head: [['Casa', 'Calle', 'Total (USD)']],
        body: casasConPagos.map(c => [c.name, c.street, `$${c.total.toFixed(2)}`]),
        headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 2: { halign: 'right' } },
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('No hay pagos en este período', 14, finalY1 + 10);
    }

    // Gastos por categoría
    const finalY2 = (doc as any).lastAutoTable?.finalY + 10 || finalY1 + 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Gastos por Categoría', 14, finalY2);

    if (Object.keys(expensesByCategory).length > 0) {
      autoTable(doc, {
        startY: finalY2 + 5,
        head: [['Categoría', 'Monto (USD)', '% del Total']],
        body: Object.entries(expensesByCategory).map(([cat, amount]: any) => [
          cat,
          `$${amount.toFixed(2)}`,
          `${totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0}%`
        ]),
        headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      });
    }

    // Detalle de pagos
    if (filteredData.payments.length > 0) {
      doc.addPage();
      doc.setFillColor(30, 58, 95);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Pagos', 14, 14);

      autoTable(doc, {
        startY: 25,
        head: [['Casa', 'Tipo', 'Fecha', 'Referencia', 'Monto (USD)', 'Estado']],
        body: filteredData.payments.map((p: any) => [
          getCasa(p),
          p.tipo_cuota || p.paymentType || '',
          new Date(getDate(p)).toLocaleDateString('es-ES'),
          p.numero_comprobante || '',
          `$${getMonto(p).toFixed(2)}`,
          p.estado || 'pendiente'
        ]),
        headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 4: { halign: 'right' } },
        didParseCell: (data: any) => {
          if (data.column.index === 5 && data.section === 'body') {
            if (data.cell.raw === 'verificado') data.cell.styles.textColor = [22, 163, 74];
            if (data.cell.raw === 'rechazado') data.cell.styles.textColor = [220, 38, 38];
          }
        }
      });
    }

    doc.save(`TH-Control-Reporte-${period}.pdf`);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Reportes Financieros</h1>
        <button
          onClick={generatePDF}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Download size={20} /> Descargar PDF
        </button>
      </div>

      <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700">Tipo de Reporte</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white font-bold">
              <option value="month">Mensual</option>
              <option value="year">Anual</option>
              <option value="street">Por Calle</option>
            </select>
          </div>
          {filterType === 'month' && (
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Mes</label>
              <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white" />
            </div>
          )}
          {filterType === 'year' && (
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Año</label>
              <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white" min="2020" max="2030" />
            </div>
          )}
          {filterType === 'street' && (
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">Calle</label>
              <select value={selectedStreet} onChange={(e) => setSelectedStreet(e.target.value)} className="w-full p-3 rounded-xl border-2 border-gray-300 focus:border-yellow-500 focus:outline-none bg-white">
                <option value="">Selecciona una calle</option>
                {streets.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Ingresos Totales" value={`$${totalIncome.toFixed(2)}`} icon={<DollarSign size={32} />} color="bg-emerald-500" />
        <StatCard title="Gastos Totales" value={`$${totalExpenses.toFixed(2)}`} icon={<TrendingUp size={32} />} color="bg-red-500" />
        <StatCard title="Balance" value={`$${balance.toFixed(2)}`} icon={<DollarSign size={32} />} color={balance >= 0 ? 'bg-yellow-500' : 'bg-red-500'} />
      </div>

      <div className="bg-gray-200 rounded-2xl p-6 mb-8 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Gastos por Categoría</h2>
        <div className="space-y-4">
          {Object.entries(expensesByCategory).length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay gastos en este período</p>
          ) : (
            Object.entries(expensesByCategory).map(([cat, amount]: any) => {
              const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800">{cat}</span>
                    <span className="text-slate-600">${amount.toFixed(2)} USD ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-gray-200 rounded-2xl p-6 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Pagos por Casa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
          {paymentsByCasa.map(casa => (
            <div key={casa.id} className="bg-white rounded-xl p-4 border border-gray-300 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{casa.name}</h3>
                  <p className="text-xs text-slate-500">{casa.street}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-600">${casa.total.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">USD</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-200 rounded-2xl p-6 mt-8 border-2 border-gray-300">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Últimos Movimientos</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {[...filteredData.payments.slice(0,10).map((p:any) => ({...p, _type:'payment'})),
            ...filteredData.expenses.slice(0,10).map((e:any) => ({...e, _type:'expense'}))]
            .sort((a:any, b:any) => new Date(getDate(b) || b.fecha_gasto || '').getTime() - new Date(getDate(a) || a.fecha_gasto || '').getTime())
            .slice(0,15)
            .map((item:any) => {
              const isPayment = item._type === 'payment';
              return (
                <div key={item.id} className="bg-white rounded-xl p-4 flex justify-between items-center border border-gray-300">
                  <div className="flex items-center gap-3">
                    <div className={`${isPayment ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'} w-10 h-10 rounded-lg flex items-center justify-center font-bold`}>
                      {isPayment ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {isPayment ? `${getCasa(item)} - ${item.tipo_cuota || item.paymentType}` : (item.descripcion || item.concept)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        {new Date(getDate(item) || item.fecha_gasto || '').toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  <p className={`font-bold ${isPayment ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPayment ? '+' : '-'}${getMonto(item).toFixed(2)} USD
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
      <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md`}>{icon}</div>
    </div>
    <h3 className="text-slate-600 text-sm font-bold mb-1">{title}</h3>
    <p className="text-3xl font-bold text-slate-800">{value}</p>
  </div>
);

export default Reports;

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';

export default function IncomeVsExpenseChart() {
  const { transactions } = useAppContext();

  const monthlyData = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[key]) {
      acc[key] = { 
        month: date.toLocaleString('es-AR', { month: 'short', year: '2-digit' }), 
        income: 0, 
        expense: 0 
      };
    }
    
    if (t.type === 'income') {
      acc[key].income += t.amount;
    } else {
      acc[key].expense += t.amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  const data = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md" style={{ minHeight: '350px' }}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No hay datos suficientes para mostrar la tendencia</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Ingresos vs Gastos</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" tickFormatter={(value) => `$${value / 1000}k`} />
          <Tooltip formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : '')} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="income" 
            name="Ingresos" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            name="Gastos" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
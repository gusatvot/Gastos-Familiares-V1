import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAppContext } from '../hooks/useAppContext';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899'];

export default function ExpenseDistributionChart() {
  const { transactions } = useAppContext();

  const data = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find((c) => c.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md" style={{ minHeight: '350px' }}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No hay gastos registrados para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Distribución de Gastos</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => (typeof value === 'number' ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value) : '')}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RouteOption, CURRENCY_SYMBOLS } from '../../types';

interface PriceComparisonChartProps {
    routes: RouteOption[];
}

// Transport type colors matching your theme
const TRANSPORT_COLORS: Record<string, string> = {
    FLIGHT: '#3b82f6', // Blue
    TRAIN: '#14b8a6',  // Teal
    BUS: '#10b981',    // Green
    CAR: '#f59e0b',    // Amber
    RIDESHARE: '#ec4899', // Pink
    TRANSIT: '#06b6d4', // Cyan
    BIKE: '#84cc16'    // Lime
};

const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({ routes }) => {
    // Transform routes data for chart
    const chartData = routes.map(route => ({
        name: route.type,
        price: route.totalCost,
        currency: route.currency,
        fill: TRANSPORT_COLORS[route.type] || '#6366f1'
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-xl p-3 backdrop-blur-xl shadow-xl">
                    <p className="text-white font-bold text-sm mb-1">{data.name}</p>
                    <p className="text-blue-400 font-black text-lg">
                        {CURRENCY_SYMBOLS[data.currency]}{data.price.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-black text-white mb-4">Price Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                        type="number"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                    <Bar dataKey="price" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PriceComparisonChart;

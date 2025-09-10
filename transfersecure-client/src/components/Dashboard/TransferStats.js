import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
    { name: "Viewed", value: 12 },
    { name: "Not Viewed", value: 3 },
];

const COLORS = ["#34d399", "#f59e0b"];

export default function TransferStats() {
    return (
        <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Transfer Statistics</h2>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

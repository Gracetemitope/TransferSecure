export default function StatsCard({ title, value }) {
    return (
        <div className="bg-white border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold">{value}</div>
            <p className="text-gray-600">{title}</p>
        </div>
    );
}

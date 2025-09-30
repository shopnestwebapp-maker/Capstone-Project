import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import {
    PieChart, Pie, BarChart, Bar, Area, ComposedChart, Line,
    Tooltip, XAxis, YAxis, AreaChart,
    ResponsiveContainer, Cell
} from "recharts";

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        axios.get("/api/analytics/summary", { withCredentials: true })
            .then(res => setAnalytics(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!analytics) return <p>Loading analytics...</p>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">📊 My Dashboard</h1>
                <Link
                    to="/customer/profile"
                    className="px-4 py-2 text-sm font-medium rounded-md text-black bg-blue-100 hover:bg-blue-70 transition-colors duration-200"
                >
                    Bact to My Profile
                </Link>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 shadow rounded">💰 Total Spend: ₹{analytics.totalSpend}</div>
                <div className="bg-white p-4 shadow rounded">🎁 Discounts: ₹{analytics.savings.discounts}</div>
                <div className="bg-white p-4 shadow rounded">⭐ Redeemed Points: {analytics.savings.redeemedPoints}</div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 shadow rounded">
                    <h2 className="font-semibold mb-2">Monthly Spend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={analytics.monthlySpend}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" barSize={30} fill="#60a5fa" />
                            <Line type="monotone" dataKey="amount" stroke="#1e40af" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-4 shadow rounded">
                    <h2 className="font-semibold mb-2">Top Categories</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analytics.topCategories}
                                dataKey="total_qty"
                                nameKey="category"
                                outerRadius={100}
                                fill="#8884d8"
                                label={(entry) => entry.category}
                            >
                                {analytics.topCategories.map((entry, i) => (
                                    <Cell
                                        key={`cell-${i}`}
                                        fill={["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} items`, "Quantity"]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
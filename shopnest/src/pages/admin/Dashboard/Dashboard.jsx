import { useEffect, useState } from 'react';
import axios from 'axios';
import StatsCard from '../../../components/admin/StatsCard';
import { ChartBarIcon, ShoppingBagIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalEarnings: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    const apiBaseUrl = import.meta.env.VITE_API;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${apiBaseUrl}/api/admin/dashboard`);
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [apiBaseUrl]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={ShoppingBagIcon}
                    color="blue"
                />
                <StatsCard
                    title="Total Categories"
                    value={stats.totalCategories}
                    icon={ChartBarIcon}
                    color="green"
                />
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={UsersIcon}
                    color="purple"
                />
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={CurrencyDollarIcon}
                    color="yellow"
                />
                <StatsCard
                    title="Total Earnings"
                    value={`$${stats.totalEarnings}`}
                    icon={CurrencyDollarIcon}
                    color="emerald"
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.recentOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total_amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

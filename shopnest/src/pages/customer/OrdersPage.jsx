import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    CheckCircleIcon,
    TruckIcon,
    HomeIcon
} from '@heroicons/react/24/outline';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/api/orders');
                setOrders(res.data);
            } catch (err) {
                setError('Failed to load orders',err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'processing':
                return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
            case 'shipped':
                return <TruckIcon className="h-5 w-5 text-purple-500" />;
            case 'delivered':
                return <HomeIcon className="h-5 w-5 text-green-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    // const getStatusColor = (status) => {
    //     switch (status) {
    //         case 'pending':
    //             return 'bg-yellow-100 text-yellow-800';
    //         case 'processing':
    //             return 'bg-blue-100 text-blue-800';
    //         case 'shipped':
    //             return 'bg-purple-100 text-purple-800';
    //         case 'delivered':
    //             return 'bg-green-100 text-green-800';
    //         default:
    //             return 'bg-gray-100 text-gray-800';
    //     }
    // };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading orders...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                    <Link
                        to="/customer"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Shop Now
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-600">Order #{order.id}</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ₹{getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex py-4 border-b border-gray-100 last:border-0">
                                        <div className="flex-shrink-0 h-16 w-16 overflow-hidden rounded-md">
                                            <img
                                                src={item.image_url || 'https://via.placeholder.com/150'}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {item.name}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    ₹{Number(item.price) || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-gray-50 flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(order.status)}
                                    <span className="text-sm text-gray-600">
                                        {order.status === 'pending' && 'Your order is being processed'}
                                        {order.status === 'processing' && 'Your order is being prepared'}
                                        {order.status === 'shipped' && 'Your order is on the way'}
                                        {order.status === 'delivered' && 'Your order has been delivered'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-lg font-medium">₹{order.total_amount} </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
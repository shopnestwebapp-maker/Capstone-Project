import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    CheckCircleIcon,
    TruckIcon,
    HomeIcon,
    ShoppingCartIcon,
    XCircleIcon,
    ArrowUturnLeftIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Status colors
const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'shipped': return 'bg-purple-100 text-purple-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'returned': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Status icons
const getStatusIcon = (status) => {
    switch (status) {
        case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
        case 'processing': return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
        case 'shipped': return <TruckIcon className="h-5 w-5 text-purple-500" />;
        case 'delivered': return <HomeIcon className="h-5 w-5 text-green-500" />;
        case 'cancelled': return <XCircleIcon className="h-5 w-5 text-red-500" />;
        case 'returned': return <ArrowUturnLeftIcon className="h-5 w-5 text-orange-500" />;
        default: return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/api/orders');
                setOrders(res.data);
                setFilteredOrders(res.data);
            } catch (err) {
                setError('Failed to load orders. Please try again later.', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === activeTab));
        }
    }, [activeTab, orders]);

    const handleTabClick = (tab) => setActiveTab(tab);

    const handleCancelOrder = async () => {
        if (!orderToCancel) return;
        try {
            await axios.put(`/api/admin/orders/${orderToCancel.id}/status`, { status: 'cancelled' });
            setOrders(orders.map(order =>
                order.id === orderToCancel.id ? { ...order, status: 'cancelled' } : order
            ));
            toast.success('Order cancelled successfully!');
        } catch (err) {
            toast.error('Failed to cancel order. Please try again.', err);
        } finally {
            setShowModal(false);
            setOrderToCancel(null);
        }
    };

    const handleReturnOrder = async (order) => {
        if (!order) return;
        try {
            await axios.put(`/api/admin/orders/${order.id}/status`, { status: 'returned' });
            setOrders(orders.map(o =>
                o.id === order.id ? { ...o, status: 'returned' } : o
            ));
            toast.success('Order Returned Requested!');
        } catch (err) {
            toast.error(`Failed to return order. ${err.message || ''}`);
        }
    };

    const toggleOrderDetails = (orderId) =>
        setExpandedOrder(expandedOrder === orderId ? null : orderId);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Loading orders...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
            <ToastContainer position="top-right" autoClose={3000} />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex flex-wrap space-x-4 sm:space-x-8" aria-label="Tabs">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={`${activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({orders.filter(o => tab === 'all' || o.status === tab).length})
                        </button>
                    ))}
                </nav>
            </div>

            {/* Orders */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg shadow-inner">
                    <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-2 text-xl font-medium text-gray-900">
                        No {activeTab !== 'all' && activeTab} orders found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {activeTab === 'all' ? "You haven't placed any orders yet." : `You have no ${activeTab} orders.`}
                    </p>
                    <div className="mt-6">
                        <Link
                            to="/customer"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Order header */}
                            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                                <div className="flex items-center space-x-4">
                                    <span className="text-gray-600 font-medium">Order #{order.id}</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => { setOrderToCancel(order); setShowModal(true); }}
                                            className="ml-2 inline-flex items-center px-3 py-1 text-xs font-medium rounded-full shadow-sm text-red-700 bg-red-100 hover:bg-red-200"
                                        >
                                            <XCircleIcon className="h-4 w-4 mr-1" />
                                            Cancel
                                        </button>
                                    )}
                                    {order.status === 'delivered' && (
                                        <button
                                            onClick={() => handleReturnOrder(order)}
                                            className="ml-2 inline-flex items-center px-3 py-1 text-xs font-medium rounded-full shadow-sm text-orange-700 bg-orange-100 hover:bg-orange-200"
                                        >
                                            <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                                            Return
                                        </button>
                                    )}
                                    <button onClick={() => toggleOrderDetails(order.id)} className="ml-2 p-1 text-gray-500 hover:text-gray-900 transition-transform duration-200">
                                        {expandedOrder === order.id ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Expandable details */}
                            {expandedOrder === order.id && (
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="font-bold text-gray-700">Shipping Address</p>
                                            <p className="text-sm text-gray-600">{order.shipping_address || 'Address not available'}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-700">Payment Details</p>
                                            <p className="text-sm text-gray-600">Payment Method: {order.payment_method || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div className="p-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex py-4 border-b border-gray-100 last:border-0 items-center">
                                        <div className="flex-shrink-0 h-16 w-16 overflow-hidden rounded-md">
                                            <img
                                                src={item.image_url || 'https://via.placeholder.com/150'}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                                    <p className="mt-1 text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 mt-2 sm:mt-0">
                                                    ₹{Number(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(order.status)}
                                    <span className="text-sm text-gray-600">
                                        {order.status === 'pending' && 'Your order is being processed'}
                                        {order.status === 'processing' && 'Your order is being prepared'}
                                        {order.status === 'shipped' && 'Your order is on the way'}
                                        {order.status === 'delivered' && 'Your order has been delivered'}
                                        {order.status === 'cancelled' && 'This order has been cancelled'}
                                        {order.status === 'returned' && 'This order was returned'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Subtotal: ₹{Number(order.subtotal).toFixed(2)}</p>
                                    {order.discount > 0 && (
                                        <p className="text-sm text-green-600">Discount: -₹{Number(order.discount).toFixed(2)}</p>
                                    )}
                                    <p className="text-lg font-semibold">Total: ₹{Number(order.total).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <div className="text-center">
                            <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Cancel Order?</h3>
                            <p className="text-sm text-gray-500">Are you sure you want to cancel this order?</p>
                        </div>
                        <div className="mt-5 sm:grid sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="w-full bg-red-600 px-4 py-2 text-base font-medium text-white rounded-md hover:bg-red-700"
                                onClick={handleCancelOrder}
                            >
                                Cancel Order
                            </button>
                            <button
                                type="button"
                                className="w-full border border-gray-300 bg-white px-4 py-2 text-base font-medium rounded-md hover:bg-gray-50 mt-3 sm:mt-0"
                                onClick={() => setShowModal(false)}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

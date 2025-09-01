import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(0);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axios.get('/api/cart');
                setCart(res.data);
            } catch (err) {
                setError('Failed to load cart',err);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            await axios.put(`/api/cart/update/${itemId}`, { quantity: newQuantity });
            const res = await axios.get('/api/cart');
            setCart(res.data);
        } catch (err) {
            setError('Failed to update quantity',err);
        }
    };
    useEffect(() => {
        const fetchQuantity = async () => {
            axios.get('/api/cart/count', { withCredentials: true })
                .then(res => setQuantity(res.data.count))
                .catch(err => console.error('Error fetching cart count:', err));
            const id = setInterval(() => {
                axios.get('/api/cart/count', { withCredentials: true })
                    .then(res => setQuantity(res.data.count))
                    .catch(err => console.error('Error fetching cart count:', err));
            }, 1000);
            return () => clearInterval(id);
        };
        fetchQuantity();
        },[]
            
    );
    const removeItem = async (itemId) => {
        try {
            await axios.delete(`/api/cart/remove/${itemId}`);
            const res = await axios.get('/api/cart');
            setCart(res.data);
        } catch (err) {
            setError('Failed to remove item',err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading cart...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {cart?.items?.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                    <Link
                        to="/customer"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {cart?.items?.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-md" src={item.image_url} alt={item.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ₹{Number(item.price) || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                    className="border border-gray-300 rounded-md px-2 py-1"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
                        <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">
                                    ₹{cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">₹0.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">₹0.00</span>
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-lg font-bold">
                                    ₹{cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Link
                            to="/customer/checkout"
                            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center block"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
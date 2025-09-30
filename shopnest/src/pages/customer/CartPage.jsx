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
                setError('Failed to load cart');
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
            setError('Failed to update quantity');
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
    }, []

    );
    const removeItem = async (itemId) => {
        try {
            await axios.delete(`/api/cart/remove/${itemId}`);
            const res = await axios.get('/api/cart');
            setCart(res.data);
        } catch (err) {
            setError('Failed to remove item');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-lg text-gray-700">Loading your cart...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800 tracking-wide">Your Shopping Cart</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            {cart?.items?.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500 mb-6 text-xl">Your cart is empty 🙁</p>
                    <Link
                        to="/customer"
                        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        {cart?.items?.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between">
                                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                                    <div className="flex-shrink-0 h-16 w-16">
                                        <img className="h-full w-full object-cover rounded-md border border-gray-200" src={item.image_url} alt={item.name} />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="text-lg font-semibold text-gray-900">{item.name}</div>
                                        <div className="text-gray-500">₹{Number(item.price) || 0}</div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</label>
                                        <select
                                            id={`quantity-${item.id}`}
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="font-bold text-gray-800 w-24 text-center">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                        aria-label="Remove item"
                                    >
                                        <TrashIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8 h-fit">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
                        <div className="space-y-4 text-gray-600">
                            <div className="flex justify-between items-center">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Shipping</span>
                                <span className="font-semibold text-gray-900">₹0.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Tax</span>
                                <span className="font-semibold text-gray-900">₹0.00</span>
                            </div>
                            <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-800">Total</span>
                                <span className="text-xl font-bold text-gray-800">
                                    ₹{cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <Link
                            to="/customer/checkout"
                            className="mt-8 w-full block text-center bg-blue-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
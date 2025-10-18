import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PaymentPage from './PaymentPage';
import { FaCreditCard, FaPaypal, FaMoneyBillWave } from 'react-icons/fa'; // Added for icons

export default function CheckoutPage() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [availablePoints, setAvailablePoints] = useState(0);
    const [redeemPoints, setRedeemPoints] = useState(0);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        paymentMethod: 'credit_card'
    });

    useEffect(() => {
        const fetchCartAndPoints = async () => {
            try {
                const [cartRes, pointsRes] = await Promise.all([
                    axios.get('/api/cart'),
                    axios.get('/api/rewards/')
                ]);
                setCart(cartRes.data);
                setAvailablePoints(pointsRes.data.points || 0);
            } catch (err) {
                setError('Failed to load checkout data',err);
            } finally {
                setLoading(false);
            }
        };
        fetchCartAndPoints();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRedeemChange = (e) => {
        const value = parseInt(e.target.value, 10) || 0;
        const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
        setRedeemPoints(Math.min(value, availablePoints, subtotal));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'UPI') {
            // Redirect to payment page
            navigate('/customer/payment', { state: { formData, redeemPoints, cart } });
            return;
        }

        try {
            await axios.post('/api/orders/create', {
                ...formData,
                redeemPoints
            });
            navigate('/customer/orders');
        } catch (err) {
            setError('Failed to place order. Please try again.',err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen font-sans text-gray-800">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 p-8 font-sans">{error}</div>;
    }

    const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const discount = redeemPoints;
    const finalTotal = Math.max(subtotal - discount, 0);

    const paymentMethods = [
        { id: 'credit_card', name: 'Credit Card', icon: <FaCreditCard className="mr-2 text-gray-600" /> },
        { id: 'UPI', name: 'UPI'},
        { id: 'cod', name: 'Cash on Delivery', icon: <FaMoneyBillWave className="mr-2 text-gray-600" /> }
    ];

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-8">
            <div className="container mx-auto max-w-7xl">
                <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">Checkout</h1>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 shadow-sm" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left side: Shipping + Payment */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 h-fit">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Shipping Information</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        id="zip"
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleInputChange}
                                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">Payment Method</h2>
                                <div className="space-y-3">
                                    {paymentMethods.map(method => (
                                        <label key={method.id} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200">
                                            <input
                                                id={method.id}
                                                name="paymentMethod"
                                                type="radio"
                                                value={method.id}
                                                checked={formData.paymentMethod === method.id}
                                                onChange={handleInputChange}
                                                className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <span className="ml-3 block text-base font-medium text-gray-700 flex items-center">
                                                {method.icon}
                                                {method.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                                >
                                    Place Order
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right side: Order Summary */}
                    <div className="bg-white rounded-xl shadow-lg p-8 h-fit">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
                        <div className="space-y-6">
                            {cart?.items?.map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-4 last:border-b-0">
                                    <div className="flex items-center">
                                        <img className="h-16 w-16 rounded-lg object-cover shadow-sm" src={item.image_url} alt={item.name} />
                                        <div className="ml-4">
                                            <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-base font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}

                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Available Points</span>
                                    <span className="font-semibold">{availablePoints}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-gray-700">Redeem Points</label>
                                    <input
                                        type="number"
                                        value={redeemPoints}
                                        min="0"
                                        max={availablePoints}
                                        onChange={handleRedeemChange}
                                        className="w-28 border border-gray-300 rounded-lg px-3 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                    />
                                </div>
                                {redeemPoints > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>- ₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-xl font-extrabold text-blue-600">₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
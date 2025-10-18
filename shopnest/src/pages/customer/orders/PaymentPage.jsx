import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

export default function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { formData, redeemPoints, cart } = location.state || {}; 

    useEffect(() => {
        // Redirect back if page accessed directly without checkout data
        if (!formData || !cart) {
            navigate('/checkout');
        }
    }, [formData, cart, navigate]);

    if (!formData || !cart) return null;

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalTotal = Math.max(subtotal - redeemPoints, 0);

    const handlePaymentConfirm = async () => {
        try {
            await axios.post('/api/orders/create', {
                ...formData,
                redeemPoints,
                paymentStatus: 'paid'
            });
            navigate('/customer/orders');
        } catch (err) {
            alert('Payment failed. Please try again.',err);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex justify-center items-center p-6 font-sans">
            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8">
                <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
                    Payment Page
                </h1>

                <div className="space-y-4 mb-6 text-gray-700">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Payment Method:</strong> {formData.paymentMethod}</p>
                    <p><strong>Redeemed Points:</strong> {redeemPoints}</p>
                    <p><strong>Total Amount:</strong> ₹{finalTotal.toFixed(2)}</p>
                </div>

                <button
                    onClick={handlePaymentConfirm}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                    Confirm Payment
                </button>

                <button
                    onClick={() => navigate(-1)}
                    className="w-full mt-3 bg-gray-200 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}

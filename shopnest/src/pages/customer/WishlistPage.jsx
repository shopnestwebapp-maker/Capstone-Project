import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { HeartIcon, TrashIcon, BellIcon, PencilIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [alertLoading, setAlertLoading] = useState({});
    const [alertSuccess, setAlertSuccess] = useState({});

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const wishlistRes = await axios.get('/api/wishlist');
                const wishlistData = wishlistRes.data;

                const alertsRes = await axios.get('/api/price-alerts');
                const alertsData = alertsRes.data;

                // Map alerts by product_id
                const alertsMap = {};
                alertsData.forEach(alert => {
                    alertsMap[alert.product_id] = alert;
                });

                setAlertSuccess(alertsMap);
                setWishlist(wishlistData);

            } catch (err) {
                console.log(err);
                setError(err.response?.data?.message || 'Failed to load wishlist');
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (productId) => {
        const prevWishlist = [...wishlist];
        setWishlist(wishlist.filter(item => item.product_id !== productId));
        try {
            await axios.delete(`/api/wishlist/remove/${productId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove item from wishlist');
            setWishlist(prevWishlist);
        }
    };

    const addPriceAlert = async (productId, targetPrice) => {
        setAlertLoading(prev => ({ ...prev, [productId]: true }));
        setAlertSuccess(prev => ({ ...prev, [productId]: null }));
        try {
            const res = await axios.post('/api/price-alerts', { product_id: productId, target_price: targetPrice });
            setAlertSuccess(prev => ({ ...prev, [productId]: res.data }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set price alert');
        } finally {
            setAlertLoading(prev => ({ ...prev, [productId]: false }));
            window.location.reload();
        }
    };

    const saveModifiedAlert = async (alertId, productId, newTargetPrice) => {
        if (!alertId) return;
        setAlertLoading(prev => ({ ...prev, [productId]: true }));
        try {
            const res = await axios.put(`/api/price-alerts/${alertId}`, { target_price: newTargetPrice });
            setAlertSuccess(prev => ({ ...prev, [productId]: res.data }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to modify price alert');
        } finally {
            setAlertLoading(prev => ({ ...prev, [productId]: false }));
            window.location.reload();
        }
    };

    const deleteAlert = async (alertId, productId) => {
        if (!alertId) return;
        setAlertLoading(prev => ({ ...prev, [productId]: true }));
        try {
            await axios.delete(`/api/price-alerts/${alertId}`);
            setAlertSuccess(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete price alert');
        } finally {
            setAlertLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
            </div>
        );
    }

    const WishlistCard = ({ product }) => {
        const [targetPriceInput, setTargetPriceInput] = useState(product.price);
        const [isInputVisible, setIsInputVisible] = useState(false);
        const [isModifying, setIsModifying] = useState(false);

        const alert = alertSuccess[product.product_id];

        const handleSave = () => {
            if (isModifying) {
                saveModifiedAlert(alert?.id, product.product_id, targetPriceInput);
                setIsModifying(false);
            } else {
                addPriceAlert(product.product_id, targetPriceInput);
                setIsInputVisible(false);
            }
        };

        return (
            <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
                <Link to={`/customer/products/${product.product_id}`}>
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <img src={product.image_url || 'https://via.placeholder.com/300'} alt={product.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-gray-600 mt-1">₹{product.price}</p>
                    </div>
                </Link>

                {/* Top-right actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button onClick={() => removeFromWishlist(product.product_id)} className="bg-white p-2 rounded-full shadow-md hover:bg-red-100 hover:text-red-600" title="Remove from wishlist">
                        <TrashIcon className="h-5 w-5" />
                    </button>

                    {(!alert && !isInputVisible) && (
                        <button onClick={() => setIsInputVisible(true)} className="bg-white p-2 rounded-full shadow-md hover:bg-yellow-100 hover:text-yellow-600 flex items-center justify-center" title="Set price alert">
                            <BellIcon className="h-5 w-5" />
                        </button>
                    )}

                    {alert && (
                        <>
                            {!isModifying ? (
                                <button onClick={() => { setIsModifying(true); setTargetPriceInput(alert.target_price); }} className="bg-white p-2 rounded-full shadow-md hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center" title="Edit alert">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                            ) : (
                                <button onClick={handleSave} className={`bg-green-600 text-white p-2 rounded-full ${alertLoading[product.product_id] ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={alertLoading[product.product_id]} title="Save alert">
                                    {alertLoading[product.product_id] ? '...' : '✔'}
                                </button>
                            )}

                            <button onClick={() => deleteAlert(alert.id, product.product_id)} className="bg-white p-2 rounded-full shadow-md hover:bg-red-100 hover:text-red-600 flex items-center justify-center" title="Delete alert">
                                <XCircleIcon className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>

                {(isInputVisible || isModifying) && (
                    <div className="p-4 border-t mt-4 flex items-center justify-between">
                        <input
                            type="number"
                            value={targetPriceInput}
                            onChange={(e) => setTargetPriceInput(e.target.value)}
                            className="w-2/3 px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring focus:border-blue-300"
                            placeholder="Target Price"
                        />
                        {!isModifying && (
                            <button
                                onClick={handleSave}
                                className={`bg-blue-600 text-white px-4 py-1 rounded-md text-sm ml-2 ${alertLoading[product.product_id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={alertLoading[product.product_id]}
                            >
                                {alertLoading[product.product_id] ? 'Setting...' : 'Set'}
                            </button>
                        )}
                    </div>
                )}

                {alert && !isModifying && (
                    <div className="p-2 text-sm text-green-700 font-medium">
                        Alert set for ₹{alert.target_price}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            {wishlist.length === 0 ? (
                <div className="text-center py-12">
                    <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                    <Link to="/customer" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Browse Products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.map(item => <WishlistCard key={item.product_id} product={item} />)}
                </div>
            )}
        </div>
    );
}

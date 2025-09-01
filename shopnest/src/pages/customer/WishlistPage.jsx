import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { HeartIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await axios.get('/api/wishlist');
                setWishlist(res.data);
            } catch (err) {
                setError('Failed to load wishlist', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (productId) => {
        try {
            await axios.delete(`/api/wishlist/remove/${productId}`);
            setWishlist(wishlist.filter(item => item.id !== productId));
        } catch (err) {
            setError('Failed to remove item from wishlist', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading wishlist...</div>;
    }

    const WishlistCard = ({ product }) => (
        <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
            <Link to={`/customer/products/${product.product_id}`}>
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <img
                        src={product.image_url || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-gray-600 mt-1">₹{product.price}</p>
                </div>
            </Link>
            <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-100 hover:text-red-600"
                title="Remove from wishlist"
            >
                <TrashIcon className="h-5 w-5" />
            </button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {wishlist.length === 0 ? (
                <div className="text-center py-12">
                    <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                    <Link
                        to="/customer"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlist.map(item => (
                        <WishlistCard key={item.id} product={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

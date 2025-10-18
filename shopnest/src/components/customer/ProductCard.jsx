import { Link } from 'react-router-dom';
import { StarIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function ProductCard({ product }) {
    const [ratingData, setRatingData] = useState({ average_rating: 0, review_count: 0 });
    const [isInWishlist, setIsInWishlist] = useState(false); // Track wishlist status

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const res = await axios.get(`/api/products/${product.id}`);
                setRatingData({
                    average_rating: res.data.average_rating,
                    review_count: res.data.review_count
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchRatings();

        // Check if product is in wishlist
        const checkWishlist = async () => {
            try {
                const res = await axios.get('/api/wishlist', { withCredentials: true });
                const wishlistIds = res.data.map(item => item.product_id);
                setIsInWishlist(wishlistIds.includes(product.id));
            } catch (err) {
                console.error('Error fetching wishlist:', err);
            }
        };
        checkWishlist();
    }, [product.id]);

    const addToCart = async () => {
        try {
            await axios.post('/api/cart/add', { productId: product.id, quantity: 1 }, { withCredentials: true });
            alert('Product added to cart');
            window.location.reload();
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add to cart');
        }
    };

    const addToWishlist = async () => {
        try {
            if (isInWishlist) return; // already in wishlist
            await axios.post('/api/wishlist/add', { productId: product.id }, { withCredentials: true });
            setIsInWishlist(true);
            alert('Product added to wishlist');
        } catch (err) {
            console.error('Error adding to wishlist:', err);
            alert('Failed to add to wishlist');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link to={`/customer/products/${product.id}`} className="block">
                <div className="h-48 overflow-hidden">
                    <img
                        src={product.image_url || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>

                    <div className="flex items-center mb-2">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <StarIcon
                                    key={rating}
                                    className={`h-4 w-4 ${rating <= Math.round(ratingData.average_rating || 0)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>

                        <span className="text-xs text-gray-500 ml-1">
                            ({ratingData.review_count || 0} reviews)
                        </span>

                        {product.average_rating > 0 && (
                            <span className="ml-1 text-[11px] text-gray-500">
                                {Number(ratingData.average_rating).toFixed(1)} ★
                            </span>
                        )}
                    </div>

                    <p className="text-lg font-bold text-blue-600 mb-3">
                        ₹{Number(product.price) || 0}
                    </p>

                    <div className="flex justify-between items-center">
                        <button
                            className="text-gray-500 hover:text-red-500"
                            onClick={(e) => { e.preventDefault(); addToWishlist(); }}
                        >
                            <HeartIcon className={`h-5 w-5 ${isInWishlist ? 'text-red-500' : ''}`} />
                        </button>

                        <button
                            className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                            onClick={(e) => { e.preventDefault(); addToCart(); }}
                        >
                            <ShoppingCartIcon className="h-4 w-4 mr-1" />
                            <span className="text-sm">Add</span>
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
}

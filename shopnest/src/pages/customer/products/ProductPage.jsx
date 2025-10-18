import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    StarIcon,
    HeartIcon,
    ShoppingCartIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ArrowsRightLeftIcon
} from '@heroicons/react/24/solid';

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Review states
    const [reviews, setReviews] = useState([]);
    const [newStar, setNewStar] = useState(5);
    const [newText, setNewText] = useState('');
    const [reviewsLoading, setReviewsLoading] = useState(true);

    // Fetch product info
    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/products/${id}`);
            setProduct(res.data);
            setError('');
        } catch (err) {
            setError(err?.response?.data?.message || 'Product not found');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    // Fetch reviews
    const fetchReviews = async () => {
        try {
            const res = await axios.get(`/api/products/${id}/reviews`);
            setReviews(res.data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [id]);

    const addToCart = async () => {
        try {
            await axios.post('/api/cart/add', { productId: id, quantity }, { withCredentials: true });
            alert('Product added to cart');
            window.location.reload();
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add to cart');
        }
    };

    const addToWishlist = async () => {
        try {
            await axios.post('/api/wishlist/add', { productId: id }, { withCredentials: true });
            alert('Product added to wishlist');
            window.location.reload();
        } catch (err) {
            console.error('Error adding to wishlist:', err);
            alert('Failed to add to wishlist');
        }
    };

    const submitReview = async () => {
        if (!newText) return alert('Please enter a review text');
        try {
            await axios.post(
                `/api/products/${id}/reviews`,
                { star: newStar, text: newText },
                { withCredentials: true }
            );
            setNewText('');
            setNewStar(1);
            fetchReviews(); // refresh reviews
            fetchProduct(); // update average_rating and review_count
            alert('Review submitted!');
        } catch (err) {
            console.error('Error submitting review:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-600">{error}</div>;
    }

    // Calculate discount percentage if applicable
    let discount = null;
    if (product?.base_price && product.price < product.base_price) {
        discount = Math.round(((product.base_price - product.price) / product.base_price) * 100);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <img
                        src={product.image_url || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        className="w-full h-auto rounded-lg"
                    />
                </div>

                {/* Product Details */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <StarIcon
                                    key={rating}
                                    className={`h-5 w-5 ${rating <= Math.round(product.average_rating || 0)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-gray-600 ml-2">
                            ({product.review_count || 0} reviews)
                        </span>
                        {product.average_rating > 0 && (
                            <span className="ml-2 text-sm text-gray-500">
                                {Number(product.average_rating).toFixed(1)} / 5
                            </span>
                        )}
                    </div>

                    {/* Price + Comparison */}
                    <div className="mb-4">
                        <div className="flex items-baseline gap-3">
                            <p className="text-2xl font-bold text-blue-600">
                                ₹{Number(product.price) || 0}
                            </p>

                            {product.base_price && product.price < product.base_price && (
                                <p className="text-lg text-gray-500 line-through">
                                    ₹{product.base_price}
                                </p>
                            )}

                            {discount && (
                                <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                                    {discount}% OFF
                                </span>
                            )}
                        </div>

                        {product.base_price && (
                            <div className="flex items-center gap-2 mt-1">
                                {product.price > product.base_price && (
                                    <>
                                        <ArrowTrendingUpIcon className="h-5 w-5 text-red-600" />
                                        <p className="text-sm text-red-600 font-medium">
                                            Higher than base price (₹{product.base_price})
                                        </p>
                                    </>
                                )}

                                {product.price < product.base_price && (
                                    <>
                                        <ArrowTrendingDownIcon className="h-5 w-5 text-green-600" />
                                        <p className="text-sm text-green-600 font-medium">
                                            Lower than base price
                                        </p>
                                    </>
                                )}

                                {product.price === product.base_price && (
                                    <>
                                        <ArrowsRightLeftIcon className="h-5 w-5 text-gray-600" />
                                        <p className="text-sm text-gray-600 font-medium">
                                            Equal to base price (₹{product.base_price})
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-gray-700 mb-6">{product.description}</p>

                    <div className="mb-6">
                        <label htmlFor="quantity" className="block text-gray-700 mb-2">
                            Quantity
                        </label>
                        <select
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-2"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={addToCart}
                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                        >
                            <ShoppingCartIcon className="h-5 w-5 mr-2" />
                            Add to Cart
                        </button>

                        <button
                            onClick={addToWishlist}
                            className="bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300"
                            title="Add to wishlist"
                        >
                            <HeartIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium mb-2">Product Details</h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            <li>Stock: {product.stock_quantity} available</li>
                            <li>Free shipping on orders over $50</li>
                            <li>30-day return policy</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

                {/* Submit new review */}
                <div className="mb-6 p-4 border rounded-md bg-gray-50">
                    <h3 className="font-medium mb-2">Add your review</h3>
                    <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                className={`h-6 w-6 cursor-pointer ${star <= newStar ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                onClick={() => setNewStar(star)}
                            />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{newStar} / 5</span>
                    </div>
                    <textarea
                        className="w-full border border-gray-300 rounded-md p-2 mb-2"
                        rows={3}
                        placeholder="Write your review here..."
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                    />
                    <button
                        onClick={submitReview}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Submit Review
                    </button>
                </div>

                {/* Display reviews */}
                {reviewsLoading ? (
                    <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p className="text-gray-600">No reviews yet.</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((rev) => (
                            <div key={rev.id} className="border-b border-gray-200 pb-3">
                                <div className="flex items-center mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <StarIcon
                                            key={star}
                                            className={`h-5 w-5 ${star <= rev.review_star ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">
                                        {rev.user_name || 'Anonymous'}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-400">
                                        {new Date(rev.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700">{rev.review_text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

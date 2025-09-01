import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { StarIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

export default function ProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/api/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                setError('Product not found', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const addToCart = async () => {
        try {
            await axios.post('/api/cart/add', { productId: id, quantity }, { withCredentials: true });
            alert('Product added to cart');
        } catch (err) {
            console.error('Error adding to cart:', err);
            alert('Failed to add to cart');
        }
    };

    const addToWishlist = async () => {
        try {
            await axios.post('/api/wishlist/add', { productId: id }, { withCredentials: true });
            alert('Product added to wishlist');
        } catch (err) {
            console.error('Error adding to wishlist:', err);
            alert('Failed to add to wishlist');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-600">{error}</div>;
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

                    <div className="flex items-center mb-4">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <StarIcon
                                    key={rating}
                                    className={`h-5 w-5 ${rating <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-gray-600 ml-2">(24 reviews)</span>
                    </div>

                    <p className="text-2xl font-bold text-blue-600 mb-4"> ₹{Number(product.price) || 0}</p>

                    <p className="text-gray-700 mb-6">{product.description}</p>

                    <div className="mb-6">
                        <label htmlFor="quantity" className="block text-gray-700 mb-2">Quantity</label>
                        <select
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-2"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <option key={num} value={num}>{num}</option>
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
                            <li>Category: Electronics</li>
                            <li>Stock: {product.stock_quantity} available</li>
                            <li>Free shipping on orders over $50</li>
                            <li>30-day return policy</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
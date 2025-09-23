import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../../components/customer/ProductCard';


export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes] = await Promise.all([
                    axios.get('/api/products'),
                    axios.get('/api/categories')
                ]);
                setProducts(productsRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-xl font-semibold text-gray-700">Loading products...</div>;
    }

    return (
        <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-16 py-8">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24 rounded-3xl shadow-lg transform transition duration-500 hover:scale-105">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 animate-fadeIn">Welcome to ShopEasy! 🛍️</h1>
                    <p className="text-lg md:text-xl lg:text-2xl font-light mb-10 max-w-2xl mx-auto">Your one-stop shop for everything you love.</p>
                    {/* Updated button to an anchor tag for navigation */}
                    <a href="/customer/allproducts" className="inline-block bg-white text-blue-700 font-bold py-3 px-8 md:py-4 md:px-10 rounded-full shadow-xl hover:bg-gray-100 transition duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
                        Discover Deals
                    </a>
                </div>
            </section>

            {/* --- */}

            {/* Best Sellers Section */}
            <section>
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 border-b-2 border-blue-500 pb-2">
                    🔥 Our Top Picks
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(0, 4).map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* --- */}

            {/* Promotional Banner */}
            <section className="bg-gray-100 p-6 md:p-8 rounded-2xl shadow-inner flex flex-col md:flex-row items-center justify-between text-center md:text-left">
                <div className="mb-4 md:mb-0">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Exclusive Offer!</h3>
                    <p className="text-md md:text-lg text-gray-600">Get 20% off on your first order. Use code: <span className="font-mono bg-yellow-200 text-yellow-800 px-2 py-1 rounded">SHOP20</span></p>
                </div>
                <div>
                    <button className="bg-blue-600 text-white font-semibold py-2 px-6 md:py-3 md:px-8 rounded-full shadow-lg hover:bg-blue-700 transition duration-300">
                        Claim Your Discount
                    </button>
                </div>
            </section>

            {/* --- */}

            {/* Trending Products */}
            <section>
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 border-b-2 border-blue-500 pb-2">
                    ✨ Trending Now
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(4, 12).map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    );
}
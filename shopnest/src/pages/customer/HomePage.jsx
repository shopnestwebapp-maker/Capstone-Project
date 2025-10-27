import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../components/customer/ProductCard";
import { motion } from "framer-motion";

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes] = await Promise.all([
                    axios.get("/api/products"),
                    axios.get("/api/categories"),
                ]);
                setProducts(productsRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-xl font-semibold text-gray-700">
                Loading products...
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 md:px-4 lg:px-6 space-y-18 py-6">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-teal-400 via-blue-500 to-teal-600 text-white py-18 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 blur-3xl opacity-10"></div>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center relative z-10"
                >
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-sm">
                        Welcome to <span className="text-white">ShopNest</span> 🛍️
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Discover, shop, and save — powered by AI & smart personalization.
                    </p>
                    <a
                        href="/customer/allproducts"
                        className="inline-block bg-white text-teal-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-teal-50 transition duration-300 transform hover:scale-105"
                    >
                        Discover Deals
                    </a>
                </motion.div>
            </section>

            {/* Top Picks Section */}
            <section>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2"
                >
                    🔥 Our Top Picks
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(0, 4).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Offer Banner */}
            <motion.section
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-teal-50 to-blue-50 p-8 rounded-3xl shadow-inner flex flex-col md:flex-row items-center justify-between text-center md:text-left border border-teal-100"
            >
                <div>
                    <h3 className="text-3xl font-bold text-teal-700 mb-2">
                        🎁 Exclusive Offer
                    </h3>
                    <p className="text-gray-600 text-lg">
                        Get <span className="font-bold text-teal-700">20% OFF</span> your
                        first order — Use code:{" "}
                        <span className="font-mono bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                            SHOP20
                        </span>
                    </p>
                </div>
                <button className="mt-4 md:mt-0 bg-teal-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-teal-700 transition duration-300">
                    Claim Now
                </button>
            </motion.section>

            {/* Trending Section */}
            <section>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-2"
                >
                    ✨ Trending Now
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(4, 12).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </div>
    );
}

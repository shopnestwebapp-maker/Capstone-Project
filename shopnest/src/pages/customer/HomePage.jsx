import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../components/customer/ProductCard";
import { motion } from "framer-motion";

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [history, setHistory] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, historyRes, recRes] = await Promise.all([
                    axios.get("/api/products"),
                    axios.get("/api/user/history", { withCredentials: true }),
                    axios.get("/api/recommendations", { withCredentials: true }),
                ]);

                setProducts(productsRes.data);
                setHistory(historyRes.data);
                setRecommendations(recRes.data);
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
        <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-10 py-8">
            {/* Hero Section */}
            <section className="relative text-black rounded-3xl overflow-hidden flex flex-col md:flex-row items-center justify-between px-2 py-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 text-center"
                >
                    <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
                        Welcome to <span className="text-black">ShopNest</span> 🛍️
                    </h1>
                    <p className="text-lg text-gray-700 mb-4">
                        Discover, shop, and save — powered by AI personalization.
                    </p>
                    <a
                        href="/customer/allproducts"
                        className="inline-block bg-teal-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-teal-700 transition duration-300"
                    >
                        Discover Deals
                    </a>
                </motion.div>
            </section>

           

            {/* Recommended for You Section */}
            {recommendations.length > 0 && (
                <section>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"
                    >
                        💡 Recommended For You
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {recommendations.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Trending Section (Existing) */}
            <section>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2"
                >
                    ✨ Trending Now
                </motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {products.slice(4, 12).map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                        
                    ))}
                </div>
            </section> {/* Recently Viewed Section */}
            {history.length > 0 && (
                <section>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"
                    >
                        👀 Recently Viewed
                    </motion.h2>
                    <div className="overflow-x-auto flex gap-4 py-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                        {history.map((product) => (
                            <div className="min-w-[250px]" key={product.id}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

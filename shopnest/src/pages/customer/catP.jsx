import { useEffect, useState } from 'react';
import axios from 'axios';
import CategoryCard from '../../components/customer/CategoryCard';

export default function LandingPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoriesRes = await axios.get('/api/categories');
                setCategories(categoriesRes.data);

               
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data. Please try again later.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-gray-600">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-xl text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <section className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6  pb-2">Shop by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            </section>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../../components/customer/ProductCard';

export default function CategoryPage() {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoryRes, productsRes] = await Promise.all([
                    axios.get(`/api/categories/${id}`),
                    axios.get(`/api/products/categories/${id}`)
                ]);
                setCategory(categoryRes.data[0]);
                setProducts(productsRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{category?.name || 'Category'}</h1>
            {category?.description && (
                <p className="text-gray-600 mb-8">{category.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No products found in this category.</p>
                </div>
            )}
        </div>
    );
}
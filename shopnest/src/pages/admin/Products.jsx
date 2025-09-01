import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        stock_quantity: ''
    });

    // Search & filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [sortOrder, setSortOrder] = useState(''); // 'asc', 'desc', or ''

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get('/api/admin/products'),
                    axios.get('/api/admin/categories')
                ]);
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                setError('Failed to fetch data',err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/admin/products/', newProduct);
            setProducts([...products, res.data]);
            setNewProduct({
                name: '',
                description: '',
                price: '',
                category_id: '',
                image_url: '',
                stock_quantity: ''
            });
        } catch (err) {
            setError('Failed to add product',err);
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await axios.delete(`/api/admin/products/${id}`);
            setProducts(products.filter(prod => prod.id !== id));
        } catch (err) {
            setError('Failed to delete product',err);
        }
    };

    const filteredProducts = products
        .filter(product => {
            const matchesName = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = searchCategory
                ? String(product.category_id) === searchCategory
                : true;
            return matchesName && matchesCategory;
        })
        .sort((a, b) => {
            if (sortOrder === 'asc') return a.price - b.price;
            if (sortOrder === 'desc') return b.price - a.price;
            return 0;
        });

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading products...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Add Product Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-4">Add New Product</h2>
                <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={newProduct.name}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={newProduct.price}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={newProduct.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                name="category_id"
                                value={newProduct.category_id}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                            >
                                <option value="">Select a category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock_quantity"
                                value={newProduct.stock_quantity}
                                onChange={handleInputChange}
                                required
                                min="0"
                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input
                            type="url"
                            name="image_url"
                            value={newProduct.image_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Add Product
                    </button>
                </form>
            </div>

            {/* Search, Filter, Sort */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md"
                />
                <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">Sort by Price</option>
                    <option value="asc">Price: Low to High</option>
                    <option value="desc">Price: High to Low</option>
                </select>
            </div>

            {/* Products Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 text-sm text-gray-500">{product.id}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">${product.price}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{product.category_name || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{product.stock_quantity}</td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/admin/products/edit/${product.id}`}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

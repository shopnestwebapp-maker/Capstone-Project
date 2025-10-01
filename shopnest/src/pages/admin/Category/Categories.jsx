import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 6;

    const filteredCategories = categories.filter(category => {
        const matchesName = category.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesName;
    });

    const indexOfLastCategory = currentPage * productsPerPage;
    const indexOfFirstCategory = indexOfLastCategory - productsPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);
    const totalPages = Math.ceil(filteredCategories.length / productsPerPage);

    useEffect(() => {
        // Reset to page 1 when search query changes
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/admin/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError('Failed to fetch categories.');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) {
            setError('Category name cannot be empty.');
            return;
        }
        try {
            const res = await axios.post('/api/admin/categories', newCategory);
            setCategories([...categories, res.data]);
            setNewCategory({ name: '', description: '' });
            setError('');
        } catch (err) {
            console.error('Failed to add category:', err);
            setError('Failed to add category. Please try again.');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }
        try {
            await axios.delete(`/api/admin/categories/${id}`);
            setCategories(categories.filter(cat => cat.id !== id));
            setError('');
        } catch (err) {
            console.error('Failed to delete category:', err);
            setError('Failed to delete category. It may be in use by products.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse text-lg text-gray-500">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 bg-gray-100 min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Categories Management</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                    {error}
                </div>
            )}

            {/* Add Category Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Category</h2>
                <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={newCategory.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newCategory.description}
                                onChange={handleInputChange}
                                rows={2}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
                        Add Category
                    </button>
                </form>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentCategories.length > 0 ? (
                                currentCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{category.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{category.description || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center justify-center space-x-3">
                                                <Link
                                                    to={`/admin/categories/edit/${category.id}`}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-500 text-lg">
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredCategories.length > productsPerPage && (
                    <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                            Showing <span className="font-semibold">{indexOfFirstCategory + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastCategory, filteredCategories.length)}</span> of <span className="font-semibold">{filteredCategories.length}</span> results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`hidden sm:block px-4 py-2 rounded-md border text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${currentPage === totalPages || totalPages === 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
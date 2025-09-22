import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function EditCategory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await axios.get(`/api/categories/${id}`);
                setCategory(res.data[0]);
            } catch (err) {
                console.error("Failed to load category:", err);
                setError("Failed to load category. Please check the ID and try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/admin/categories/${id}`, {
                name: category.name,
                description: category.description
            });
            navigate("/admin/categories");
        } catch (err) {
            console.error("Failed to update category:", err);
            setError("Failed to update category. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin text-blue-500">
                    <ArrowPathIcon className="h-10 w-10" />
                </div>
                <p className="ml-4 text-lg text-gray-600">Loading category details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
                    <p className="font-semibold mb-2">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="bg-white px-6 py-4 rounded-lg shadow-md">
                    <p className="text-lg text-gray-600">No category found with this ID.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Edit Category</h1>
                <button
                    onClick={() => navigate("/admin/categories")}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Categories
                </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={category.name || ""}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={category.description || ""}
                        onChange={handleChange}
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/categories")}
                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
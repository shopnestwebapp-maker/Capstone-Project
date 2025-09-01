import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
                console.log("Fetched category:", res.data); // 👀 confirm shape
                setCategory(res.data[0]); // response is single object
            } catch (err) {
                setError("Failed to load category",err);
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
            setError("Failed to update category",err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!category) return <div>No category found</div>;

    return (
        <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-lg">
            <h1 className="text-xl font-bold mb-4">Edit Category</h1>
            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={category.name || ""}   // ✅ now works
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                        name="description"
                        value={category.description || ""}   // ✅ now works
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Update Category
                </button>
            </form>
        </div>
    );
}

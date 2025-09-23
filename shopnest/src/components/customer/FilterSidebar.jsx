import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function FilterSidebar({ filters, onFilterChange, onClose, categories }) {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Category
    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        const updatedCategories = checked
            ? [...localFilters.category, value]
            : localFilters.category.filter((cat) => cat !== value);
        const updatedFilters = { ...localFilters, category: updatedCategories };
        setLocalFilters(updatedFilters);
        onFilterChange(updatedFilters); // instant update
    };

    // Price
    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        const updatedFilters = {
            ...localFilters,
            price: { ...localFilters.price, [name]: Number(value) },
        };
        setLocalFilters(updatedFilters);
    };

    const handleApplyFilters = () => {
        onFilterChange(localFilters);
        if (onClose) onClose();
    };

    // Clear a single filter
    const handleClearFilter = (type, value) => {
        let updatedFilters = { ...localFilters };
        if (type === 'category') {
            updatedFilters.category = updatedFilters.category.filter(cat => cat !== value);
        }
        setLocalFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    // Clear all filters
    const handleClearAll = () => {
        const clearedFilters = { category: [], price: { min: '', max: '' } };
        setLocalFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    return (
        <div className="flex flex-col h-full bg-white p-6 rounded-3xl shadow-2xl md:shadow-none md:p-0 md:bg-transparent">
            {/* Header for mobile view */}
            <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                <button
                    onClick={onClose}
                    aria-label="Close filters"
                    className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <FiX size={24} />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {/* Applied Filters - Pill Tags */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Applied</h3>
                        {(localFilters.category.length > 0 || localFilters.price.min || localFilters.price.max) && (
                            <button
                                onClick={handleClearAll}
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {localFilters.category.map((cat, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full capitalize"
                            >
                                {cat}
                                <button
                                    onClick={() => handleClearFilter('category', cat)}
                                    className="ml-2 text-gray-500 hover:text-gray-700 transition"
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        ))}
                        {(localFilters.price.min > 0 || localFilters.price.max > 0) && (
                            <div className="inline-flex items-center bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                                {`$${localFilters.price.min || '0'} - $${localFilters.price.max || '∞'}`}
                                <button
                                    onClick={() => handleClearFilter('price', null)}
                                    className="ml-2 text-gray-500 hover:text-gray-700 transition"
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Categories Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                        Categories
                    </h3>
                    <div className="space-y-3">
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <label
                                    key={cat.id}
                                    className="flex items-center space-x-3 cursor-pointer group select-none"
                                >
                                    <input
                                        type="checkbox"
                                        value={cat.name}
                                        checked={localFilters.category.includes(cat.name)}
                                        onChange={handleCategoryChange}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 transition-colors duration-200 cursor-pointer"
                                    />
                                    <span className="text-base text-gray-800 capitalize group-hover:text-blue-600 transition-colors duration-200">
                                        {cat.name}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 italic">No categories available.</p>
                        )}
                    </div>
                </div>

                {/* Price Range Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
                        Price Range
                    </h3>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            name="min"
                            value={localFilters.price.min}
                            onChange={handlePriceChange}
                            placeholder="Min"
                            aria-label="Minimum price"
                            className="w-1/2 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                        <span className="text-gray-500 text-lg font-semibold">-</span>
                        <input
                            type="number"
                            name="max"
                            value={localFilters.price.max}
                            onChange={handlePriceChange}
                            placeholder="Max"
                            aria-label="Maximum price"
                            className="w-1/2 p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Sticky "Apply Filters" button at the bottom for mobile */}
            <div className="md:hidden sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <button
                    onClick={handleApplyFilters}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition transform hover:scale-[1.01] shadow-lg"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
}
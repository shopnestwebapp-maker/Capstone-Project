import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../components/customer/ProductCard';
import FilterSidebar from '../../components/customer/FilterSidebar';
import SkeletonCard from '../../components/customer/SkeletonCard';
import { FiFilter, FiChevronDown } from 'react-icons/fi';

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Initialize filters and sort from URL
    const [filters, setFilters] = useState({
        category: searchParams.get('categories') ? searchParams.get('categories').split(',') : [],
        price: [],
        color: [],
    });

    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

    // Fetch categories once
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories/');
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products whenever filters or sort change
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = {
                    sort,
                    categories: filters.category.join(','),
                    minPrice: filters.price.min,
                    maxPrice: filters.price.max,
                };
                console.log('Fetching products with params:', params);
                const response = await axios.get('/api/products/', { params });
                setProducts(response.data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        // Update URL query params
        setSearchParams({
            sort,
            categories: filters.category.join(','),
            minPrice: filters.price.min,
            maxPrice: filters.price.max,
        });

        fetchProducts();
    }, [filters, sort, setSearchParams]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
    };

    const toggleFilters = () => setShowFilters(!showFilters);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">All Products</h1>

            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                <div className="md:hidden">
                    <button onClick={toggleFilters} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition">
                        <FiFilter />
                        <span>Filters</span>
                    </button>
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                    <label htmlFor="sort-by" className="text-sm font-medium">Sort by:</label>
                    <div className="relative">
                        <select
                            id="sort-by"
                            value={sort}
                            onChange={handleSortChange}
                            className="block appearance-none w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm leading-tight focus:outline-none focus:ring focus:ring-gray-200"
                        >
                            <option value="newest">Newest</option>
                            <option value="low-to-high">Price: Low to High</option>
                            <option value="high-to-low">Price: High to Low</option>
                            <option value="top-rated">Top Rated</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <FiChevronDown />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Filter Sidebar */}
                <div className={`w-full md:w-1/4 ${showFilters ? 'block' : 'hidden'} md:block transition-all duration-300 ease-in-out`}>
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClose={toggleFilters}
                        categories={categories}
                    />
                </div>

                {/* Products Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}
                        </div>
                    ) : (
                        products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                <h3 className="text-2xl font-semibold mb-2">No products found.</h3>
                                <p>Try adjusting your filters or <a href="#" className="text-blue-500 hover:underline">browse other categories</a>.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

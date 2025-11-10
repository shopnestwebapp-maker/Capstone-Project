import { Link } from 'react-router-dom';
import {
    ShoppingCartIcon,
    HeartIcon,
    Bars3Icon,
    XMarkIcon,
    MagnifyingGlassIcon,
    UserCircleIcon,
    TrophyIcon // New import
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';

export default function Navbar({ user, onLogout }) {
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allItems, setAllItems] = useState([]); // products + categories

    // Initialize Fuse.js
    // Note: Fuse relies on allItems being populated, which happens in useEffect.
    // Re-initializing here outside of a memo or useEffect means it captures the initial empty allItems.
    // For large apps, consider memoizing fuse or initializing in an effect, but keeping it simple for this refactor.
    const fuse = new Fuse(allItems, {
        keys: [
            { name: 'name', weight: 0.7 },
            { name: 'category', weight: 0.3 }
        ],
        threshold: 0.4,
        includeScore: true,
    });

    // Fetch products + categories (LOGIC UNCHANGED)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    axios.get('/api/productss'),
                    axios.get('/api/categories')
                ]);

                const products = productsRes.data.map(p => ({
                    ...p,
                    type: 'product',
                    category: p.category_name || ''
                }));

                const categories = categoriesRes.data.map(c => ({
                    id: `cat-${c.id}`, // prefix to avoid clashes
                    name: c.name,
                    type: 'category'
                }));

                setAllItems([...products, ...categories]);
            } catch (err) {
                console.error('Error fetching products or categories:', err);
            }
        };
        fetchData();
    }, []);

    // Fetch cart count (LOGIC UNCHANGED)
    useEffect(() => {
        if (user) {
            const fetchCartCount = () => {
                axios.get('/api/cart/count', { withCredentials: true })
                    .then(res => setCartCount(res.data.count))
                    .catch(err => console.error('Error fetching cart count:', err));
            };

            fetchCartCount();
            const intervalId = setInterval(fetchCartCount, 50000);
            return () => clearInterval(intervalId);
        }
    }, [user]);

    // Search handler (LOGIC UNCHANGED)
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const results = fuse.search(query).map(result => result.item);
        setSearchResults(results);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            console.log("Searching for:", searchTerm);
            // In a real app, you would navigate to a search results page here.
            setSearchResults([]);
            // Close mobile search after submission
            setIsMobileSearchOpen(false);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isMobileSearchOpen) setIsMobileSearchOpen(false);
    };

    const toggleMobileSearch = () => {
        setIsMobileSearchOpen(!isMobileSearchOpen);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    // Render search results - UI REFINEMENT
    const renderSearchResults = () => (
        <ul className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-2xl max-h-72 overflow-y-auto z-50 animate-fade-in-down">
            {searchResults.length === 0 ? (
                <li className="px-4 py-3 text-gray-500 italic">No results found.</li>
            ) : (
                searchResults.map(item => (
                    <li key={item.id} className="border-b border-gray-100 last:border-b-0">
                        <Link
                            to={
                                item.type === 'product'
                                    ? `/customer/products/${item.id}`
                                    : `/customer/categories/${item.id.replace('cat-', '')}`
                            }
                            className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-blue-50 transition-colors duration-200"
                            onClick={() => { setSearchTerm(''); setSearchResults([]); setIsMobileSearchOpen(false); }}
                        >
                            {item.type === 'product'
                                ? <ShoppingCartIcon className="h-5 w-5 text-blue-500" />
                                : <Bars3Icon className="h-5 w-5 text-green-500" />
                            }
                            <span className="truncate">
                                {item.name}
                            </span>
                            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {item.type}
                            </span>
                        </Link>
                    </li>
                ))
            )}
        </ul>
    );

    return (
        <nav className="bg-white shadow-xl sticky top-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex justify-between items-center">

                    {/* Left side: Logo + Main Links */}
                    <div className="flex items-center space-x-6 lg:space-x-12">
                        <Link to="/customer" className="text-3xl font-extrabold text-blue-700 tracking-tight min-w-max">ShopNest</Link>
                        <div className="hidden lg:flex items-center space-x-8 font-medium">
                            <Link to="/customer" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600 py-1">Home</Link>
                            <Link to="/customer/categories" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600 py-1">Categories</Link>
                        </div>
                    </div>

                    {/* Middle: Desktop Search */}
                    <div className="flex-grow max-w-lg mx-4 hidden lg:block">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search products, categories, and more..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-4 pr-12 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </button>
                            {/* Desktop search results render under the input */}
                            {searchTerm.length > 0 && searchResults.length > 0 && renderSearchResults()}
                        </form>
                    </div>

                    {/* Right side: Icons + Auth */}
                    <div className="flex items-center space-x-1 md:space-x-3">

                        {/* Mobile search toggle (moved for better flow on small screens) */}
                        <button onClick={toggleMobileSearch} className="p-2 text-gray-600 hover:text-blue-600 lg:hidden rounded-full hover:bg-gray-100 transition-colors">
                            <MagnifyingGlassIcon className="h-6 w-6" />
                        </button>

                        {/* Rewards Icon */}
                        <Link to="/customer/rewards" className="p-2 text-gray-600 hover:text-blue-600 relative transition-colors duration-200 rounded-full hover:bg-gray-100">
                            <TrophyIcon className="h-6 w-6" />
                            <span className="sr-only">Rewards</span>
                        </Link>

                        {/* Wishlist */}
                        <Link to="/customer/wishlist" className="p-2 text-gray-600 hover:text-blue-600 relative transition-colors duration-200 rounded-full hover:bg-gray-100">
                            <HeartIcon className="h-6 w-6" />
                            <span className="sr-only">Wishlist</span>
                        </Link>

                        {/* Cart */}
                        <Link to="/customer/cart" className="p-2 text-gray-600 hover:text-blue-600 relative transition-colors duration-200 rounded-full hover:bg-gray-100">
                            <ShoppingCartIcon className="h-6 w-6" />
                            <span className="sr-only">Shopping Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform scale-90 ring-2 ring-white shadow-md animate-ping-once">{cartCount}</span>
                            )}
                        </Link>

                        {/* User Menu (Desktop) */}
                        {user ? (
                            <div className="relative group hidden md:block z-40">
                                <button className="flex items-center space-x-1 focus:outline-none p-2 pr-3 rounded-full hover:bg-gray-100 transition-colors duration-200 min-w-max">
                                    <UserCircleIcon className="h-7 w-7 text-blue-600" />
                                    <span className="text-gray-700 font-semibold text-sm hidden lg:inline">Hi, {user.username.split(' ')[0]}</span>
                                </button>
                                <div className="absolute right-0 hidden group-hover:block bg-white shadow-2xl rounded-lg border border-gray-100 mt-2 py-1 w-56 z-10 origin-top-right transition-all duration-300 ease-out transform scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                                    <p className="px-4 pt-2 pb-1 text-sm font-semibold text-gray-900 border-b border-gray-100 truncate">
                                        {user.username}
                                    </p>
                                    <Link to="/customer/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">My Profile</Link>
                                    <Link to="/customer/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200">My Orders</Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors duration-200">Sign Out</button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/customer/login" className="hidden md:block text-blue-600 hover:text-white font-semibold transition-colors duration-200 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-600 border border-blue-600 text-sm">Sign In</Link>
                        )}

                        {/* Mobile menu toggle */}
                        <div className="md:hidden">
                            <button onClick={toggleMobileMenu} className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none rounded-full hover:bg-gray-100 transition-colors">
                                {isMobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay/Container */}
            <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMobileSearchOpen ? 'max-h-60 opacity-100 py-3' : 'max-h-0 opacity-0 overflow-hidden'} bg-gray-50 border-t border-gray-200`}>
                <div className="w-full px-4 sm:px-6">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search for products or categories..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors">
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                        {/* Mobile search results render inside this container */}
                        {searchTerm.length > 0 && searchResults.length > 0 && renderSearchResults()}
                    </form>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'} bg-gray-50 border-t border-gray-200`}>
                <div className="flex flex-col space-y-2 px-4">
                    <Link to="/customer" className="mobile-menu-item" onClick={toggleMobileMenu}>🏠 Home</Link>
                    <Link to="/customer/categories" className="mobile-menu-item" onClick={toggleMobileMenu}>📂 Categories</Link>
                    <Link to="/customer/rewards" className="mobile-menu-item" onClick={toggleMobileMenu}>🏆 Rewards</Link>

                    <div className="pt-2 border-t border-gray-200 mt-2"></div>

                    {user ? (
                        <>
                            <Link to="/customer/profile" className="mobile-menu-item" onClick={toggleMobileMenu}>👤 My Profile</Link>
                            <Link to="/customer/orders" className="mobile-menu-item" onClick={toggleMobileMenu}>📦 My Orders</Link>
                            <button onClick={() => { onLogout(); toggleMobileMenu(); }} className="mobile-menu-item text-left text-red-500 hover:text-red-600">
                                ➡️ Sign Out
                            </button>
                        </>
                    ) : (
                        <Link to="/customer/login" className="mobile-menu-item text-blue-600 font-semibold" onClick={toggleMobileMenu}>🔑 Sign In</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

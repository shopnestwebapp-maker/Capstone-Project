import { Link } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Navbar({ user, onLogout }) {
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // New state for mobile search
    const [searchTerm, setSearchTerm] = useState('');

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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isMobileSearchOpen) setIsMobileSearchOpen(false); // Close search if menu opens
    };

    const toggleMobileSearch = () => {
        setIsMobileSearchOpen(!isMobileSearchOpen);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false); // Close menu if search opens
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            console.log("Searching for:", searchTerm);
            // Example: navigate(`/search?q=${searchTerm}`);
        }
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Left side: Logo and Main Links */}
                    <div className="flex items-center space-x-6 lg:space-x-12">
                        <Link to="/customer" className="text-2xl font-bold text-blue-600 font-display min-w-max">ShopNest</Link>
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/customer" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Home</Link>
                            <Link to="/customer/categories" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Categories</Link>
                        </div>
                    </div>

                    {/* Middle: Desktop Search Bar */}
                    <div className="flex-grow max-w-xl mx-4 hidden lg:block">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-12 py-2 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200">
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                    {/* Right side: Icons and User Auth */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Mobile Search Toggle */}
                        <div className="lg:hidden">
                            <button onClick={toggleMobileSearch} className="p-2 text-gray-700 hover:text-blue-600">
                                <MagnifyingGlassIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <Link to="/customer/wishlist" className="p-2 text-gray-700 hover:text-blue-600 relative transition-colors duration-200">
                            <HeartIcon className="h-6 w-6" />
                        </Link>

                        <Link to="/customer/cart" className="p-2 text-gray-700 hover:text-blue-600 relative transition-colors duration-200">
                            <ShoppingCartIcon className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-once">{cartCount}</span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative group hidden md:block">
                                <button className="flex items-center space-x-2 focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                    <UserCircleIcon className="h-6 w-6 text-gray-700" />
                                    <span className="text-gray-700 font-medium hidden lg:inline">Hi, {user.username.split(' ')[0]}!</span>
                                </button>
                                <div className="absolute right-0 hidden group-hover:block bg-white shadow-xl rounded-md mt-2 py-1 w-48 z-10 transition-all duration-300 ease-in-out transform scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100">
                                    <Link to="/customer/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200">My Profile</Link>
                                    <Link to="/customer/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200">My Orders</Link>
                                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200">Logout</button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/customer/login" className="hidden md:block text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 p-2 rounded-md hover:bg-gray-100">Login</Link>
                        )}

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={toggleMobileMenu} className="p-2 text-gray-700 hover:text-blue-600 focus:outline-none">
                                {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar (Conditionally Rendered) */}
            <div className={`lg:hidden ${isMobileSearchOpen ? 'block' : 'hidden'} bg-gray-50 border-t border-gray-200 py-4 transition-all duration-300 ease-in-out`}>
                <div className="w-full px-4">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Mobile Menu (Conditionally Rendered) */}
            <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-gray-50 border-t border-gray-200 py-4 transition-all duration-300 ease-in-out`}>
                <div className="flex flex-col items-center space-y-4">
                    <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" onClick={toggleMobileMenu}>Home</Link>
                    <Link to="/customer/categories" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" onClick={toggleMobileMenu}>Categories</Link>
                    {user ? (
                        <>
                            <Link to="/customer/profile" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" onClick={toggleMobileMenu}>My Profile</Link>
                            <Link to="/customer/orders" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" onClick={toggleMobileMenu}>My Orders</Link>
                            <button onClick={() => { onLogout(); toggleMobileMenu(); }} className="text-gray-700 hover:text-blue-600 transition-colors duration-200">Logout</button>
                        </>
                    ) : (
                        <Link to="/customer/login" className="text-gray-700 hover:text-blue-600 transition-colors duration-200" onClick={toggleMobileMenu}>Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
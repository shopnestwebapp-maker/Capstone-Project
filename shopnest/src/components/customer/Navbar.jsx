import { Link } from 'react-router-dom';
import { ShoppingCartIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Navbar({ user, onLogout }) {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        if (user) {
            axios.get('/api/cart/count', { withCredentials: true })
                .then(res => setCartCount(res.data.count))
                .catch(err => console.error('Error fetching cart count:', err));
                const id = setInterval(() => {
                axios.get('/api/cart/count', { withCredentials: true })
                    .then(res => setCartCount(res.data.count))
                    .catch(err => console.error('Error fetching cart count:', err));
                }, 50000);
            return () => clearInterval(id);
        }
        
    }, [user]
    );

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link to="/customer" className="text-2xl font-bold text-blue-600">ShopEasy</Link>

                    <div className="flex items-center space-x-4">
                        <Link to="/customer" className="text-gray-700 hover:text-blue-600">Home</Link>

                        <div className="relative group">
                            <button className="text-gray-700 hover:text-blue-600 flex items-center">
                                Categories
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 py-1 w-48 z-10">
                                <Link to="/customer/categories/1" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Electronics</Link>
                                <Link to="/customer/categories/2" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Clothing</Link>
                                <Link to="/customer/categories/3" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Books</Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/customer/wishlist" className="p-2 text-gray-700 hover:text-blue-600 relative">
                            <HeartIcon className="h-6 w-6" />
                        </Link>

                        <Link to="/customer/cart" className="p-2 text-gray-700 hover:text-blue-600 relative">
                            <ShoppingCartIcon className="h-6 w-6" />
                            <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>
                        </Link>

                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-1">
                                    <span className="text-gray-700">{user.username}</span>
                                    <UserIcon className="h-6 w-6 text-gray-700" />
                                </button>
                                <div className="absolute right-0 hidden group-hover:block bg-white shadow-lg rounded-md mt-2 py-1 w-48 z-10">
                                    <Link to="/customer/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                                    <Link to="/customer/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Orders</Link>
                                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/customer/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
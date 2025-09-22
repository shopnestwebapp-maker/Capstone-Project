import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && user?.role !== 'admin') {
            navigate('/admin/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="animate-pulse flex items-center space-x-2 text-gray-600 font-semibold">
                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar component */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main content and header wrapper */}
            <div className="flex-1 flex flex-col">
                {/* Navbar (Header) */}
                <header className="bg-white shadow-sm sticky top-0 z-40">
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            {/* Mobile menu button and Title */}
                            <div className="flex items-center space-x-4 md:space-x-6">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-md p-1"
                                >
                                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                                </button>
                                <h1 className="text-xl font-bold text-gray-800 hidden md:block">Admin Dashboard</h1>
                            </div>

                            {/* User profile dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                                >
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.username}</span>
                                    <img
                                        className="h-8 w-8 rounded-full ring-2 ring-gray-300 ring-offset-2"
                                        src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                        alt="User Avatar"
                                    />
                                    <ChevronDownIcon
                                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                {userMenuOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-48 bg-white shadow-xl ring-1 ring-black ring-opacity-5 rounded-md py-1 z-50 transform origin-top-right transition-transform scale-100"
                                        onMouseLeave={() => setUserMenuOpen(false)}
                                    >
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 font-semibold">
                                            Signed in as
                                            <div className="truncate text-blue-600 font-bold">{user.username}</div>
                                        </div>
                                        <button
                                            onClick={logout}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content area */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
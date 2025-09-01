import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

export default function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user?.role !== 'admin') {
            navigate('/admin/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Navbar */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-gray-800">Admin Panel</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {user && (
                                <div className="ml-4 relative">
                                    <button className="flex items-center text-sm rounded-full focus:outline-none">
                                        <span className="sr-only">Open user menu</span>
                                        <span className="mr-2">{user.username}</span>
                                        <img
                                            className="h-8 w-8 rounded-full"
                                            src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                            alt=""
                                        />
                                    </button>
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                                        <button
                                            onClick={logout}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
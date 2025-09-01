import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChartBarIcon,
    ShoppingBagIcon,
    TagIcon,
    UsersIcon,
    CogIcon,
    XMarkIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
        { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
        { name: 'Categories', href: '/admin/categories', icon: TagIcon },
        { name: 'Users', href: '/admin/users', icon: UsersIcon },
        { name: 'Orders', href: '/admin/orders', icon: CogIcon },
    ];

    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-semibold">Admin Panel</h1>
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30"
                        onClick={() => setSidebarOpen(false)}
                    />

                    {/* Sidebar panel */}
                    <div className="relative w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Menu</h2>
                            <button onClick={() => setSidebarOpen(false)}>
                                <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)} // close on click
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === item.href
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-6 w-6 flex-shrink-0 ${location.pathname === item.href
                                                ? 'text-blue-500'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 bg-white border-r border-gray-200">
                    <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <nav className="flex-1 px-2 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === item.href
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-6 w-6 flex-shrink-0 ${location.pathname === item.href
                                                ? 'text-blue-500'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}

import { Link, useLocation } from 'react-router-dom';
import {
    ChartBarIcon,
    ShoppingBagIcon,
    TagIcon,
    UsersIcon,
    CogIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

// The component now accepts `sidebarOpen` and `setSidebarOpen` as props
export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
        { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
        { name: 'Categories', href: '/admin/categories', icon: TagIcon },
        { name: 'Users', href: '/admin/users', icon: UsersIcon },
        { name: 'Orders', href: '/admin/orders', icon: CogIcon },
    ];

    return (
        <>
            {/* Mobile Sidebar (Slide-over effect) */}
            <div
                className={`fixed inset-y-0 left-0 z-50 flex md:hidden transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Overlay to close sidebar */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-30"
                    onClick={() => setSidebarOpen(false)}
                />

                {/* Mobile sidebar panel */}
                <div className="relative w-64 bg-white border-r border-gray-200 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)} // close sidebar on navigation
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${location.pathname === item.href
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-150 ${location.pathname === item.href
                                            ? 'text-white'
                                            : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Desktop Sidebar (Permanent) */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 bg-white border-r border-gray-200">
                    <div className="h-16 flex items-center px-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${location.pathname === item.href
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-6 w-6 flex-shrink-0 transition-colors duration-150 ${location.pathname === item.href
                                            ? 'text-white'
                                            : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
}
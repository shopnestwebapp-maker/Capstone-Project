import { Link, useLocation } from 'react-router-dom';
import {
    ChartBarIcon,
    ShoppingBagIcon,
    TagIcon,
    UsersIcon,
    CogIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
        { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
        { name: 'Categories', href: '/admin/categories', icon: TagIcon },
        { name: 'Users', href: '/admin/users', icon: UsersIcon },
        { name: 'Orders', href: '/admin/orders', icon: CogIcon },
    ];

    return (
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
                                    className={`mr-3 flex-shrink-0 h-6 w-6 ${location.pathname === item.href
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
    );
}
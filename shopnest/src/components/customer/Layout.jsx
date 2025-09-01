import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (
            !loading &&
            !user &&
            location.pathname !== '/customer/login' &&
            location.pathname !== '/customer/register'
        ) {
            navigate('/customer/login');
        }
    }, [user, loading, navigate, location.pathname]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} onLogout={logout} />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

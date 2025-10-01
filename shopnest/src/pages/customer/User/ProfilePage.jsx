import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircleIcon, ExclamationCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Note: This component is now responsible for its own layout, including the tabs.
export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const location = useLocation(); // Hook to get the current URL path
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                confirmPassword: ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            await axios.put('/api/profile', {
                email: formData.email,
                password: formData.password || undefined
            }, { withCredentials: true });

            const updatedUser = { ...user, email: formData.email };
            setUser(updatedUser);

            setSuccess('Profile updated successfully!');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-7xl w-full space-y-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-10">
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <Link
                            to="/customer/profile"
                            className={`
                                ${location.pathname === '/customer/profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                            `}
                        >
                            My Profile
                        </Link>
                        
                        <Link
                            to="/customer/Analytics"
                            className={`
                                ${location.pathname === '/customer/analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                            `}
                        >
                            Shopping Analysis
                        </Link>
                    </nav>
                </div>

                <div className="max-w-xl w-full mx-auto space-y-8 p-10 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex flex-col items-center">
                        <UserCircleIcon className="h-16 w-16 text-blue-500 mb-2" />
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            My Profile
                        </h1>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Update your account details and password.
                        </p>
                    </div>

                    {success && (
                        <div className="rounded-md bg-green-50 p-4 border border-green-200">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                                <p className="ml-3 text-sm font-medium text-green-800">{success}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <div className="flex items-center">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="username" className="sr-only">Username</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    disabled
                                    className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-not-allowed bg-gray-100"
                                    placeholder="Username"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">New Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-px"
                                    placeholder="New Password (leave blank to keep current)"
                                />
                            </div>
                            {formData.password && (
                                <div>
                                    <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-px"
                                        placeholder="Confirm New Password"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200
                                    ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    {loading && (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                </span>
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
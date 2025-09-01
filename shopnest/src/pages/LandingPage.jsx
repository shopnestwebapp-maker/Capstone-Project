import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Our E-commerce Store</h1>
                <p className="text-gray-600 mb-8">Please choose how you'd like to proceed:</p>

                <div className="space-y-4">
                    <Link
                        to="/customer"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    >
                        Continue to Customer Page
                    </Link>

                    <Link
                        to="/admin"
                        className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    >
                        Proceed to Admin Page
                    </Link>
                </div>
            </div>
        </div>
    );
}
export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">ShopEasy</h3>
                        <p className="text-gray-400">Your one-stop shop for all your needs.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="/customer" className="text-gray-400 hover:text-white">Home</a></li>
                            <li><a href="/customer/allproducts" className="text-gray-400 hover:text-white">Products</a></li>
                            <li><a href="/customer/categories" className="text-gray-400 hover:text-white">Categories</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Customer Service</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
                            <li><a href="/customer/orders" className="text-gray-400 hover:text-white">Returns</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Stay Connected</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                            <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                            <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} ShopEasy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
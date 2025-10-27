import { motion } from 'framer-motion';
import {
    ShoppingCartIcon,
    GiftIcon,
    BellAlertIcon,
    ChartPieIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';

// Simple reusable UI components
const Card = ({ children, className }) => (
    <div className={`rounded-2xl shadow-md bg-white p-6 ${className || ""}`}>{children}</div>
);
const CardContent = ({ children }) => <div>{children}</div>;

const Button = ({ children, className }) => (
    <button
        className={`px-4 py-1 bg-blue-600 hover:bg-teal-700 text-white rounded-xl transition ${className || ""}`}
    >
        {children}
    </button>
);

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function Showcase() {
    const data = [
        { month: 'Jan', spend: 4000 },
        { month: 'Feb', spend: 3000 },
        { month: 'Mar', spend: 5000 },
        { month: 'Apr', spend: 4780 },
        { month: 'May', spend: 5890 },
        { month: 'Jun', spend: 6390 },
    ];

    const features = [
        {
            icon: GiftIcon,
            title: 'Gamification & Rewards',
            desc: 'Earn points and unlock exciting rewards for every purchase you make on ShopNest.',
        },
        {
            icon: SparklesIcon,
            title: 'AI Recommendations',
            desc: 'Our AI engine learns your preferences and suggests the best products for you.',
        },
        {
            icon: ChartPieIcon,
            title: 'Spending Analysis',
            desc: 'Track your purchase patterns and manage your budget using visual insights.',
        },
        {
            icon: BellAlertIcon,
            title: 'Price Drop Alerts',
            desc: 'Get notified instantly when your favorite products go on sale.',
        },
        {
            icon: ShoppingCartIcon,
            title: 'Smart Shopping Experience',
            desc: 'Enjoy a smooth shopping journey with secure payments and fast delivery tracking.',
        },
        {
            icon: MagnifyingGlassIcon,
            title: 'Advanced Search',
            desc: 'Quickly find your desired products using intelligent search filters and fuzzy matching.',
        },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-800">
            {/* Hero Section */}
            <section className="text-center py-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl font-extrabold text-blue-700 mb-2"
                >
                    ShopNest
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-lg font-semibold text-teal-600 mb-6"
                >
                    An AI-Enhanced E-Commerce Platform
                </motion.p>
                <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8">
                    A smart online shopping system blending artificial intelligence, analytics,
                    and gamification to create a personalized experience.
                </p>
                <div className="flex justify-center gap-4">
                    <a href='/customer/'><Button>Explore Now</Button></a>
                    <a href='/admin/'><Button className="bg-teal text-teal-600 border border-teal-500 hover:bg-blue-50">
                        Admin Login
                    </Button></a>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-6 md:px-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="shadow-lg hover:shadow-xl border-none rounded-2xl">
                            <CardContent className="p-6 text-center">
                                <feature.icon className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                                <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm">{feature.desc}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </section>

            {/* About Section */}
            <section className="py-20 px-6 text-center max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-blue-700 mb-4">About ShopNest</h2>
                <p className="text-gray-600 leading-relaxed">
                    ShopNest is a next-generation e-commerce platform built using React, Node.js, and MySQL.
                    It enables users to explore, earn rewards, and receive intelligent product suggestions powered by AI.
                    The system also provides admins with tools for order management, analytics dashboards, and tracking
                    pending user activities — all wrapped in a secure, user-friendly design.
                </p>
            </section>

            {/* Footer
            <footer className="text-center py-6 bg-teal-600 text-white">
                <p>Made with ❤️ by Team 58 — SR University</p>
            </footer> */}
        </div>
    );
}

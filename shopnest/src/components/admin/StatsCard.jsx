import React from 'react';

export default function StatsCard({ title, value, icon: Icon, color }) {
    const colorClasses = {
        blue: 'from-blue-400 to-blue-600',
        green: 'from-green-400 to-green-600',
        purple: 'from-purple-400 to-purple-600',
        yellow: 'from-yellow-400 to-yellow-600',
        emerald: 'from-emerald-400 to-emerald-600',
    };

    return (
        <div className={`relative p-6 rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform transition-transform duration-300 hover:scale-105`}>
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-2xl`}></div>

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full bg-white bg-opacity-80 shadow-md`}>
                    <Icon className={`h-8 w-8 text-${color}-500`} />
                </div>
            </div>
        </div>
    );
}
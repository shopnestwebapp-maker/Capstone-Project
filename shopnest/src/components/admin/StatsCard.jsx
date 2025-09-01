import React from 'react';

const iconClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
};

export default function StatsCard({ title, value, icon: Icon, color = 'blue' }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${iconClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
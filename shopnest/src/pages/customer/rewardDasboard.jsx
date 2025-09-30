import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaSpinner, FaGift, FaUserCircle, FaTrophy, FaStar,FaHistory } from "react-icons/fa";

// Defines the loyalty tiers and their point thresholds
const tiers = [
    { name: "Bronze", minPoints: 0, color: "from-amber-700 to-amber-900", icon: "🥉" },
    { name: "Silver", minPoints: 1000, color: "from-gray-400 to-gray-600", icon: "🥈" },
    { name: "Gold", minPoints: 5000, color: "from-yellow-400 to-yellow-600", icon: "🥇" },
    { name: "Platinum", minPoints: 15000, color: "from-sky-400 to-sky-600", icon: "💎" },
];

const getTierInfo = (points) => {
    // Find the current tier based on points
    let currentTier = tiers[0];
    for (let i = 0; i < tiers.length; i++) {
        if (points >= tiers[i].minPoints) {
            currentTier = tiers[i];
        } else {
            break; // Stop when the next tier is too high
        }
    }

    const nextTier = tiers.find(tier => tier.minPoints > currentTier.minPoints);
    const pointsInCurrentTier = points - currentTier.minPoints;
    const pointsNeededForNext = nextTier ? nextTier.minPoints - currentTier.minPoints : 0;
    const pointsToNextTier = nextTier ? nextTier.minPoints - points : 0;
    const progress = pointsNeededForNext > 0 ? (pointsInCurrentTier / pointsNeededForNext) * 100 : 100;

    return {
        currentTier,
        nextTier,
        pointsToNextTier,
        progress: Math.min(100, progress), // Ensure it doesn't go over 100
    };
};

export default function RewardsDashboard() {
    const [points, setPoints] = useState(null);
    const [animatedPoints, setAnimatedPoints] = useState(0);
    const [error, setError] = useState(null);

    // Effect for fetching points and animating the counter
    useEffect(() => {
        axios.get("/api/rewards", { withCredentials: true })
            .then((res) => {
                setPoints(res.data.points);
            })
            .catch((err) => {
                setError("Failed to load rewards. Please try again.");
                console.error("API error:", err);
            });
    }, []);

    // Effect to animate the points counter
    useEffect(() => {
        if (points !== null) {
            const increment = points / 60;
            let currentPoints = 0;
            const timer = setInterval(() => {
                currentPoints += increment;
                if (currentPoints >= points) {
                    setAnimatedPoints(points);
                    clearInterval(timer);
                } else {
                    setAnimatedPoints(Math.ceil(currentPoints));
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [points]);

    if (error) {
        return (
            <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-lg mt-10 text-center text-red-600 font-sans">
                <p>{error}</p>
            </div>
        );
    }

    if (points === null) {
        return (
            <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-lg mt-10 text-center text-gray-500 font-sans">
                <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
                <p>Loading your rewards...</p>
            </div>
        );
    }

    const tierInfo = getTierInfo(points);

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8 font-sans">
            <div className="p-8 max-w-lg mx-auto bg-white rounded-3xl shadow-2xl mt-10 border border-gray-200">
                <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-6">
                    🌟 Rewards Dashboard
                </h2>

                {/* Loyalty Tier Card */}
                <div className={`relative p-6 rounded-2xl text-white text-center mb-8 shadow-xl transform transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r ${tierInfo.currentTier.color}`}>
                    <FaUserCircle className="absolute top-4 left-4 text-3xl opacity-70" />
                    <p className="text-sm font-semibold opacity-80">Your Current Tier</p>
                    <p className="text-4xl font-black mt-2 mb-1">{tierInfo.currentTier.name} {tierInfo.currentTier.icon}</p>
                    {tierInfo.nextTier ? (
                        <p className="text-sm">
                            You're just <span className="font-bold">{tierInfo.pointsToNextTier}</span> points away from **{tierInfo.nextTier.name}**!
                        </p>
                    ) : (
                        <p className="text-sm font-semibold">
                            You've reached the highest tier! Enjoy your exclusive benefits.
                        </p>
                    )}
                </div>

                {/* Main Points and Progress Section */}
                <div className="text-center mb-8">
                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-1000 ease-out">{animatedPoints}</p>
                    <p className="text-xl text-gray-600 mt-2">Total Points</p>
                </div>

                {/* Tier Progress Bar */}
                {tierInfo.nextTier && (
                    <div className="mb-8">
                        <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden shadow-inner">
                            <div
                                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000 ease-in-out"
                                style={{ width: `${tierInfo.progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-3 font-medium">
                            <span>{tierInfo.currentTier.minPoints} pts</span>
                            <span>{tierInfo.nextTier.minPoints} pts</span>
                        </div>
                    </div>
                )}

                {/* Benefits Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-blue-800 flex items-center mb-4">
                        <FaTrophy className="mr-2 text-blue-500" />
                        Loyalty Benefits
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li className="flex items-center">
                            <FaStar className="text-yellow-400 mr-2" /> {tierInfo.currentTier.name} Status
                        </li>
                        <li>Enjoy <b>free shipping on all orders.</b></li>
                        {tierInfo.nextTier && <li>Unlock <b>exclusive discounts</b> at the <b>{tierInfo.nextTier.name}tier!</b></li>}
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-4">
                    <Link to="/customer/rewards/spin">
                        <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center">
                            <FaGift className="mr-2" /> Daily Spin
                        </button>
                    </Link>
                    <Link to="/customer/rewards/history">
                        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center">
                            <FaHistory className="mr-2" /> View History
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
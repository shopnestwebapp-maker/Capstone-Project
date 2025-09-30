import { useEffect, useState } from "react";
import axios from "axios";

export default function RewardsHistory() {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get("/api/rewards/history", { withCredentials: true });
                setHistory(res.data);
            } catch (err) {
                setError("Failed to load history. Please try again later.");
                console.error("API error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Helper function to render a user-friendly message for a reward type
    const formatRewardType = (type) => {
        switch (type) {
            case "points_earned":
                return "💰 Points Earned";
            case "reward_redeemed":
                return "🎁 Reward Redeemed";
            case "spin_the_wheel":
                return "🎡 Spin the Wheel";
            default:
                return type;
        }
    };

    if (isLoading) {
        return <div className="p-6 max-w-2xl mx-auto text-center text-gray-500">Loading history...</div>;
    }

    if (error) {
        return <div className="p-6 max-w-2xl mx-auto text-center text-red-500">{error}</div>;
    }

    if (history.length === 0) {
        return (
            <div className="p-6 max-w-2xl mx-auto text-center text-gray-500">
                <p className="text-xl mb-2">No rewards history found.</p>
                <p>Start earning points to see your history here!</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">📜 Reward History</h2>
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                <thead className="bg-indigo-600 text-white">
                    <tr>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Points</th>
                        <th className="p-3 text-left">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((row, index) => (
                        <tr key={row.id} className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                            <td className="p-3 text-gray-800">{new Date(row.created_at).toLocaleDateString()}</td>
                            <td className="p-3 text-gray-800 font-semibold">{formatRewardType(row.type)}</td>
                            <td className="p-3 text-green-600 font-bold">{row.points}</td>
                            <td className="p-3 text-gray-600">{row.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
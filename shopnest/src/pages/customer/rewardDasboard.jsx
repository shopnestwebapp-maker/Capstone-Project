import { useEffect, useState } from "react";
import axios from "axios";

export default function RewardsDashboard() {
    const [points, setPoints] = useState(0);
    const [error, setError] = useState(null); // Add state for error handling

    useEffect(() => {
        axios.get("/api/rewards", { withCredentials: true })
            .then((res) => {
                setPoints(res.data.points);
            })
            .catch((err) => {
                setError("Failed to load rewards. Please try again.");
                console.error("API error:", err); // Log the full error for debugging
            });
    }, []);

    // Display an error message if the API call fails
    if (error) {
        return <div className="p-6 max-w-lg mx-auto text-red-500">{error}</div>;
    }

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-2">🎁 Rewards Dashboard</h2>
            <p className="text-lg mb-4">You currently have {points} points.</p>

            <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${(points % 1000) / 10}%` }}
                ></div>
            </div>
            <p className="mt-2 text-gray-600">
                {1000 - (points % 1000)} points until next reward!
            </p>
        </div>
    );
}
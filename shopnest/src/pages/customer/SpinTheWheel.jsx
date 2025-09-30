import { useState } from "react";
import axios from "axios";

export default function SpinTheWheel() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const spin = async () => {
        setLoading(true);
        setError(null);
        setResult(null); // Clear previous result to show a fresh spin

        try {
            const res = await axios.post("/api/rewards/spin", {}, { withCredentials: true });
            setResult(res.data.reward);
        } catch (err) {
            setError(err.response?.data?.message || "Spin failed. Please try again.");
            console.error("API error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format the result message with an emoji
    const getResultText = (reward) => {
        if (!reward) return null;
        switch (reward.type) {
            case "points":
                return `💰 ${reward.value} Points`;
            case "discount":
                return `🏷️ ${reward.value} Discount`;
            case "free_item":
                return `🎁 Free ${reward.value}`;
            default:
                return "You won an unknown prize!";
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto text-center bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-purple-700">🎡 Spin the Wheel</h2>
            <p className="text-gray-600 mb-6">Test your luck and win a prize!</p>

            <button
                onClick={spin}
                disabled={loading}
                className={`
                    w-full px-6 py-4 rounded-full text-white font-semibold transition-all duration-300
                    ${loading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 shadow-lg transform active:scale-95"}
                `}
            >
                {loading ? "Spinning..." : "Spin Now!"}
            </button>

            {loading && (
                <div className="mt-6 flex justify-center items-center">
                    {/* A simple loading spinner */}
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
            )}

            {error && (
                <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg transition-all duration-300 animate-fade-in">
                    <p>{error}</p>
                </div>
            )}

            {result && !error && (
                <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg transition-all duration-300 animate-fade-in transform scale-100">
                    <h3 className="text-xl font-bold mb-2">🎉 Congratulations, you won! 🎉</h3>
                    <p className="text-lg font-semibold">{getResultText(result)}</p>
                </div>
            )}
        </div>
    );
}
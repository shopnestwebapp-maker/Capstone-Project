import { useState } from "react";
import axios from "axios";
import { Wheel } from "react-custom-roulette";
import { Link } from "react-router-dom"; // ✅ Added import

export default function SpinTheWheel() {
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const data = [
        { option: "10 Points" },
        { option: "20 Points" },
        { option: "50 Points" },
        { option: "Better luck\nnext time" },
    ];

    const rewardMap = {
        10: 0,
        20: 1,
        50: 2,
    };

    const spin = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const { data: resData } = await axios.post("/api/rewards/spin", {}, { withCredentials: true });
            const reward = resData.reward;

            let index;
            const rewardValue = Number(reward.value); // ✅ Ensure number type
            if (reward.type === "points" && rewardMap[rewardValue] !== undefined) {
                index = rewardMap[rewardValue];
            } else {
                index = 3; // "Better luck next time"
            }

            setPrizeNumber(index);
            setMustSpin(true);

            // Set result after spin animation (~5s by default)
            setTimeout(() => setResult(reward), 5000);
        } catch (err) {
            setError(err.response?.data?.message || "Spin failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-lg mx-auto text-center bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 mt-10">

            {/* Back Button */}
            <Link to="/customer/rewards/">
                <button className="mb-4 text-purple-600 hover:text-purple-800 font-medium underline">
                    ← Back to Rewards
                </button>
            </Link>

            <h2 className="text-4xl font-extrabold mb-2 text-purple-800">🎡 Spin to Win!</h2>
            <p className="text-gray-600 mb-8 text-lg">Your chance to win exclusive rewards!</p>

            <div className="flex justify-center mb-8">
                <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={data}
                    backgroundColors={["#a78bfa", "#818cf8", "#f472b6", "#fde047"]}
                    textColors={["#ffffff", "#ffffff", "#ffffff", "#1f2937"]}
                    onStopSpinning={() => setMustSpin(false)}
                />
            </div>

            <button
                onClick={spin}
                disabled={loading || mustSpin}
                className={`
                    w-full px-8 py-5 rounded-full text-white font-bold text-lg transition-all duration-300 transform
                    ${loading || mustSpin ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-lg"}
                `}
            >
                {loading ? "Spinning..." : "Spin Now!"}
            </button>

            {error && (
                <div className="mt-8 p-4 bg-red-100 text-red-700 rounded-xl border border-red-200">
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {result && !error && (
                <div className="mt-8 p-4 bg-green-100 text-green-700 rounded-xl border border-green-200">
                    {result.type === "points" ? (
                        <>
                            <h3 className="text-xl font-bold mb-1">🎉 You won {result.value} points!</h3>
                            <p className="text-md">Check your dashboard for the update.</p>
                        </>
                    ) : (
                        <h3 className="text-lg font-semibold text-gray-800">😢 Better luck next time!</h3>
                    )}
                </div>
            )}
        </div>
    );
}

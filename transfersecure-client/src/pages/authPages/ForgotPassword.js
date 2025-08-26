import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleForgotPassword(email);
    };
    const handleForgotPassword = async (email) => {
        try {
            const response = await fetch("http://localhost:8080/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (data.success) {
                localStorage.setItem("resetEmail", email);
                navigate("/reset-password");
            } else {
                alert(data.message || "Error sending reset code");
            }
        } catch (error) {
            alert("Something went wrong. Please try again");
        }
    };

    return (
        <div className="flex items-center justify-center w-full">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md w-96 p-6">
                <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full mb-4 rounded"
                    required
                />
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">
                    Send Reset Code
                </button>
            </form>
        </div>
    );
}

export default ForgotPassword;
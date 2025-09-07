import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import Logo from "../../assets/Logo.png";
import AuthFooter from "./AuthFooter";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleForgotPassword(email);
    };
    const handleForgotPassword = async (email) => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <main className="flex-grow flex items-center justify-center">
                <div className={"w-full max-w-md flex flex-col items-center"}>
                    <div className={"flex justify-center"}>
                    <img src={Logo} alt="logo" className="h-10" />
                </div>
                <h1 className="text-2xl mt-5 font-sans font-bold text-center text-[#353535] "> Forgot Password</h1>
                <p className="mt-2 text-center text-gray-500">
                    Enter your registered email address to continue
                </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />
                <button type="submit" className="w-full py-3 text-white bg-indigo-800 rounded-full hover:bg-indigo-900 transition">
                    { loading ? "Sending Reset Code..." : "Send Reset Code" }
                </button>
                <p className="text-center  mt-6 text-gray-700 mb-10">New to Transfer Secure?<Link to="/register" className="text-indigo-600 hover:underline"> Create account</Link></p>
            </form>
                </div>
            </main>
            <AuthFooter />
        </div>
    );
}

export default ForgotPassword;
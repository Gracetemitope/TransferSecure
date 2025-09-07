import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import AuthFooter from "./AuthFooter";

function ResetPassword() {
    const [confirmationCode, setConfirmationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();

    const email = localStorage.getItem("resetEmail"); // fixed key

    const handleResetPassword = async () => {
        try {
            const response = await fetch("http://localhost:8080/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    newPassword,
                    confirmationCode,
                }),
            });

            const data = await response.json();

            if (data.success && data.step === "DONE") {
                localStorage.removeItem("resetEmail"); // clear stored email
                alert("Password reset successfully!");
                navigate("/login");
            } else {
                alert(data.message || "Error resetting your password");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleResetPassword();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <main className="flex-grow flex items-center justify-center">
                <div className= "w-full max-w-md flex flex-col items-center">
                    <div className={"flex justify-center"}>
                        <img src={Logo} alt="logo" className="h-10" />
                    </div>
                    <h1 className="text-2xl mt-5 font-sans font-bold text-center text-[#353535] ">Reset Your Password</h1>
                    <p className="mt-2 text-center text-gray-500">
                        Enter the verification code sent to your email and new password
                    </p>
                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">


                <input
                    type="text"
                    placeholder="Enter reset code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />

                <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                />

                <button
                    type="submit"
                    className="w-full py-3 text-white bg-indigo-800 rounded-full hover:bg-indigo-900 transition"
                >
                    Reset Password
                </button>
            </form>
                </div>
                </main>
            <AuthFooter />
        </div>
    );
}

export default ResetPassword;
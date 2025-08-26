import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <div className="flex items-center justify-center w-full min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-md w-96 p-6"
            >
                <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Reset password for <strong>{email}</strong>
                </p>

                <input
                    type="text"
                    placeholder="Enter reset code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="border p-2 w-full mb-4 rounded"
                    required
                />

                <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border p-2 w-full mb-4 rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-green-500 text-white py-2 rounded-lg"
                >
                    Reset Password
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;
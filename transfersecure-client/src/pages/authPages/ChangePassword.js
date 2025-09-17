import { useState } from "react";

function ChangePassword() {
    const [formState, setFormState] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const API_URL = process.env.REACT_APP_API_URL;


    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formState.newPassword !== formState.confirmPassword) {
            alert("New password and confirm password do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_URL + "/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    oldPassword: formState.currentPassword,
                    newPassword: formState.newPassword,
                    confirmNewPassword: formState.confirmPassword,
                }),
            })
            console.log("Submitting:", formState);
            alert("Password changed successfully");
            setFormState({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mx-auto bg-white p-8 rounded-2xl shadow-md mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Change Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-gray-600 mb-2">Current Password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={formState.currentPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-600 mb-2">New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formState.newPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-600 mb-2">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formState.confirmPassword}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}

export default ChangePassword;
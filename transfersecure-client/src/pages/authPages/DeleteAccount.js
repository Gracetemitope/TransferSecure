import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DeleteAccount() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const API_URL =
        process.env.REACT_APP_API_URL || "https://34.234.70.16.nip.io/";
    const navigate = useNavigate();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL + "/delete-account", {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error deleting account: ${errorData.message}`);
                return;
            }

            alert("Account deleted successfully");
            navigate("/register");
        } catch (error) {
            console.error(error);
            alert("An error occurred while deleting your account.");
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="w-full lg:w-1/2 max-w-lg mx-auto bg-white p-10 rounded-2xl shadow-lg border border-gray-200 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Delete Account</h2>
            <p className="text-gray-600 mb-6 text-sm">
                Deleting your account is permanent. All your files and data will be lost.
                Please proceed with caution.
            </p>
            <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
            >
                Delete Account
            </button>

            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Confirm Account Deletion
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete your account? <br />
                            <span className="font-semibold text-red-600">
                All your files will be permanently deleted.
              </span>
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeleteAccount;
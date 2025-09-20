import { useState, useEffect, useMemo } from "react";

function ViewProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("authToken");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        zoneinfo: "",
        email: "",
    });

    const [originalValues, setOriginalValues] = useState({
        firstName: "",
        lastName: "",
        zoneinfo: "",
        email: "",
    });

    useEffect(() => {
        const initial = {
            firstName: localStorage.getItem("firstName") || "",
            lastName:
                localStorage.getItem("lastName") ||
                localStorage.getItem("family_name") ||
                "",
            zoneinfo: localStorage.getItem("country") || localStorage.getItem("zoneinfo") || "",
            email: localStorage.getItem("email") || "",
        };

        setForm(initial);
        setOriginalValues({ ...initial });
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const changed = (a, b) =>
        String(a ?? "").trim() !== String(b ?? "").trim();

    const hasChanges = useMemo(
        () =>
            changed(form.firstName, originalValues.firstName) ||
            changed(form.lastName, originalValues.lastName) ||
            changed(form.zoneinfo, originalValues.zoneinfo),
        [form, originalValues]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!hasChanges) {
            setIsEditing(false);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_URL + "/update-profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                credentials: "include",
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    zoneinfo: form.zoneinfo,
                }),
            });

            let result = null;
            try {
                result = await response.json();
            } catch (err) {
                result = null;
            }

            if (response.ok && (result === null || result.success === true || result.status === "ok")) {
                alert((result && result.message) || "Profile updated successfully!");

                localStorage.setItem("firstName", form.firstName);
                localStorage.setItem("lastName", form.lastName);
                localStorage.setItem("zoneinfo", form.zoneinfo);
                localStorage.setItem("country", form.zoneinfo);

                setOriginalValues({ ...form });
                setIsEditing(false);
            } else {
                const msg =
                    (result && (result.message || result.error)) ||
                    "Failed to update profile. Please try again.";
                alert(msg);
            }
        } catch (err) {
            alert("An error occurred while updating your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setForm({ ...originalValues });
        setIsEditing(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                        />
                    ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {form.firstName || "Not provided"}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            required
                        />
                    ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {form.lastName || "Not provided"}
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {form.email || "Not provided"}
                    </div>
                </div>

                {/* Zoneinfo */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone / Region</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="zoneinfo"
                            value={form.zoneinfo}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="e.g., NZ, US, UK"
                            required
                        />
                    ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            {form.zoneinfo || "Not provided"}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="md:col-span-2 flex space-x-4 mt-4">
                    {isEditing ? (
                        <>
                            <button
                                type="submit"
                                disabled={loading || !hasChanges}
                                className={`px-6 py-2 rounded-lg text-white ${
                                    loading || !hasChanges
                                        ? "bg-indigo-300 cursor-not-allowed"
                                        : "bg-indigo-600 hover:bg-indigo-700"
                                } transition`}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-6 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                        >
                            Update Profile
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default ViewProfile;
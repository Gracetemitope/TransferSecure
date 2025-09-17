import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Layout/SideBar";
import Navbar from "../Layout/NavBar";
import BreadCrumb from "../BreadCrumb";

function UpdateProfile() {
    const location = useLocation();
    const navigate = useNavigate();
    const userData = location.state || {};
    const API_URL = process.env.REACT_APP_API_URL;


    const [form, setForm] = useState({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        zoneinfo: userData.zoneinfo || "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_URL + "/update-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            if (response.ok) {
                alert("Profile updated successfully!");
                localStorage.setItem("firstName", form.firstName);
                localStorage.setItem("lastName", form.lastName);
                localStorage.setItem("zoneinfo", form.zoneinfo);
                navigate("/profile");
            } else {
                alert("Failed to update profile.");
                console.log(response);

            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className={"p-6 flex-1 bg-gray-50"}>
                    <BreadCrumb
                        items={[
                            { label: "Profile", to: "/profile"},
                            { label: "Update Profile"}
                        ]}
                    />
        <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
            <h1 className="text-xl font-bold mb-4">Update Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="text"
                    name="zoneinfo"
                    value={form.zoneinfo}
                    onChange={handleChange}
                    placeholder="Zone (e.g., NZ)"
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"

                >
                    Update
                </button>
            </form>
        </div>
                </main>
            </div>
        </div>
    );
}

export default UpdateProfile;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Layout/SideBar";
import Navbar from "../Layout/NavBar";
import BreadCrumb from "../BreadCrumb";

function ViewProfile() {
    const navigate = useNavigate();

    const profile = {
        firstName: localStorage.getItem("firstName") || "",
        lastName: localStorage.getItem("lastName") || "",
        zoneinfo: localStorage.getItem("country") || "",
        email: localStorage.getItem("email") || "",
    };
    if (!profile) return <p>Loading profile...</p>;

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className={"p-6 flex-1 bg-gray-50"}>
                    <BreadCrumb
                        items={[
                            { label: "Home", to: "/"},
                            { label: "Upload file"}
                        ]}
                    />
        <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
            <h1 className="text-xl font-bold mb-4">Profile</h1>
            <div className="space-y-2">
                <p><strong>First Name:</strong> {profile.firstName}</p>
                <p><strong>Last Name:</strong> {profile.lastName}</p>
                <p><strong>Email Address:</strong> {profile.email}</p>
                <p><strong>Zone:</strong> {profile.zoneinfo}</p>
            </div>
            <button
                onClick={() => navigate("/update-profile", { state: profile })}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
                Update Profile
            </button>
        </div>
                </main>
            </div>
        </div>
    );
}

export default ViewProfile;
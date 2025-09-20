import { useState } from "react";
import Sidebar from "../components/Layout/SideBar";
import Navbar from "../components/Layout/NavBar";
import BreadCrumb from "../components/BreadCrumb";
import ChangePassword from "./authPages/ChangePassword";
import DeleteAccount from "./authPages/DeleteAccount";
import ViewProfile from "../components/Profile/ViewProfile";

function Settings() {
    const [activeTab, setActiveTab] = useState("profile");

    return(
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className={"p-6 flex-1 bg-gray-50"}>
                    <BreadCrumb
                        items={[
                            { label: "Home", to: "/"},
                            { label: "Settings"}
                        ]}
                    />

                    <div className="mx-auto bg-white rounded-xl shadow-md overflow-hidden mt-6">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                                    activeTab === "profile"
                                        ? "text-indigo-600 border-b-2 border-indigo-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab("password")}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                                    activeTab === "password"
                                        ? "text-indigo-600 border-b-2 border-indigo-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Change Password
                            </button>
                            <button
                                onClick={() => setActiveTab("delete")}
                                className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                                    activeTab === "delete"
                                        ? "text-red-600 border-b-2 border-red-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Delete Account
                            </button>
                        </div>
                        <div className="p-6">
                            {activeTab === "profile" && <ViewProfile />}
                            {activeTab === "password" && <ChangePassword />}
                            {activeTab === "delete" && <DeleteAccount />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Settings;
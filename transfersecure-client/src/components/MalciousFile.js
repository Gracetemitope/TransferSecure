import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from "./Layout/SideBar";
import Navbar from "./Layout/NavBar";
import BreadCrumb from "./BreadCrumb";

function MaliciousFile() {
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
        <div className="flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Security Alert
                </h1>

                <p className="text-lg text-gray-700 mb-2">
                    Sorry, the uploaded file has been identified as malicious.
                </p>

                <p className="text-md text-gray-600 mb-8">
                    For security reasons, we cannot process this file. Please try again with a different file.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/transfer"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
                    >
                        Try Another File
                    </Link>
                    <Link
                        to="/"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-300"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
                </main>
            </div>
        </div>
    );
};

export default MaliciousFile;
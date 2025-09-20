// components/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
                {/* 404 graphic */}
                <div className="mb-8">
                    <div className="relative inline-block">
                        <div className="text-9xl font-bold text-blue-600 opacity-20">404</div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <svg className="w-24 h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Page Not Found
                </h1>

                <p className="text-lg text-gray-700 mb-10">
                    Oops! Not sure where you are trying to go but nothing is here.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Please Go Home
                </Link>
            </div>
        </section>
    );
}

export default NotFound;
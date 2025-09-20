import { useState, useEffect } from "react";

export default function SharedHistory() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL;
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/user/file/${userId}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                setFiles(data.data || []);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching shared history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [userId, API_URL]);

    const getStatus = (duration) => {
        try {
            const expiry = new Date(duration);
            return expiry > new Date() ? "Active" : "Expired";
        } catch {
            return "Unknown";
        }
    };

    const isExpired = (duration) => {
        try {
            return new Date(duration) < new Date();
        } catch {
            return true;
        }
    };

    if (loading) {
        return (
            <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold mb-4">Shared History</h2>
                <div className="flex justify-center items-center h-40">
                    <p>Loading shared files...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold mb-4">Shared History</h2>
                <div className="flex justify-center items-center h-40 text-red-500">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4 text-lg">Shared History</h2>

            {/* Desktop/Tablet View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="text-gray-600 text-sm border-b">
                        <th className="py-3 font-medium">Title</th>
                        <th className="py-3 font-medium">Size</th>
                        <th className="py-3 font-medium">Attachments</th>
                        <th className="py-3 font-medium">Sent to</th>
                        <th className="py-3 font-medium">Status</th>
                        <th className="py-3 font-medium">Expiry Date</th>
                        <th className="py-3 font-medium">Download</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm">
                    {files.length > 0 ? (
                        files.map((file, idx) => {
                            const f = file.files && file.files[0];
                            const status = getStatus(file.duration);
                            return (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="py-3 pr-4">{file.file_name || "—"}</td>
                                    <td className="py-3">{f ? `${f.size} MB` : "—"}</td>
                                    <td className="py-3">{f ? f.filename : "—"}</td>
                                    <td className="py-3">{file.email}</td>
                                    <td className="py-3">
                                            <span
                                                className={`px-2 py-1 rounded text-white text-xs ${
                                                    status === "Active"
                                                        ? "bg-green-500"
                                                        : "bg-gray-400"
                                                }`}
                                            >
                                                {status}
                                            </span>
                                    </td>
                                    <td className="py-3">{file.duration || "—"}</td>
                                    <td className="py-3">
                                        {f && !isExpired(file.duration) ? (
                                            <a
                                                href={f.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500 underline"
                                            >
                                                Download
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="7" className="py-6 text-center text-gray-500">
                                No shared files found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
                {files.length > 0 ? (
                    files.map((file, idx) => {
                        const f = file.files && file.files[0];
                        const status = getStatus(file.duration);
                        return (
                            <div key={idx} className="border-b p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium">{file.file_name || "—"}</h3>
                                    <span
                                        className={`px-2 py-1 rounded text-white text-xs ${
                                            status === "Active" ? "bg-green-500" : "bg-gray-400"
                                        }`}
                                    >
                                        {status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Size</p>
                                        <p>{f ? `${f.size} MB` : "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Attachments</p>
                                        <p>{f ? f.filename : "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Sent to</p>
                                        <p>{file.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Expiry Date</p>
                                        <p>{file.duration || "—"}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500">Download</p>
                                        {f && !isExpired(file.duration) ? (
                                            <a
                                                href={f.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500 underline"
                                            >
                                                Link
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-6 text-center text-gray-500">
                        No shared files found
                    </div>
                )}
            </div>
        </div>
    );
}
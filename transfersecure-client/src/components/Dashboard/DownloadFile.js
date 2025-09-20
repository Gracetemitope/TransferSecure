import { useState, useEffect } from "react";

export default function DownloadFile() {
    const [fileUrl, setFileUrl] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedRedirectUrl = urlParams.get("download");
        if (encodedRedirectUrl) {
            const originalUrl = decodeURIComponent(encodedRedirectUrl);
            setFileUrl(originalUrl);
        }
    }, []);

    const handleDownload = () => {
        if (!fileUrl) return;

        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white border rounded-lg p-6 flex items-center space-x-2">
            <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="flex-1 border rounded px-3 py-2 bg-white text-gray-700"
                placeholder="Enter file URL"
            />
            <button
                onClick={handleDownload}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
                Download
            </button>
        </div>
    );
}
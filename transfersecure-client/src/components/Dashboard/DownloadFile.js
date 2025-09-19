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

        // Create a hidden link and click it
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = ""; // let the browser decide filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white border rounded-lg p-6 flex items-center space-x-2">
            <input
                type="text"
                value={fileUrl}
                readOnly
                onPaste={(e) => e.preventDefault()} // block pasting
                className="flex-1 border rounded px-3 py-2 bg-gray-100 cursor-not-allowed text-gray-700"
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

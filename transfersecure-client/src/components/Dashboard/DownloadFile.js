import { useState } from "react";

export default function DownloadFile() {
    const [fileUrl, setFileUrl] = useState("");

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
                placeholder="Enter or paste link here"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="flex-1 border rounded px-3 py-2 focus:outline-none"
            />
            <button
                onClick={handleDownload}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
                Download
            </button>
        </div>
    );
}
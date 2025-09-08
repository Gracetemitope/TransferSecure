export default function DownloadFile() {
    return (
        <div className="bg-white border rounded-lg p-6 flex items-center space-x-2">
            <input
                type="text"
                placeholder="Enter or paste link here"
                className="flex-1 border rounded px-3 py-2 focus:outline-none"
            />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
                Download
            </button>
        </div>
    );
}

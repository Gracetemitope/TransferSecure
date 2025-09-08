import successIcon from "../assets/success.png";
import {useState} from "react";
function UploadSuccess() {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText("http://transfersecure.com/57959575");
        setCopied(true);
        setTimeout(() => { setCopied(false); }, 2000);
    }
    return (
        <div className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-100 rounded-full p-4 mb-4">
            <img src={successIcon}></img>
        </div>
            <h1 className={"text-2xl font-bold text-gray-800"}> Congratulations </h1>
            <p className={"text-gray-500 mb-6"}> Your file was sent successfully</p>

            <div className={"bg-gray-50 border rounded-lg shadow p-6 w-full max-w-d"}>
                <div className={"flex items-center justify-between mb-4 border-b pb-3"}>
                    <div>
                        <p className="text-xs text-gray-500">Link</p>
                        <p className="text-sm text-blue-600">
                            http://transfersecure.com/57959575
                        </p>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="px-3 py-1 text-xs rounded border text-indigo-600 hover:bg-indigo-50">
                        {copied ? "Copied!" : "COPY"}
                    </button>
                </div>
                <div className={"space-y-2 text-sm text-gray-700"}>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">File Name</span>
                        <span>Name of file comes here</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Sent to</span>
                        <span>account@email.com</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">No. of files</span>
                        <span>1</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Duration</span>
                        <span>3 days</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Size</span>
                        <span>120KB</span>
                    </div>
                </div>
            </div>
            <button className="mt-6 bg-[#211A94] text-white px-8 py-3 rounded-full hover:bg-indigo-800 transition">
                Done
            </button>
        </div>
    )
}
export default UploadSuccess;
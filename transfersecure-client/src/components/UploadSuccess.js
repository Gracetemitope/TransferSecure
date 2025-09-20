import successIcon from "../assets/success.png";
import {useState} from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Layout/SideBar";
import Navbar from "./Layout/NavBar";
import BreadCrumb from "./BreadCrumb";
function UploadSuccess() {
    const { state } = useLocation()
    const { fileURL, fileName, fileSize, maliciousState, email } = state || {};
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(fileURL);
        setCopied(true);
        setTimeout(() => { setCopied(false); }, 2000);
    }
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
                            {fileURL}
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
                        <span>{fileName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Sent to</span>
                        <span>{email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">No. of files</span>
                        <span>1</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Malicious Check</span>
                        <span>    <span>{maliciousState ? "⚠️ This file is malicious" : "✅ Not malicious"}</span></span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Size</span>
                        <span>{fileSize}</span>
                    </div>
                </div>
            </div>
            {/*<button className="mt-6 bg-[#211A94] text-white px-8 py-3 rounded-full hover:bg-indigo-800 transition">*/}
            {/*    Done*/}
            {/*</button>*/}
        </div>
                </main>
            </div>
        </div>
    )
}
export default UploadSuccess;
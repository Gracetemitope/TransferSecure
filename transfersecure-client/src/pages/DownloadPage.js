import DownloadFile from "../components/Dashboard/DownloadFile";
import Logo from "../../src/assets/Logo.png";

function DownloadPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedRedirectUrl = urlParams.get('download');
    const originalUrl = decodeURIComponent(encodedRedirectUrl);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md flex flex-col items-center">
                <div className="flex justify-center">
                    <img src={Logo} alt="logo" className="h-10" />
                </div>
                <h1 className="text-2xl mt-2 font-sans font-bold text-center text-[#353535]">
                    Transfer Secure
                </h1>
                <p className="mt-4 text-center text-gray-700 text-sm px-4">
                    A file has been securely shared with you. Please paste the URL below to download it.
                    This file has been verified by Transfer Secure and is safe to open.
                </p>
                <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6 mt-6">
                    <h1 className="text-xl font-bold mb-4 text-center">Download Your File</h1>
                    <DownloadFile />
                </div>
            </div>
        </div>
    );
}

export default DownloadPage;
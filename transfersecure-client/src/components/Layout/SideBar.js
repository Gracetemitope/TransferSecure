import overviewIcon from '../../assets/overview.png'
import settingsIcon from '../../assets/Settings.png'
import transferIcon from '../../assets/Transfers.png'
import uploadIcon from '../../assets/upload.png'
import {Link} from "react-router-dom";
import Logo from "../../assets/Logo.png";

function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r flex flex-col p-4">
            <div className="flex items-center mb-4">
                <img src={Logo} />
                <h1>Transfer Secure</h1>
            </div>
            <div className="bg-[#211A94] text-white py-2 px-4 rounded-lg flex items-center justify-center mb-6">
            <Link to={"/transfer"}>
                Upload File
            </Link>
                <img src={uploadIcon} alt="Upload Image" className="ml-4" />
            </div>
            <nav className="space-y-2">
                <div className="flex items-center">
                    <img src={overviewIcon} />
                    <Link to="/overviewß" className="block p-2 rounded hover:bg-gray-100">Overview</Link>
                </div>
                <div className="flex items-center">
                    <img src={transferIcon} />
                    <Link to="/transfer" className="block p-2 rounded hover:bg-gray-100">Transfers</Link>
                </div>
                <div className="flex items-center">
                    <img src={settingsIcon} />
                    <Link to="/settings" className= "p-2 rounded hover:bg-gray-100">Settings</Link>
                </div>
            </nav>
        </aside>
    );
}

export default Sidebar;

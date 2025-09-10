import Sidebar from "../components/Layout/SideBar";
import Navbar from "../components/Layout/NavBar";
import FileUpload from "../components/Dashboard/FileUpload";
import DownloadFile from "../components/Dashboard/DownloadFile";
import StatsCard from "../components/Dashboard/StatsCard";
import TransferStats from "../components/Dashboard/TransferStats";
import SharedHistory from "../components/Dashboard/SharedHistory";

function Dashboard() {
    return (
        <div>
            {/*<Sidebar />*/}
            {/*<Navbar />*/}
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <FileUpload />
                    <StatsCard title="Number of transferred files" value={15} />
                    <TransferStats />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DownloadFile />
                    <StatsCard title="Number of downloaded files" value={15} />
                </div>
                <SharedHistory />
            </div>
        </div>
    )
}
export default Dashboard;
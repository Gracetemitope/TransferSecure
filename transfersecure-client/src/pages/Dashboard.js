import Sidebar from "../components/Layout/SideBar";
import Navbar from "../components/Layout/NavBar";
import StatsCard from "../components/Dashboard/StatsCard";
import SharedHistory from "../components/Dashboard/SharedHistory";
import BreadCrumb from "../components/BreadCrumb";
import {useEffect, useState} from "react";

function Dashboard() {
    const [totalFiles, setTotalFiles] = useState(0);
    const API_URL = process.env.REACT_APP_API_URL;
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch(`${API_URL}/user/file/${userId}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                setTotalFiles(data.data ? data.data.length : 0);
            } catch (err) {
                console.error("Error fetching files count:", err);
            }
        };

        fetchFiles();
    }, [API_URL, userId]);
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
            <div className="space-y-6">
                    <StatsCard title="Total Number of transferred files" value={totalFiles} />
                <SharedHistory />
            {/*</div>*/}
        </div>
            </main>
            </div>
            </div>
    )
}
export default Dashboard;
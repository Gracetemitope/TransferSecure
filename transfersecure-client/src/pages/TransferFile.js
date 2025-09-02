import Sidebar from "../components/Layout/SideBar";
import Navbar from "../components/Layout/NavBar";
import BreadCrumb from "../components/BreadCrumb";

function TransferFile() {
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

            </main>
                </div>
        </div>
    )
}
export default TransferFile;
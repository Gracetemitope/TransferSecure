import Sidebar from "../components/Layout/SideBar";
import Navbar from "../components/Layout/NavBar";
import BreadCrumb from "../components/BreadCrumb";
import fileIcon from "../assets/File.png"
import UploadSuccess from "../components/UploadSuccess";

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
                <UploadSuccess />
                <div className={"bg-white rounded-lg shadow p-6"}>
                    <div className={"grid gird-cols-1 md:grid-cols-2 gap-6"}>
                        <div className={"space-y-4"}>
                            {/* Todo: Remove File Name*/}
                            <input
                                type="text"
                                placeholder="File name"
                                className={"w-full rounded-full border border-gray-200 px-4 py-3 focus:outline-none focus:shadow-outline"}
                                />
                            <input
                                type="email"
                                placeholder="Recipient's email address"
                                className="w-full rounded-full border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <select
                                className="w-full rounded-full border border-gray-200 px-4 py-3 text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option>Select file duration</option>
                                <option>1 day</option>
                                <option>7 days</option>
                                <option>30 days</option>
                            </select>
                        </div>
                        <div className={"flex flex-col items-center justify-center border-2 border-dashed bg-[#F6F5FF] border-[#211A94]" }>
                                <img src={fileIcon} className={""}></img>
                                <p className={"font-medium text-gray-700 text-center"}>Add File Here</p>
                                <p className={"text-sm text-gray-500 text-center"}>
                                    Or <span className={"text-[#211A94] cursor-pointer"}>Browse</span> files from computer to continue
                                </p>
                        </div>
                    </div>
                    <div>

                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                <button className="bg-[#211A94] text-white px-11 py-3 rounded-full hover:bg-indigo-800 transition ml-80">
                    Transfer File
                </button>
                </div>
            </main>
                </div>
        </div>
    )
}
export default TransferFile;
import Sidebar from "../components/Layout/SideBar";
import Navbar from "../components/Layout/NavBar";
import BreadCrumb from "../components/BreadCrumb";
import fileIcon from "../assets/File.png"
import UploadSuccess from "../components/UploadSuccess";
import {useState} from "react";

function TransferFile() {
    const [formState, setFormState] = useState({
        file: "",
        email: "",
        duration: "",
        filename: "",
    })
    const API_URL = process.env.REACT_APP_API_URL;
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem("userId");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", formState.file);
            formData.append("email", formState.email);
            formData.append("duration", formState.duration);
            formData.append("filename", formState.filename);
            const response = await fetch(`${API_URL}/file/${userId}`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            const data = await response.json();
            console.log(data);
            if(response.ok) {
                alert("Successfully uploaded");
                console.log(response);
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        setFormState({...formState, [e.target.name]: e.target.value});
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
                {/*<UploadSuccess />*/}
                <div className={"bg-white rounded-lg shadow p-6"}>
                    <div className={"grid gird-cols-1 md:grid-cols-2 gap-6"}>
                        <div className={"space-y-4"}>
                            <input
                                type="text"
                                name="filename"
                                placeholder="File name"
                                className={"w-full rounded-full border border-gray-200 px-4 py-3 focus:outline-none focus:shadow-outline"}
                               value={formState.filename}
                                onChange={handleChange}
                                required
                                />
                            <input
                                type="email"
                                name="email"
                                placeholder="Recipient's email address"
                                className="w-full rounded-full border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formState.email}
                                onChange={handleChange}
                                required
                            />
                            <select
                                name="duration"
                                value={formState.duration}
                                onChange={handleChange}
                                className="w-full rounded-full border border-gray-200 px-4 py-3 text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select file duration</option>
                                <option value="1d">1 day</option>
                                <option value="7d">7 days</option>
                                <option value="30d">30 days</option>
                            </select>
                        </div>
                        <div className={"flex flex-col items-center justify-center border-2 border-dashed bg-[#F6F5FF] border-[#211A94]" }>
                                {/*<img src={fileIcon} className={""}></img>*/}
                                {/*<p className={"font-medium text-gray-700 text-center"}>Add File Here</p>*/}
                                {/*<p className={"text-sm text-gray-500 text-center"}>*/}
                                {/*    Or <span className={"text-[#211A94] cursor-pointer"}>Browse</span> files from computer to continue*/}
                                {/*</p>*/}
                            <input
                                type="file"
                                name="file"
                                onChange={(e) => setFormState({ ...formState, file: e.target.files[0] })}
                                required
                            />
                        </div>
                    </div>
                    <div>

                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#211A94] text-white px-11 py-3 rounded-full hover:bg-indigo-800 transition ml-80"
                    >
                        {loading ? "Uploading..." : "Transfer File"}
                    </button>
                </div>
            </main>
                </div>
        </div>
    )
}
export default TransferFile;
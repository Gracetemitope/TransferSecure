import {Declaration} from "postcss";
import DeleteAccount from "./authPages/DeleteAccount";
import ChangePassword from "./authPages/ChangePassword";
import Sidebar from "../components/Layout/SideBar";
import Navbar from "../components/Layout/NavBar";
import BreadCrumb from "../components/BreadCrumb";

function Settings() {
    return(
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className={"p-6 flex-1 bg-gray-50"}>
                    <BreadCrumb
                        items={[
                            { label: "Home", to: "/"},
                            { label: "Settings"}
                        ]}
                    />
                    <div className="flex flex-col lg:flex-row gap-8 mt-6">
                        <ChangePassword />
                        <DeleteAccount />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Settings;
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../../context/AuthContext";

function ProfileMenu({ firstName }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef();
    const API_URL = process.env.REACT_APP_API_URL;
    const { logout } = useAuth();


    // Close menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleProfile = () => {
        navigate("/profile");
        setOpen(false);
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/sign-out`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout failed:", error);
        }  finally {
            logout();
            navigate("/login");
        }
    };
    return (
        <div className="relative" ref={menuRef}>
            <div
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <span className="text-gray-500">👤</span>
            </div>
            {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border z-10">
                    <button
                        onClick={handleProfile}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                        Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProfileMenu;
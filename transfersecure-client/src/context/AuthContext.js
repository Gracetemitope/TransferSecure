import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);  // ✅ add loading

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const now = Math.floor(Date.now() / 1000);

                if (decoded.exp > now) {
                    setUser(decoded);
                } else {
                    localStorage.removeItem("authToken");
                }
            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.removeItem("authToken");
            }
        }
        setLoading(false); // ✅ only mark finished after check
    }, []);

    const login = (token) => {
        try {
            const decoded = jwtDecode(token);
            localStorage.setItem("authToken", token);
            setUser(decoded);
        } catch (err) {
            console.error("Invalid token during login:", err);
        }
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => useContext(AuthContext);
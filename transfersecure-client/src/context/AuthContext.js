// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("authToken");
        if (savedToken) {
            const payload = JSON.parse(savedToken);

            // ✅ Check expiration
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp > now) {
                setUser(payload);
            } else {
                localStorage.removeItem("authToken");
            }
        }
    }, []);

    const login = (tokenPayload) => {
        localStorage.setItem("authToken", JSON.stringify(tokenPayload));
        setUser(tokenPayload);
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

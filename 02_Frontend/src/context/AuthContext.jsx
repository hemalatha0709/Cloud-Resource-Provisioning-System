import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const storedUser = localStorage.getItem("user");

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [user, setUser] = useState(
        storedUser && storedUser !== "undefined"
            ? JSON.parse(storedUser)
            : null
    );

    const login = (token, user) => {

        localStorage.setItem("token", token);

        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        }

        setToken(token);
        setUser(user || null);
    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
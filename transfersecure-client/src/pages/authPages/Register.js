import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import Logo from "../../assets/Logo.png"
import AuthFooter from "./AuthFooter";
import ConfirmEmail from "./ConfirmEmail";

function Register() {
    const [formState, setFormState] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        country: "",
    })
    const [username, setUsername] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";


    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);
        try {
            const response = await fetch(API_URL + "/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: formState.firstName,
                    lastName: formState.lastName,
                    email: formState.email,
                    password: formState.password,
                    zoneinfo: formState.country,
                })
            })
            const data = await response.json()
            console.log(data)
            if(response.ok && data.success) {
                setUsername(data.data.username)
                setShowConfirm(true)
                console.log(response)
            } else {
                alert("Sign up failed")
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className={`flex flex-col items-center justify-center min-h-screen bg-white`}>
            <main className="flex-grow flex items-center justify-center">
            <div className={`${showConfirm ? "blur-sm" : ""} w-full`}>

            <div className="w-full max-w-md p-6">
                <div className="flex justify-center mb-6">
                <img src={Logo} alt="logo" className="h-10" />
                </div>
                <h1 className="text-2xl mt-8 text-center font-sans font-bold mb-4">Create a new Account</h1>
                <p className="mt-2 text-center text-gray-500">
                    Enter your details below to register
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div className="flex space-x-4">
                        <input
                            className="w-1/2 px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            name="firstName"
                            type="text"
                            placeholder="First name"
                            value={formState.firstName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            className="w-1/2 px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            name="lastName"
                            type="text"
                            placeholder="Last name"
                            value={formState.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <input
                        className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="country"
                        type="text"
                        placeholder="Country"
                        value={formState.country}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="email"
                        type="email"
                        placeholder="Email address"
                        value={formState.email}
                        onChange={handleChange}
                        required
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formState.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
                        >
                            {showPassword ? "HIDE" : "SHOW"}
                        </button>
                    </div>

                    <button
                        className="w-full py-3 text-white bg-indigo-800 rounded-full hover:bg-indigo-900 transition"
                        type="submit"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>
                <p className="text-center mt-6 text-gray-700">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
            </div>
            </main>
            <AuthFooter />
            {showConfirm && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <ConfirmEmail
                        username={username}
                        email={formState.email}
                        onClose={() => setShowConfirm(false)}
                    />
                </div>
            )}
        </div>
    )
}
export default Register;
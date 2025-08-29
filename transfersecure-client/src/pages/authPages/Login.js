import {useNavigate, Link} from "react-router-dom";
import {useState} from "react";
import Logo from "../../assets/Logo.png"
import AuthFooter from "./AuthFooter";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://[::1]:8080/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            })
            const data = await response.json();
            if (response.ok && data.success) {
                localStorage.setItem("username", data.result.userName);
                navigate("/");
            } else {
                alert("Login failed");
            }


        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <main className="flex-grow flex items-center justify-center">
            <div className= "w-full max-w-md flex flex-col items-center">
                <div className={"flex justify-center"}>
                    <img src={Logo} alt="logo" className="h-10" />
                </div>
                <h1 className="text-2xl mt-5 font-sans font-bold text-center text-[#353535] "> Welcome to Transfer Secure</h1>
                <p className="mt-2 text-center text-gray-500">
                    Sign in to your account to continue
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <input
                        className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        name="email"
                        type="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
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
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">Forgot Password?</Link>
                    </div>
                    <button className="w-full py-3 text-white bg-indigo-800 rounded-full hover:bg-indigo-900 transition" type="submit">{ loading ? "Signing in..." : "SignIn"}</button>
                    <p className="text-center  mt-6 text-gray-700 mb-10">New to Transfer Secure?<Link to="/register" className="text-indigo-600 hover:underline"> Create account</Link></p>
                </form>
            </div>
            </main>

            <AuthFooter />
        </div>
    )
}
export default Login;
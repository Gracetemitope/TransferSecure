import {useNavigate, Link} from "react-router-dom";
import {useState} from "react";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8080/login", {
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
                alert("Login successfull");
                localStorage.setItem("username", data.result.userName);
                navigate("/");
            } else {
                alert("Login failed");
            }


        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className="!flex flex-row md:flex-col h-screen">
            <div className= "p-16 mt-16 flex-1">
                <div className="flex flex-row ml-16">
                    <p className="text-lg p-1 text-gray-600 font-bold">Transfer Secure</p>
                </div>
                <h1 className="text-2xl mt-10 ml-16 font-sans font-bold"> Sign in to your account</h1>
                <form onSubmit={handleSubmit} className="ml-16 mt-4">
                    <label htmlFor="email" className="text-gray-800">Email address</label><br></br>
                    <div className="flex flex-row border-1 rounded-md border-gray-200 mb-3">
                        <i className="fas fa-envelope my-auto mx-1 text-gray-400"></i>
                        <input className="w-full py-2 pl-2 border-0" name="email" type="email" placeholder="account@email.com" value={formData.email} onChange={handleChange} />
                    </div>
                    <label htmlFor="password" className="text-gray-800">Password</label>
                    <div className="flex flex-row border-1 rounded-md border-gray-200">
                        <i className="fas fa-lock my-auto mx-1 text-gray-400"></i>
                        <input  className="w-full py-2 pl-2 border-0" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="flex justify-end">
                        <Link to="/auth/signin" className="primary-text-color mb-4">Forgot Password?</Link>
                    </div>
                    <button className="w-full primary-bg-color h-10 text-white rounded-md" type="submit">Sign In</button>
                    <p className="text-center  mt-10 text-gray-700">New to Transfer Secure?<Link to="/register" className="primary-text-color"> Create account</Link></p>
                </form>
            </div>
        </div>
    )
}
export default Login;
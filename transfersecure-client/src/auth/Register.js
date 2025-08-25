import {useState} from "react";
import { Link } from "react-router-dom";

function Register() {
    const [formState, setFormState] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        country: "",
    })
    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch("http://localhost:8080/register", {
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
            if(response.ok) {
                alert("Sign up successfully")
                console.log(response)
            } else {
                alert("Sign up failed")
            }

        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className="!flex flex-row md:flex-col h-screen">
            <div className= "p-16 mt-16 flex-1">
                    <p className="text-lg p-1 text-gray-600 font-bold">Transfer Secure</p>
                </div>
                <h1 className="text-2xl mt-8 ml-0 font-sans font-bold mb-4">Create an Account</h1>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-row justify-between">
                        <div className="flex-1">
                            <label htmlFor="firstName">First Name</label><br></br>
                            <input className="w-full px-3 py-2 border rounded-md" name="firstName" type="text" placeholder="First name" value={formState.firstName} onChange={handleChange} />
                        </div>
                        <div className="flex-1 mb-3 ml-4">
                            <label htmlFor="lastName">Last Name</label><br></br>
                            <input className="w-full px-3 py-2 border rounded-md" name="lastName" type="text" placeholder="Last name" value={formState.lastName} onChange={handleChange} />
                        </div>
                    </div>
                    <label htmlFor="country">Country</label><br></br>
                    <input className="w-full px-3 py-2 border rounded-md" name="country" type="text" placeholder="Country" value={formState.country} onChange={handleChange} /><br></br><br></br>
                    <label htmlFor="email">Email</label><br></br>
                    <input className="w-full px-3 py-2 border rounded-md" name="email" type="email" placeholder="e.g account@email.com" value={formState.email} onChange={handleChange} /><br></br><br></br>
                    <label htmlFor="password">Password</label><br></br>
                    <input className="w-full px-3 py-2 border rounded-md" name="password" type="password" placeholder="Password" value={formState.password} onChange={handleChange} /><br></br><br></br>
                    <button className="w-full primary-bg-color h-10 text-white rounded-md" type="submit">Create Account</button>
                </form>
                <p className="text-center  mt-10 text-gray-700">Already have an account? <Link to="/auth/signin" className="primary-text-color">Sign in</Link></p>
        </div>
    )
}
export default Register;
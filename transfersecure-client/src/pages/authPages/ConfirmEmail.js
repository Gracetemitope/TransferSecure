import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";

function ConfirmEmail() {
    const [confirmationCode, setConfirmationCode] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const username = location.state.username;
    const handleConfirmation = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8080/confirm", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username,
                    confirmationCode,
                })
            })
            const data = await response.json();
            console.log(data);
            if(response.ok && data.success) {
                alert("Email confirmed successfully! You can now login");
                navigate("/login");
            } else {
                alert("Something went wrong!");
            }

        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="!flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Confirm Your Email</h1>
            <form onSubmit={handleConfirmation} className="w-80">
                <label htmlFor="confirmationCode">Confirmation Code</label>
                <input
                    className="w-full px-3 py-2 border rounded-md"
                    name="confirmationCode"
                    type="text"
                    placeholder="Enter the code from your email"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                />
                <button
                    className="w-full primary-bg-color h-10 text-white rounded-md mt-4"
                    type="submit"
                >
                    Confirm
                </button>
            </form>
        </div>
    )
}
export default ConfirmEmail;
import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";

function ConfirmEmail({ username, email, onClose }) {
    const [confirmationCode, setConfirmationCode] = useState(new Array(6).fill(""));
    const navigate = useNavigate();
    const inputsRef = useRef([]);
    const API_URL = process.env.REACT_APP_API_URL;
        // || "http://localhost:8080";

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (value, index) => {
        if(/^\d?$/.test(value)) {
            const newCode = [...confirmationCode];
            newCode[index] = value;
            setConfirmationCode(newCode);
            if (value && index < 5) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            const newCode = [...confirmationCode];
            if (newCode[index]) {
                newCode[index] = "";
                setConfirmationCode(newCode);
            } else if (index > 0) {
                inputsRef.current[index - 1]?.focus();
                newCode[index - 1] = "";
                setConfirmationCode(newCode);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").slice(0, 6);
        if (/^\d+$/.test(paste)) {
            const newCode = paste.split("");
            while (newCode.length < 6) newCode.push("");
            setConfirmationCode(newCode);
            inputsRef.current[newCode.length - 1]?.focus();
        }
    };

    const handleConfirmation = async (e) => {
        e.preventDefault();
        const code = confirmationCode.join("");
        try {
            const response = await fetch(API_URL + "/confirm", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username,
                    confirmationCode: code,
                })
            });
            const data = await response.json();
            console.log(data);
            if(response.ok && data.success) {
                alert("Email confirmed successfully");
                navigate("/");
            } else {
                alert("Something went wrong!");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-white p-8 rounded-2xl shadow-md text-center w-[400px] relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                >
                    ✕
                </button>

                <h1 className="text-2xl font-bold mb-4">Confirm Your Email</h1>
                <p className="text-sm text-gray-600 mb-4">
                    Enter 6-digit OTP code sent to{" "}
                    <span className="font-semibold text-blue-600">{email}</span>
                </p>
                <form onSubmit={handleConfirmation}>
                    <div className="flex justify-center gap-2 mb-6">
                        {confirmationCode.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputsRef.current[i] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e.target.value, i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                onPaste={handlePaste}
                                className="w-10 h-12 border rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={confirmationCode.join("").length !== 6}
                        className="w-full h-10 bg-blue-600 text-white rounded-md disabled:opacity-50"
                    >
                        Continue
                    </button>
                </form>
                <button
                    type="button"
                    onClick={() => alert("Resend OTP logic here")}
                    className="mt-4 text-sm text-blue-600 hover:underline"
                >
                    Resend Code
                </button>
            </div>
        </div>
    );
}
export default ConfirmEmail;
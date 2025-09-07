import {Link} from "react-router-dom";

function AuthFooter() {
    return (
        <footer className=" relative text-center text-xs text-gray-400 bg-bottom bg-contain">
            <div className="relative z-10 text-center text-xs text-gray-600 py-10">
            © 2025 Transfer Secure. All rights reserved. |{" "}
            <Link to="/terms" className="hover:underline">Terms of service</Link>{" "}
            |{" "}
            <Link to="/privacy" className="hover:underline">Privacy policy</Link>
            </div>
        </footer>
    )
}

export default AuthFooter;
import Logo from "../../assets/Logo.png"
import {Link} from "react-router-dom";
function HeroSection() {
    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
                <div className="mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-blue-800 text-sm font-semibold">
              <img src={Logo} alt="Logo" className="h-6 w-6" />
            Transfer Secure
          </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                    A Secure, Smarter Way to<br />
                    <span className="text-blue-600">Share Files</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-10">
                    Send and receive files safely with built-in malware detection and identity verification.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to={"/login"} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                        Send File
                    </Link>
                    <Link to={"/download-file"} className="bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                        Receive File
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
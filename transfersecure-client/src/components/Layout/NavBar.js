import Logo from '../../assets/Logo.png'

function Navbar() {
    const firstName = localStorage.getItem("firstName");

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b">
            {/*<div className="flex items-center">*/}
            {/*<img src={Logo} />*/}
            {/*<h1>Transfer Secure</h1>*/}
            {/*</div>*/}
            <h1 className="text-lg font-semibold">Welcome back, {firstName}</h1>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500">👤</span>
            </div>
        </header>
    );
}

export default Navbar;

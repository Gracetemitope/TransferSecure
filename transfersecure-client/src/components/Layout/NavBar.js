import Logo from '../../assets/Logo.png';
import ProfileMenu from "../Profile/ProfileMenu";

function Navbar() {
    const firstName = localStorage.getItem("firstName");

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b">
            <h1 className="text-lg font-semibold">Welcome back, {firstName}</h1>
            <ProfileMenu firstName={firstName} />
        </header>
    );
}

export default Navbar;
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut, Menu, Home, ShoppingCart, FileText } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function ConsumerNavbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const dropdownRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();
    const activeLink = location.pathname;

    // ✅ Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                // ✅ Guard — if somehow a prosumer lands here, kick them out
                if (parsed.userType !== 'consumer') {
                    localStorage.clear();
                    navigate('/login', { replace: true });
                    return;
                }
                setUserData(parsed);
            } catch {
                localStorage.clear();
                navigate('/login', { replace: true });
            }
        } else {
            navigate('/login', { replace: true });
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleLogout() {
        localStorage.clear();
        navigate('/login', { replace: true });
    }

    function desktopLinkClass(path) {
        return `pb-1 transition-colors ${
            activeLink === path
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-700 hover:text-green-600'
        }`;
    }

    function mobileLinkClass(path) {
        return `px-2 py-1 transition-colors ${
            activeLink === path
                ? 'border-l-4 border-green-600 text-green-600'
                : 'text-gray-700 hover:text-green-600'
        }`;
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b shadow-sm bg-white">

            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <Link to="/consumer/home">
                    <img src="/greenwave-logo.png" alt="GreenWave" className="h-16 w-auto cursor-pointer" />
                </Link>
            </div>

            {/* Center: Desktop Nav */}
            <ul className="hidden md:flex items-center space-x-10 text-[17px] font-medium">
                <Link to="/consumer/home" className={desktopLinkClass('/consumer/home')}>HOME</Link>
                <Link to="/consumer/marketplace" className={desktopLinkClass('/consumer/marketplace')}>MARKETPLACE</Link>
                <Link to="/consumer/my-orders" className={desktopLinkClass('/consumer/my-orders')}>MY ORDERS</Link>
            </ul>

            {/* Right: Profile Dropdown */}
            <div className="flex items-center">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        {/* ✅ Profile pic from LS or fallback icon */}
                        {userData?.profilePicture ? (
                            <img
                                src={userData.profilePicture}
                                alt="Profile"
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-green-500"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 ring-2 ring-green-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                            </div>
                        )}
                        <ChevronDown
                            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                                dropdownOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg py-1 z-50">
                            {/* ✅ Real name and consumerId from LS */}
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {userData?.name || 'Consumer'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {userData?.consumerId || 'Consumer Account'}
                                </p>
                            </div>
                            <Link
                                to="/consumer/profile"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-sm text-gray-700 hover:text-green-600 transition-colors"
                            >
                                <User size={16} /> Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-gray-700 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white border-b md:hidden shadow-md z-40">
                    {/* ✅ User info in mobile menu */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                        {userData?.profilePicture ? (
                            <img
                                src={userData.profilePicture}
                                alt="Profile"
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-green-500"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 ring-2 ring-green-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{userData?.name || 'Consumer'}</p>
                            <p className="text-xs text-gray-500">{userData?.consumerId || 'Consumer Account'}</p>
                        </div>
                    </div>

                    <ul className="flex flex-col px-6 py-4 space-y-4 text-base font-medium">
                        <Link to="/consumer/home" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/consumer/home')}>
                            <div className="flex items-center gap-3"><Home size={18} /><span>HOME</span></div>
                        </Link>
                        <Link to="/consumer/marketplace" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/consumer/marketplace')}>
                            <div className="flex items-center gap-3"><ShoppingCart size={18} /><span>MARKETPLACE</span></div>
                        </Link>
                        <Link to="/consumer/my-orders" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/consumer/my-orders')}>
                            <div className="flex items-center gap-3"><FileText size={18} /><span>MY ORDERS</span></div>
                        </Link>
                    </ul>
                </div>
            )}
        </nav>
    );
}
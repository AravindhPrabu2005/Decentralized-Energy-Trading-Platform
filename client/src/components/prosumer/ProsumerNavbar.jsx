import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronDown, User, LogOut, Menu, Home, ShoppingCart, Package, Zap } from 'lucide-react';

export default function ProsumerNavbar() {
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
                setUserData(JSON.parse(storedUser));
            } catch {
                // Corrupted data — clear and redirect
                localStorage.clear();
                navigate('/login', { replace: true });
            }
        } else {
            // No user in LS — redirect to login
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
                <Link to="/prosumer/home">
                    <img src="/greenwave-logo.png" alt="GreenWave" className="h-16 w-auto cursor-pointer" />
                </Link>
            </div>

            {/* Center: Desktop Nav */}
            <ul className="hidden md:flex items-center space-x-10 text-[17px] font-medium">
                <Link to="/prosumer/home" className={desktopLinkClass('/prosumer/home')}>HOME</Link>
                <Link to="/prosumer/my-listings" className={desktopLinkClass('/prosumer/my-listings')}>MY LISTINGS</Link>
                <Link to="/prosumer/marketplace" className={desktopLinkClass('/prosumer/marketplace')}>MARKETPLACE</Link>
                <Link to="/prosumer/transactions" className={desktopLinkClass('/prosumer/transactions')}>TRANSACTIONS</Link>
            </ul>

            {/* Right: Profile Dropdown */}
            <div className="flex items-center">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        {/* ✅ Show profile pic from LS or fallback to User icon */}
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
                            {/* ✅ Show real name and ID from LS */}
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {userData?.name || 'Prosumer'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {userData?.prosumerId || 'Prosumer Account'}
                                </p>
                            </div>
                            <Link
                                to="/prosumer/profile"
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
                    {/* ✅ Show user info in mobile menu too */}
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
                            <p className="text-sm font-semibold text-gray-900">{userData?.name || 'Prosumer'}</p>
                            <p className="text-xs text-gray-500">{userData?.prosumerId || 'Prosumer Account'}</p>
                        </div>
                    </div>

                    <ul className="flex flex-col px-6 py-4 space-y-4 text-base font-medium">
                        <Link to="/prosumer/home" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/prosumer/home')}>
                            <div className="flex items-center gap-3"><Home size={18} /><span>HOME</span></div>
                        </Link>
                        <Link to="/prosumer/my-listings" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/prosumer/my-listings')}>
                            <div className="flex items-center gap-3"><Zap size={18} /><span>MY LISTINGS</span></div>
                        </Link>
                        <Link to="/prosumer/marketplace" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/prosumer/marketplace')}>
                            <div className="flex items-center gap-3"><ShoppingCart size={18} /><span>MARKETPLACE</span></div>
                        </Link>
                        <Link to="/prosumer/transactions" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/prosumer/transactions')}>
                            <div className="flex items-center gap-3"><Package size={18} /><span>TRANSACTIONS</span></div>
                        </Link>
                    </ul>
                </div>
            )}
        </nav>
    );
}
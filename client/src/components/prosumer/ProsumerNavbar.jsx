import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Menu } from 'lucide-react';

export default function ProsumerNavbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false); // State to manage logout status
    const dropdownRef = useRef();
    const navigate = useNavigate();

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
        if (isLoggingOut) return; // Prevent multiple clicks
        setIsLoggingOut(true); // Set logging out state
        console.log("Logging out..."); // Debug log
        console.log("LocalStorage before clear:", localStorage); // Log before clearing
        localStorage.clear(); // Clear local storage
        console.log("LocalStorage after clear:", localStorage); // Log after clearing
        navigate('/login', { replace: true }); // Navigate to login page
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b shadow-sm bg-white">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                    className="md:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <img src="/greenwave-logo.png" alt="GreenWave" className="h-16 w-auto" />
            </div>
            <ul className="hidden md:flex items-center space-x-10 text-[17px] font-medium">
                <button onClick={() => navigate('/consumer/dashboard')} className="text-gray-700 hover:text-green-600">HOME</button>
                <button onClick={() => navigate('/consumer/marketplace')} className="text-gray-700 hover:text-green-600">MARKETPLACE</button>
                <button onClick={() => navigate('/consumer/my-orders')} className="text-gray-700 hover:text-green-600">MY ORDERS</button>
            </ul>
            <div className="flex items-center">
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)} 
                        className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                        <img 
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
                            alt="Profile" 
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-green-500" 
                        />
                        <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">John Doe</p>
                                <p className="text-xs text-gray-500">Consumer Account</p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-sm text-gray-700 hover:text-green-600 transition-colors">
                                <User size={16} /> Profile
                            </button>
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
        </nav>
    );
}

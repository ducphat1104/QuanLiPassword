import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { FiLogOut, FiUser } from 'react-icons/fi';

const ProfileDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        onLogout();
        setIsOpen(false);
    };

    return (
        <div className="relative flex items-center" ref={dropdownRef}>
            {user && <span className="text-gray-600 mr-4">Chào, {user.username}!</span>}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
            >
                <FaUserCircle size={32} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-12 w-56 bg-white rounded-md shadow-xl z-20 py-1">
                    <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                        <p className="text-xs text-gray-500">Quản lý tài khoản của bạn</p>
                    </div>
                    <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FiUser className="mr-2" />
                        Chỉnh sửa hồ sơ
                    </a>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <FiLogOut className="mr-2" />
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;

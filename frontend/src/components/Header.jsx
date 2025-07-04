import React, { useState, useEffect, useRef } from 'react';
import { FaLock, FaUserCircle, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo and App Name */}
                <div className="flex items-center">
                    <FaLock className="text-blue-500 text-2xl mr-3" />
                    <h1 className="text-xl font-bold text-gray-800">Quản lý mật khẩu</h1>
                </div>

                {/* User Info */}
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
                        >
                            <span className="mr-2">{user.username}</span>
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="User Avatar"
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <FaUserCircle className="w-10 h-10 text-gray-400" />
                            )}
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                                                                <Link
                                    to="/trash"
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                    <FaTrash className="mr-2" />
                                    Thùng rác
                                </Link>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    onClick={() => { onLogout(); setDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div />
                )}
            </div>
        </header>
    );
};

export default Header;

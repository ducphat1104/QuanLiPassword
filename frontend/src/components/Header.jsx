import React, { useState, useEffect, useRef } from 'react';
import { FaLock, FaUserCircle, FaSignOutAlt, FaTrash, FaCog } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = ({
    user,
    onLogout,
    title = "Quản lý mật khẩu",
    showBackButton = false,
    backTo = "/",
    totalItems = null,
    itemType = "mật khẩu"
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef(null);

    // Handle click outside dropdown
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

    // Handle scroll for sticky header effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-card-bg/95 backdrop-blur-md shadow-lg border-b border-border-primary/50'
            : 'bg-card-bg shadow-md border-b border-border-primary'
            }`}>
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Left Side - Back Button or Logo */}
                <div className="flex items-center">
                    {showBackButton ? (
                        <Link
                            to={backTo}
                            className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-medium transition-all duration-200 hover:scale-105 p-2 rounded-lg hover:bg-bg-tertiary"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                            <span className="text-sm">Quay lại</span>
                        </Link>
                    ) : (
                        <>
                            <FaLock className="text-primary-custom text-2xl mr-3" />
                            <h1 className="text-xl font-bold text-text-primary">Quản lý mật khẩu</h1>
                        </>
                    )}
                </div>

                {/* Center - Title for Sub-pages */}
                {showBackButton && (
                    <div className="flex-1 text-center">
                        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
                    </div>
                )}

                {/* Spacer for main page to center logo */}
                {!showBackButton && <div className="flex-1"></div>}

                {/* Right Side - Theme Toggle and User Info */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* User Info - Only show on main pages (not sub-pages) */}
                    {user && !showBackButton ? (
                        <div className="relative hidden md:block" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center text-text-secondary hover:text-text-primary focus:outline-none transition-colors duration-200 p-2 rounded-lg hover:bg-bg-tertiary min-h-[48px]"
                                aria-label="User menu"
                            >
                                <span className="mr-3 text-text-primary font-medium">{user.username}</span>
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="User Avatar"
                                        className="w-8 h-8 rounded-full border-2 border-border-primary"
                                    />
                                ) : (
                                    <FaUserCircle className="w-8 h-8 text-text-tertiary" />
                                )}
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-card-bg rounded-md shadow-custom-lg py-1 z-50 ring-1 ring-border-primary border border-border-primary hidden md:block">
                                    <Link
                                        to="/profile"
                                        onClick={() => setDropdownOpen(false)}
                                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary flex items-center transition-colors duration-200"
                                    >
                                        <FaCog className="mr-2 text-text-secondary" />
                                        Cài đặt tài khoản
                                    </Link>
                                    <Link
                                        to="/trash"
                                        onClick={() => setDropdownOpen(false)}
                                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary flex items-center transition-colors duration-200"
                                    >
                                        <FaTrash className="mr-2 text-text-secondary" />
                                        Thùng rác
                                    </Link>
                                    <div className="border-t border-border-primary my-1"></div>
                                    <button
                                        onClick={() => { onLogout(); setDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-danger-custom hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors duration-200"
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
            </div>
        </header>
    );
};

export default Header;

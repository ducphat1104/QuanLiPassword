import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import toastManager from '../utils/toastManager';
import { useSwipeable } from 'react-swipeable';
import { hapticFeedback } from '../utils/haptics';
import { FaGoogle, FaFacebook, FaGithub, FaUniversity, FaKey } from 'react-icons/fa';
import { FiCopy, FiEye, FiEyeOff, FiTrash2, FiEdit, FiMoreVertical, FiLoader, FiUser, FiLock } from 'react-icons/fi';
import { useSecondaryPassword } from '../context/SecondaryPasswordContext';
import SecondaryPasswordModal from './SecondaryPassword/SecondaryPasswordModal';

// Fallback icon generator with consistent sizing
const getServiceIcon = (serviceName) => {
    const iconProps = "w-8 h-8"; // Consistent size for fallback icons
    const name = serviceName.toLowerCase();
    if (name.includes('google')) return <FaGoogle className={`${iconProps} text-red-500`} />;
    if (name.includes('facebook')) return <FaFacebook className={`${iconProps} text-blue-600`} />;
    if (name.includes('github')) return <FaGithub className={`${iconProps} text-gray-800`} />;
    if (name.includes('bank')) return <FaUniversity className={`${iconProps} text-green-600`} />;
    return <FaKey className={`${iconProps} text-gray-500`} />;
};

// Favicon component using a Logo Map for high accuracy on popular services
const Favicon = ({ serviceName }) => {
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        setUseFallback(false);
    }, [serviceName]);

    // --- Logo Map ---
    // A curated list for high-accuracy logos.
    // Key: A simple, lowercase keyword to look for in the serviceName.
    // Value: The official domain to get the logo from.
    const logoMap = {
        'facebook': 'facebook.com',
        'fb': 'facebook.com',
        'instagram': 'instagram.com',
        'ig': 'instagram.com',
        'zalo': 'zalo.me',
        'telegram': 'telegram.org',
        'google': 'google.com',
        'github': 'github.com',
        'garena': 'garena.vn',
        'shopee': 'shopee.vn',
        'tiktok': 'tiktok.com',
        // Banks & Payments
        'vnpay': 'vnpay.vn',
        'vietcombank': 'vietcombank.com.vn',
        'techcombank': 'techcombank.com.vn',
        'acb': 'acb.com.vn',
        'bidv': 'bidv.com.vn',
        'vietinbank': 'vietinbank.vn',
        'mbbank': 'mbbank.com.vn',
        'vpbank': 'vpbank.com.vn',
    };

    const getDomainFromMap = (name) => {
        if (!name) return null;
        const lowerCaseName = name.toLowerCase();
        for (const key in logoMap) {
            if (lowerCaseName.includes(key)) {
                return logoMap[key];
            }
        }
        return null; // Return null if no match is found
    };

    const domain = getDomainFromMap(serviceName);

    // If a domain was found in our map, try to fetch the logo
    if (domain && !useFallback) {
        const logoUrl = `https://logo.clearbit.com/${domain}`;
        return (
            <img
                src={logoUrl}
                alt={`${serviceName} logo`}
                className="w-8 h-8 rounded-md object-contain bg-white"
                // If Clearbit fails for our curated domain, use the default icon.
                onError={() => setUseFallback(true)}
            />
        );
    }

    // If no domain was found in the map, or if the fetch failed, show the default icon.
    return getServiceIcon(serviceName);
};

const PasswordCard = ({ data, onSoftDelete, onEditClick, token, API_URL }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [decryptedPassword, setDecryptedPassword] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [showSwipeActions, setShowSwipeActions] = useState(false);
    const [showSecondaryPasswordModal, setShowSecondaryPasswordModal] = useState(false);
    const menuRef = useRef(null);

    const { isEnabled, checkSession } = useSecondaryPassword();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleCopy = (text, type) => {
        if (!text) {
            hapticFeedback.buttonError();
            toast.warn('Không có gì để sao chép!');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            hapticFeedback.copy();
            toast.success(`${type} đã được sao chép vào clipboard!`);
        }).catch(err => {
            console.error('Lỗi khi sao chép: ', err);
            hapticFeedback.buttonError();
            toast.error('Không thể sao chép!');
        });
    };

    const togglePasswordVisibility = async () => {
        hapticFeedback.buttonPress();
        if (passwordVisible) {
            setPasswordVisible(false);
            return;
        }

        // Check if secondary password is enabled and authenticated
        if (isEnabled && !checkSession()) {
            setShowSecondaryPasswordModal(true);
            return;
        }

        await decryptAndShowPassword();
    };

    const decryptAndShowPassword = async () => {
        if (decryptedPassword) {
            setPasswordVisible(true);
            return;
        }

        setIsDecrypting(true);
        try {
            const response = await axios.get(`${API_URL}/${data._id}/decrypt`, {
                headers: { 'x-auth-token': token }
            });
            setDecryptedPassword(response.data.decryptedPassword);
            setPasswordVisible(true);
        } catch (error) {
            console.error('Không thể giải mã mật khẩu', error);
            toast.error('Không thể giải mã mật khẩu.');
        } finally {
            setIsDecrypting(false);
        }
    };

    const handleSecondaryPasswordSuccess = () => {
        setShowSecondaryPasswordModal(false);
        decryptAndShowPassword();
    };

    const handleDelete = () => {
        const deleteToastId = `delete-${data._id}`;

        toastManager.custom(
            <div>
                <p className="font-semibold mb-2">Chuyển vào thùng rác?</p>
                <p className="text-sm mb-3">Mật khẩu này sẽ được chuyển vào thùng rác và có thể khôi phục trong 30 ngày.</p>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={() => {
                            onSoftDelete(data._id);
                            toastManager.dismiss(deleteToastId);
                        }}
                        className="bg-danger-custom hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition-colors duration-200"
                    >
                        Đồng ý
                    </button>
                    <button
                        onClick={() => toastManager.dismiss(deleteToastId)}
                        className="bg-bg-tertiary hover:bg-text-tertiary text-text-primary font-bold py-1 px-3 rounded text-sm transition-colors duration-200"
                    >
                        Hủy
                    </button>
                </div>
            </div>,
            'info',
            deleteToastId,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                draggable: false,
            }
        );
    };

    // Swipe handlers
    const swipeHandlers = useSwipeable({
        onSwipedLeft: (eventData) => {
            console.log('Swiped left!', eventData);
            setSwipeOffset(-80);
            setShowSwipeActions(true);
        },
        onSwipedRight: (eventData) => {
            console.log('Swiped right!', eventData);
            setSwipeOffset(80);
            setShowSwipeActions(true);
        },
        onSwiping: (eventData) => {
            const offset = Math.max(-100, Math.min(100, eventData.deltaX));
            if (Math.abs(offset) > 15) {
                setSwipeOffset(offset);
                setShowSwipeActions(Math.abs(offset) > 30);
            }
        },
        onSwiped: (eventData) => {
            console.log('Swipe ended', eventData);
            // Reset after a delay
            setTimeout(() => {
                setSwipeOffset(0);
                setShowSwipeActions(false);
            }, 2000);
        },
        trackMouse: true, // Enable for testing on desktop
        trackTouch: true,
        preventScrollOnSwipe: true,
        delta: 15, // Increased sensitivity
        swipeDuration: 500,
        touchEventOptions: { passive: false }
    });

    const handleQuickEdit = () => {
        // Dismiss any existing delete confirmation toast
        toastManager.dismiss(`delete-${data._id}`);
        hapticFeedback.edit();
        onEditClick(data);
        setSwipeOffset(0);
        setShowSwipeActions(false);
    };

    const handleQuickDelete = () => {
        // Dismiss any existing toasts before showing delete confirmation
        toastManager.dismissByType('info'); // Dismiss any info toasts (like edit confirmations)
        handleDelete();
        setSwipeOffset(0);
        setShowSwipeActions(false);
    };

    return (
        <div className="relative overflow-hidden">
            {/* Swipe Action Backgrounds */}
            {(showSwipeActions || Math.abs(swipeOffset) > 15) && (
                <>
                    {swipeOffset > 15 && (
                        <div
                            className="absolute inset-0 bg-green-500 flex items-center justify-start pl-6 rounded-lg transition-opacity duration-200"
                            style={{ opacity: Math.min(1, Math.abs(swipeOffset) / 60) }}
                        >
                            <FiEdit className="text-white text-2xl" />
                            <span className="text-white font-bold ml-2 text-lg">Sửa</span>
                        </div>
                    )}
                    {swipeOffset < -15 && (
                        <div
                            className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 rounded-lg transition-opacity duration-200"
                            style={{ opacity: Math.min(1, Math.abs(swipeOffset) / 60) }}
                        >
                            <span className="text-white font-bold mr-2 text-lg">Xóa</span>
                            <FiTrash2 className="text-white text-2xl" />
                        </div>
                    )}
                </>
            )}

            {/* Main Card - 3D Modern Design */}
            <div
                {...swipeHandlers}
                className="bg-gradient-to-br from-card-bg via-card-bg/98 to-card-bg/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-4 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-3 hover:scale-[1.02] relative border-2 border-border-primary/50 hover:border-primary-custom/40 cursor-pointer select-none group"
                style={{
                    transform: `translateX(${Math.max(-80, Math.min(80, swipeOffset))}px)`,
                    transition: showSwipeActions ? 'none' : 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transformStyle: 'preserve-3d',
                    boxShadow: showSwipeActions ? 'none' : '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
                onMouseMove={(e) => {
                    if (!showSwipeActions) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateX = (y - centerY) / 15;
                        const rotateY = (centerX - x) / 15;

                        e.currentTarget.style.transform = `
                            translateX(${Math.max(-80, Math.min(80, swipeOffset))}px)
                            perspective(1000px)
                            rotateX(${rotateX}deg)
                            rotateY(${rotateY}deg)
                            translateY(-12px)
                            translateZ(10px)
                            scale(1.02)
                        `;
                    }
                }}
                onMouseLeave={(e) => {
                    setShowMenu(false);
                    if (!showSwipeActions) {
                        e.currentTarget.style.transform = `
                            translateX(${Math.max(-80, Math.min(80, swipeOffset))}px)
                            perspective(1000px)
                            rotateX(0deg)
                            rotateY(0deg)
                            translateY(0px)
                            translateZ(0px)
                            scale(1)
                        `;
                    }
                }}
                onClick={() => {
                    if (showSwipeActions) {
                        if (swipeOffset > 40) {
                            handleQuickEdit();
                        } else if (swipeOffset < -40) {
                            handleQuickDelete();
                        }
                    }
                }}
            >

                {/* Card Header - Compact Design */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center min-w-0 flex-1">
                        <div className="flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-primary-custom/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Favicon serviceName={data.serviceName} className="w-8 h-8 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-text-primary truncate">{data.serviceName}</h3>
                            {data.category && data.category !== 'Chưa phân loại' && (
                                <span className="text-xs bg-primary-custom/10 text-primary-custom rounded-full mt-1 inline-block">
                                    {data.category}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-text-tertiary hover:text-text-secondary transition-all duration-300 p-2 rounded-lg hover:bg-gradient-to-r hover:from-bg-tertiary/50 hover:to-bg-tertiary/30 opacity-0 group-hover:opacity-100 transform hover:scale-110 hover:rotate-90 active:scale-95"
                            aria-label="More options"
                        >
                            <FiMoreVertical className="w-4 h-4 transition-transform duration-300" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-gradient-to-br from-card-bg to-card-bg/95 backdrop-blur-sm rounded-xl shadow-2xl border border-border-primary/50 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300">
                                <button
                                    onClick={() => {
                                        // Dismiss any existing delete confirmation toast
                                        toastManager.dismiss(`delete-${data._id}`);
                                        hapticFeedback.edit();
                                        onEditClick(data);
                                        setShowMenu(false);
                                    }}
                                    className="flex items-center w-full text-left px-3 py-2.5 text-sm text-text-primary hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-400/5 transition-all duration-300 transform hover:translate-x-1"
                                >
                                    <FiEdit className="w-4 h-4 mr-2 text-text-secondary transition-transform duration-300 hover:scale-110" /> Sửa
                                </button>
                                <button
                                    onClick={() => {
                                        // Dismiss any existing toasts before showing delete confirmation
                                        toastManager.dismissByType('info');
                                        handleDelete();
                                        setShowMenu(false);
                                    }}
                                    className="flex items-center w-full text-left px-3 py-2.5 text-sm text-danger-custom hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-400/5 transition-all duration-300 transform hover:translate-x-1"
                                >
                                    <FiTrash2 className="w-4 h-4 mr-2 transition-transform duration-300 hover:scale-110" /> Xóa
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Body - Redesigned */}
                <div className="space-y-3">
                    {/* Username Section */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-text-secondary flex items-center">
                                <FiUser className="w-3 h-3 mr-1" />
                                Tên đăng nhập
                            </label>
                            <button
                                onClick={() => handleCopy(data.username, 'Tên người dùng')}
                                className="p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-primary-custom/20 hover:to-primary-custom/10 text-text-tertiary hover:text-primary-custom transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 active:translate-y-0"
                                aria-label="Copy username"
                            >
                                <FiCopy className="w-3 h-3 transition-transform duration-300 group-hover:rotate-12" />
                            </button>
                        </div>
                        <div className="bg-gradient-to-r from-bg-tertiary/30 to-bg-tertiary/20 rounded-lg px-3 py-2 text-sm text-text-primary font-mono break-all transition-all duration-300 hover:from-bg-tertiary/40 hover:to-bg-tertiary/30 hover:shadow-inner border border-transparent hover:border-primary-custom/20">
                            {data.username}
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-text-secondary flex items-center">
                                <FiLock className="w-3 h-3 mr-1" />
                                Mật khẩu
                            </label>
                            <div className="flex items-center space-x-1">
                                {passwordVisible && !isDecrypting && (
                                    <button
                                        onClick={() => handleCopy(decryptedPassword, 'Mật khẩu')}
                                        className="p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-green-500/20 hover:to-green-400/10 text-text-tertiary hover:text-green-500 transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 active:translate-y-0"
                                        aria-label="Copy password"
                                    >
                                        <FiCopy className="w-3 h-3 transition-transform duration-300 hover:rotate-12" />
                                    </button>
                                )}
                                <button
                                    onClick={togglePasswordVisibility}
                                    className="p-1.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-400/10 text-text-tertiary hover:text-blue-500 transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                                    disabled={isDecrypting}
                                >
                                    {isDecrypting ? (
                                        <FiLoader className="w-3 h-3 animate-spin" />
                                    ) : passwordVisible ? (
                                        <FiEyeOff className="w-3 h-3 transition-transform duration-300 hover:scale-110" />
                                    ) : (
                                        <FiEye className="w-3 h-3 transition-transform duration-300 hover:scale-110" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-bg-tertiary/30 to-bg-tertiary/20 rounded-lg px-3 py-2 text-sm font-mono transition-all duration-300 hover:from-bg-tertiary/40 hover:to-bg-tertiary/30 hover:shadow-inner border border-transparent hover:border-primary-custom/20">
                            <span className="text-text-primary break-all transition-all duration-300">
                                {isDecrypting ? (
                                    <span className="animate-pulse">Đang giải mã...</span>
                                ) : passwordVisible ? (
                                    <span className="animate-in fade-in duration-300">{decryptedPassword}</span>
                                ) : (
                                    <span className="tracking-wider">{'•'.repeat(8)}</span>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Password Modal */}
            <SecondaryPasswordModal
                isOpen={showSecondaryPasswordModal}
                onClose={() => setShowSecondaryPasswordModal(false)}
                serviceName={data.serviceName}
                onSuccess={handleSecondaryPasswordSuccess}
            />
        </div>
    );
};

export default PasswordCard;

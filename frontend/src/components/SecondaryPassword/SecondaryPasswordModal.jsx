import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiShield, FiX, FiClock } from 'react-icons/fi';
import { useSecondaryPassword } from '../../context/SecondaryPasswordContext';

const SecondaryPasswordModal = ({ isOpen, onClose, serviceName, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberSession, setRememberSession] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState('');
    const passwordInputRef = useRef(null);

    const { authenticate, rememberDuration, loading } = useSecondaryPassword();

    // Log debug
    useEffect(() => {
        console.log('🔐 Modal - Thời gian nhớ:', rememberDuration, 'phút, đang tải:', loading);
    }, [rememberDuration, loading]);

    // Focus vào input khi modal mở và lock body scroll
    useEffect(() => {
        if (isOpen) {
            // Lock body scroll để modal center đúng
            document.body.style.overflow = 'hidden';

            if (passwordInputRef.current) {
                setTimeout(() => {
                    passwordInputRef.current.focus();
                    console.log('🎯 Đã focus vào input mật khẩu cấp 2');
                }, 100);
            }
        } else {
            // Unlock body scroll
            document.body.style.overflow = 'unset';
        }

        // Cleanup khi component unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset form khi modal đóng
    useEffect(() => {
        if (!isOpen) {
            setPassword('');
            setShowPassword(false);
            setError('');
            setIsAuthenticating(false);
            console.log('🔄 Đã reset form modal mật khẩu cấp 2');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Vui lòng nhập mật khẩu cấp 2');
            return;
        }

        setIsAuthenticating(true);
        setError('');

        const success = await authenticate(password);

        if (success) {
            onSuccess();
            onClose();
        } else {
            setError('Mật khẩu cấp 2 không đúng');
            setPassword('');
            passwordInputRef.current?.focus();
        }

        setIsAuthenticating(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    // Handle swipe down to close on mobile
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e) => {
        if (!touchStart) return;

        const touch = e.changedTouches[0];
        const deltaY = touch.clientY - touchStart.y;
        const deltaX = Math.abs(touch.clientX - touchStart.x);

        // If swipe down more than 100px and not too much horizontal movement
        if (deltaY > 100 && deltaX < 50) {
            onClose();
        }

        setTouchStart(null);
    };

    const [touchStart, setTouchStart] = useState(null);

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.95,
            y: 20
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 20,
            transition: {
                duration: 0.2
            }
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}
                >
                    {/* Backdrop */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-sm sm:max-w-md mx-auto bg-card-bg rounded-2xl shadow-2xl border border-border-primary overflow-hidden"
                        style={{
                            maxWidth: '28rem',
                            width: '100%'
                        }}
                        onKeyDown={handleKeyDown}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        tabIndex={-1}
                    >
                        {/* Mobile swipe indicator */}
                        <div className="sm:hidden flex justify-center pt-2 pb-1">
                            <div className="w-8 h-1 bg-text-tertiary/30 rounded-full"></div>
                        </div>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-custom/10 to-blue-500/10 p-5 sm:p-6 border-b border-border-primary">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start space-x-3 flex-1 min-w-0">
                                    <div className="p-2 bg-primary-custom/20 rounded-lg flex-shrink-0">
                                        <FiShield className="w-6 h-6 sm:w-7 sm:h-7 text-primary-custom" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg sm:text-xl font-semibold text-text-primary">
                                            Xác Thực Bảo Mật
                                        </h3>
                                        <p className="text-sm sm:text-base text-text-secondary">
                                            Để xem mật khẩu của <span className="text-primary-custom font-medium">{serviceName}</span>
                                        </p>
                                    </div>
                                </div>
                                {/* Close button - Hidden on mobile, shown on tablet+ */}
                                <button
                                    onClick={onClose}
                                    className="hidden sm:flex p-2 hover:bg-bg-tertiary rounded-lg transition-colors duration-200 flex-shrink-0"
                                >
                                    <FiX className="w-5 h-5 text-text-tertiary" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text-secondary">
                                    Mật khẩu cấp 2
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="w-5 h-5 text-text-tertiary" />
                                    </div>
                                    <input
                                        ref={passwordInputRef}
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError('');
                                        }}
                                        className={`w-full pl-10 pr-12 py-3 bg-bg-tertiary border rounded-lg focus:ring-2 focus:ring-primary-custom focus:border-primary-custom transition-all duration-200 text-base ${error ? 'border-red-500' : 'border-border-primary'
                                            }`}
                                        placeholder="Nhập mật khẩu cấp 2 của bạn"
                                        disabled={isAuthenticating}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-text-primary transition-colors duration-200"
                                        disabled={isAuthenticating}
                                    >
                                        {showPassword ? (
                                            <FiEyeOff className="w-5 h-5 text-text-tertiary" />
                                        ) : (
                                            <FiEye className="w-5 h-5 text-text-tertiary" />
                                        )}
                                    </button>
                                </div>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-500 flex items-center space-x-1"
                                    >
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </motion.p>
                                )}
                            </div>

                            {/* Remember Session */}
                            <div className="flex items-start space-x-3 p-3 bg-bg-tertiary/50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="rememberSession"
                                    checked={rememberSession}
                                    onChange={(e) => setRememberSession(e.target.checked)}
                                    className="w-4 h-4 text-primary-custom bg-bg-tertiary border-border-primary rounded focus:ring-primary-custom focus:ring-2 mt-0.5 flex-shrink-0"
                                    disabled={isAuthenticating}
                                />
                                <label htmlFor="rememberSession" className="flex-1 text-sm text-text-secondary min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <FiClock className="w-4 h-4 flex-shrink-0" />
                                        <span className="break-words">
                                            {loading
                                                ? 'Đang tải...'
                                                : rememberDuration === 0
                                                    ? 'Luôn hỏi mật khẩu'
                                                    : `Nhớ trong ${rememberDuration || 30} phút`
                                            }
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-20 sm:pb-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-text-tertiary hover:text-text-primary transition-all duration-200 font-medium min-h-[44px] flex items-center justify-center"
                                    disabled={isAuthenticating}
                                >
                                    <span className="text-sm">Hủy</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAuthenticating || !password.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-custom to-blue-600 text-white rounded-lg hover:from-primary-hover hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-2 min-h-[44px]"
                                >
                                    {isAuthenticating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span className="text-sm">Đang xác thực...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiShield className="w-4 h-4" />
                                            <span className="text-sm">Xác nhận</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default SecondaryPasswordModal;

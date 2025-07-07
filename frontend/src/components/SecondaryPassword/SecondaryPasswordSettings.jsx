import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiEye, FiEyeOff, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { useSecondaryPassword } from '../../context/SecondaryPasswordContext';

const SecondaryPasswordSettings = () => {
    const {
        isEnabled,
        rememberDuration,
        loading,
        enable,
        disable,
        updateRememberDuration
    } = useSecondaryPassword();

    const [showSetupForm, setShowSetupForm] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(rememberDuration);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const durationOptions = [
        { value: 5, label: '5 phút' },
        { value: 15, label: '15 phút' },
        { value: 30, label: '30 phút' },
        { value: 60, label: '1 giờ' },
        { value: 0, label: 'Luôn hỏi' }
    ];

    const validatePassword = (pwd) => {
        const errors = {};
        if (!pwd) {
            errors.password = 'Vui lòng nhập mật khẩu';
        } else if (pwd.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        return errors;
    };

    const handleEnable = async () => {
        const passwordErrors = validatePassword(password);
        const newErrors = { ...passwordErrors };

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setIsProcessing(true);
        const success = await enable(password);

        if (success) {
            setShowSetupForm(false);
            setPassword('');
            setConfirmPassword('');
            setErrors({});
        }

        setIsProcessing(false);
    };

    const handleDisable = async () => {
        setIsProcessing(true);
        await disable();
        setIsProcessing(false);
    };

    const handleDurationChange = async (duration) => {
        setSelectedDuration(duration);
        if (isEnabled) {
            await updateRememberDuration(duration);
        }
    };

    if (loading) {
        return (
            <div className="bg-card-bg rounded-2xl border border-border-primary p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-bg-tertiary rounded w-1/3"></div>
                    <div className="h-4 bg-bg-tertiary rounded w-2/3"></div>
                    <div className="h-10 bg-bg-tertiary rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card-bg rounded-2xl border border-border-primary overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-custom/10 to-blue-500/10 p-6 border-b border-border-primary">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-custom/20 rounded-lg">
                        <FiShield className="w-6 h-6 text-primary-custom" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">
                            Mật Khẩu Cấp 2
                        </h3>
                        <p className="text-sm text-text-secondary">
                            Thêm lớp bảo mật khi xem mật khẩu
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Enable/Disable Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-bg-tertiary/30 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${isEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <FiLock className={`w-5 h-5 ${isEnabled ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-text-primary">
                                {isEnabled ? 'Đã bật' : 'Đã tắt'}
                            </p>
                            <p className="text-sm text-text-secondary break-words">
                                {isEnabled ? 'Yêu cầu xác thực khi xem mật khẩu' : 'Không yêu cầu xác thực'}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end sm:justify-start">
                        {!isEnabled ? (
                            <button
                                onClick={() => setShowSetupForm(true)}
                                disabled={isProcessing}
                                className="px-6 py-2.5 bg-primary-custom text-white rounded-lg hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50 font-medium text-sm min-w-[80px]"
                            >
                                Bật
                            </button>
                        ) : (
                            <button
                                onClick={handleDisable}
                                disabled={isProcessing}
                                className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 font-medium text-sm min-w-[80px]"
                            >
                                {isProcessing ? 'Đang tắt...' : 'Tắt'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Setup Form */}
                {showSetupForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 border border-border-primary rounded-lg p-4"
                    >
                        <h4 className="font-medium text-text-primary">Thiết lập mật khẩu cấp 2</h4>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">
                                Mật khẩu cấp 2
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors({ ...errors, password: '' });
                                    }}
                                    className={`w-full pr-10 py-3 px-3 bg-bg-tertiary border rounded-lg focus:ring-2 focus:ring-primary-custom focus:border-primary-custom transition-all duration-200 text-base ${errors.password ? 'border-red-500' : 'border-border-primary'
                                        }`}
                                    placeholder="Nhập mật khẩu cấp 2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <FiEyeOff className="w-4 h-4 text-text-tertiary" />
                                    ) : (
                                        <FiEye className="w-4 h-4 text-text-tertiary" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setErrors({ ...errors, confirmPassword: '' });
                                    }}
                                    className={`w-full pr-10 py-3 px-3 bg-bg-tertiary border rounded-lg focus:ring-2 focus:ring-primary-custom focus:border-primary-custom transition-all duration-200 text-base ${errors.confirmPassword ? 'border-red-500' : 'border-border-primary'
                                        }`}
                                    placeholder="Nhập lại mật khẩu cấp 2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <FiEyeOff className="w-4 h-4 text-text-tertiary" />
                                    ) : (
                                        <FiEye className="w-4 h-4 text-text-tertiary" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setShowSetupForm(false);
                                    setPassword('');
                                    setConfirmPassword('');
                                    setErrors({});
                                }}
                                className="flex-1 px-4 py-3 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-text-tertiary hover:text-text-primary transition-all duration-200 flex items-center justify-center space-x-2 min-h-[44px]"
                            >
                                <FiX className="w-4 h-4" />
                                <span className="text-sm font-medium">Hủy</span>
                            </button>
                            <button
                                onClick={handleEnable}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-3 bg-primary-custom text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 min-h-[44px]"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="text-sm font-medium">Đang thiết lập...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCheck className="w-4 h-4" />
                                        <span className="text-sm font-medium">Bật mật khẩu cấp 2</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Remember Duration Settings */}
                {isEnabled && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <FiClock className="w-5 h-5 text-text-secondary" />
                            <h4 className="font-medium text-text-primary">Thời gian nhớ</h4>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {durationOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleDurationChange(option.value)}
                                    className={`p-3 rounded-lg border transition-all duration-200 min-h-[48px] flex items-center justify-center ${selectedDuration === option.value
                                        ? 'border-primary-custom bg-primary-custom/10 text-primary-custom'
                                        : 'border-border-primary bg-bg-tertiary text-text-secondary hover:border-primary-custom/50'
                                        }`}
                                >
                                    <div className="text-sm font-medium text-center">{option.label}</div>
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-text-tertiary">
                            {selectedDuration === 0
                                ? 'Sẽ hỏi mật khẩu cấp 2 mỗi lần xem mật khẩu'
                                : `Sau khi xác thực, sẽ không hỏi lại trong ${selectedDuration} phút`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecondaryPasswordSettings;

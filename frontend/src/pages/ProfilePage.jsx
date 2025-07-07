import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import toastManager from '../utils/toastManager';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import AuthContext from '../context/AuthContext';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator'; // Component hiển thị độ mạnh mật khẩu
import BottomNavigation from '../components/BottomNavigation';
import SecondaryPasswordSettings from '../components/SecondaryPassword/SecondaryPasswordSettings';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSave, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';

// API URL cho authentication endpoints
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/auth`
    : 'http://localhost:5000/api/auth';

/**
 * Component trang cài đặt tài khoản
 * Cho phép user cập nhật thông tin cá nhân và đổi mật khẩu
 */
const ProfilePage = () => {
    const { user, token, setUser, logout } = useContext(AuthContext); // Lấy thông tin user từ context
    const [loading, setLoading] = useState(false); // Trạng thái loading khi gọi API

    // Hàm xử lý đăng xuất với toast confirmation (chống spam)
    const handleLogout = () => {
        const logoutToastId = 'logout-confirmation';

        // Sử dụng toast manager để tránh spam
        toastManager.custom(
            <div className="flex flex-col gap-3">
                <p className="font-medium">Bạn có chắc chắn muốn đăng xuất không?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            logout();
                            toastManager.dismiss(logoutToastId);
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Đăng xuất
                    </button>
                    <button
                        onClick={() => toastManager.dismiss(logoutToastId)}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        Hủy
                    </button>
                </div>
            </div>,
            'info',
            logoutToastId,
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false
            }
        );
    };

    // State cho việc cập nhật thông tin profile
    const [profileData, setProfileData] = useState({
        username: user?.username || ''
    });

    // State cho việc đổi mật khẩu
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // State điều khiển hiển thị/ẩn mật khẩu
    const [showPasswords, setShowPasswords] = useState({
        current: false,  // Hiển thị mật khẩu hiện tại
        new: false,      // Hiển thị mật khẩu mới
        confirm: false   // Hiển thị xác nhận mật khẩu
    });

    /**
     * Xử lý cập nhật thông tin profile (username)
     * @param {Event} e - Form submit event
     */
    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        // Validation phía frontend
        if (!profileData.username.trim()) {
            toastManager.error('Username không được để trống');
            return;
        }

        setLoading(true);
        try {
            // Gọi API cập nhật profile
            const response = await axios.put(`${API_URL}/profile`, {
                username: profileData.username.trim()
            }, {
                headers: { 'x-auth-token': token }
            });

            if (response.data.success) {
                // Cập nhật user trong context sau khi thành công
                setUser(response.data.user);
                toastManager.success('Cập nhật thông tin thành công!');
            }
        } catch (error) {
            // Xử lý lỗi validation từ backend
            if (error.response?.data?.errors) {
                // Hiển thị từng lỗi validation
                error.response.data.errors.forEach(err => {
                    toastManager.error(err.msg);
                });
            } else {
                toastManager.error(error.response?.data?.msg || 'Cập nhật thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Xử lý đổi mật khẩu
     * @param {Event} e - Form submit event
     */
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Validation phía frontend
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toastManager.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toastManager.error('Mật khẩu mới không khớp');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toastManager.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            // Gọi API đổi mật khẩu
            const response = await axios.put(`${API_URL}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { 'x-auth-token': token }
            });

            if (response.data.success) {
                // Reset form sau khi thành công
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                toastManager.success('Đổi mật khẩu thành công!');
            }
        } catch (error) {
            // Xử lý lỗi validation từ backend
            if (error.response?.data?.errors) {
                // Hiển thị từng lỗi validation
                error.response.data.errors.forEach(err => {
                    toastManager.error(err.msg);
                });
            } else {
                toastManager.error(error.response?.data?.msg || 'Đổi mật khẩu thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Toggle hiển thị/ẩn mật khẩu
     * @param {string} field - Trường mật khẩu cần toggle (current, new, confirm)
     */
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <div className="min-h-screen bg-bg-secondary transition-colors duration-300 pb-20 md:pb-0">
            <Header
                title="Cài đặt tài khoản"
                showBackButton={true}
                backTo="/"
            />
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="max-w-4xl mx-auto">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Profile Information Section */}
                        <div className="bg-card-bg rounded-lg shadow-custom p-6 border border-border-primary">
                            <div className="flex items-center mb-6">
                                <FaUser className="text-primary-custom text-xl mr-3" />
                                <h2 className="text-xl font-semibold text-text-primary">Thông Tin Cá Nhân</h2>
                            </div>

                            <form onSubmit={handleProfileUpdate}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Tên đăng nhập
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            username: e.target.value
                                        })}
                                        className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-custom text-text-primary transition-colors duration-200"
                                        placeholder="Nhập tên đăng nhập"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-primary-custom text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        <FaSave className="mr-2" />
                                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setProfileData({ username: user?.username || '' })}
                                        className="flex items-center px-4 py-2 bg-text-tertiary text-white rounded-md hover:bg-text-secondary transition-colors duration-200"
                                    >
                                        <FaTimes className="mr-2" />
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Password Change Section */}
                        <div className="bg-card-bg rounded-lg shadow-custom p-6 border border-border-primary">
                            <div className="flex items-center mb-6">
                                <FaLock className="text-danger-custom text-xl mr-3" />
                                <h2 className="text-xl font-semibold text-text-primary">Đổi Mật Khẩu</h2>
                            </div>

                            <form onSubmit={handlePasswordChange}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Mật khẩu hiện tại
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                currentPassword: e.target.value
                                            })}
                                            className="w-full px-3 py-3 pr-12 bg-input-bg border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-custom text-text-primary transition-colors duration-200"
                                            placeholder="Nhập mật khẩu hiện tại"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors duration-200 p-1"
                                        >
                                            {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                newPassword: e.target.value
                                            })}
                                            className="w-full px-3 py-3 pr-12 bg-input-bg border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-custom text-text-primary transition-colors duration-200"
                                            placeholder="Nhập mật khẩu mới"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors duration-200 p-1"
                                        >
                                            {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {passwordData.newPassword && (
                                        <PasswordStrengthIndicator
                                            password={passwordData.newPassword}
                                            showDetails={true}
                                        />
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({
                                                ...passwordData,
                                                confirmPassword: e.target.value
                                            })}
                                            className="w-full px-3 py-3 pr-12 bg-input-bg border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-custom text-text-primary transition-colors duration-200"
                                            placeholder="Nhập lại mật khẩu mới"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors duration-200 p-1"
                                        >
                                            {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaLock className="mr-2" />
                                        {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        })}
                                        className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        <FaTimes className="mr-2" />
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Secondary Password Settings */}
                    <div className="mt-8">
                        <SecondaryPasswordSettings />
                    </div>

                    {/* Logout Section */}
                    <div className="mt-8 bg-card-bg rounded-lg shadow-custom p-6 border border-border-primary">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-text-primary mb-2">Đăng xuất</h3>
                                <p className="text-text-secondary text-sm">
                                    Đăng xuất khỏi tài khoản trên thiết bị này
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-3 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
                            >
                                <FaSignOutAlt className="text-lg" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation for Mobile */}
            <BottomNavigation />
        </div>
    );
};

export default ProfilePage;

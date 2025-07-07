import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toastManager from '../utils/toastManager';

const SecondaryPasswordContext = createContext();

export const useSecondaryPassword = () => {
    const context = useContext(SecondaryPasswordContext);
    if (!context) {
        throw new Error('useSecondaryPassword phải được sử dụng trong SecondaryPasswordProvider');
    }
    return context;
};

export const SecondaryPasswordProvider = ({ children }) => {
    const [isEnabled, setIsEnabled] = useState(false); // Trạng thái bật/tắt mật khẩu cấp 2
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Trạng thái đã xác thực
    const [expiresAt, setExpiresAt] = useState(null); // Thời gian hết hạn xác thực
    const [rememberDuration, setRememberDuration] = useState(30); // Thời gian nhớ (phút)
    const [loading, setLoading] = useState(true); // Trạng thái đang tải

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Kiểm tra xem mật khẩu cấp 2 có được bật và lấy cài đặt
    const checkSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/api/auth/secondary-password/settings`, {
                headers: { 'x-auth-token': token }
            });

            setIsEnabled(response.data.enabled);
            setRememberDuration(response.data.rememberDuration || 30);
            console.log('🔐 Cài đặt mật khẩu cấp 2 đã tải:', response.data);
        } catch (error) {
            console.error('❌ Lỗi kiểm tra cài đặt mật khẩu cấp 2:', error);
            // Đặt giá trị mặc định khi có lỗi
            setIsEnabled(false);
            setRememberDuration(30);
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra xem phiên hiện tại có còn hợp lệ không
    const checkSession = () => {
        if (!isEnabled) return true;

        const now = new Date().getTime();
        if (expiresAt && now < expiresAt) {
            return true;
        }

        setIsAuthenticated(false);
        setExpiresAt(null);
        console.log('⏰ Phiên xác thực mật khẩu cấp 2 đã hết hạn');
        return false;
    };

    // Xác thực với mật khẩu cấp 2
    const authenticate = async (password) => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔑 Đang xác thực mật khẩu cấp 2...');

            const response = await axios.post(`${API_URL}/api/auth/secondary-password/verify`,
                { password },
                { headers: { 'x-auth-token': token } }
            );

            if (response.data.success) {
                setIsAuthenticated(true);
                const expirationTime = new Date().getTime() + (rememberDuration * 60 * 1000);
                setExpiresAt(expirationTime);

                console.log(`✅ Xác thực thành công! Hết hạn sau ${rememberDuration} phút`);
                toastManager.success('Xác thực thành công!');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Lỗi xác thực mật khẩu cấp 2:', error);
            if (error.response?.status === 401) {
                toastManager.error('Mật khẩu cấp 2 không đúng');
            } else {
                toastManager.error('Lỗi xác thực');
            }
            return false;
        }
    };

    // Khóa/xóa xác thực
    const lock = () => {
        setIsAuthenticated(false);
        setExpiresAt(null);
        console.log('🔒 Đã khóa xem mật khẩu');
        toastManager.info('Đã khóa xem mật khẩu');
    };

    // Bật mật khẩu cấp 2
    const enable = async (password) => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔧 Đang bật mật khẩu cấp 2...');

            const response = await axios.post(`${API_URL}/api/auth/secondary-password/enable`,
                { password, rememberDuration },
                { headers: { 'x-auth-token': token } }
            );

            if (response.data.success) {
                setIsEnabled(true);
                console.log('✅ Đã bật mật khẩu cấp 2 thành công');
                toastManager.success('Đã bật mật khẩu cấp 2');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Lỗi bật mật khẩu cấp 2:', error);
            toastManager.error('Không thể bật mật khẩu cấp 2');
            return false;
        }
    };

    // Tắt mật khẩu cấp 2
    const disable = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('🔧 Đang tắt mật khẩu cấp 2...');

            const response = await axios.post(`${API_URL}/api/auth/secondary-password/disable`, {}, {
                headers: { 'x-auth-token': token }
            });

            if (response.data.success) {
                setIsEnabled(false);
                setIsAuthenticated(false);
                setExpiresAt(null);
                console.log('✅ Đã tắt mật khẩu cấp 2 thành công');
                toastManager.success('Đã tắt mật khẩu cấp 2');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Lỗi tắt mật khẩu cấp 2:', error);
            toastManager.error('Không thể tắt mật khẩu cấp 2');
            return false;
        }
    };

    // Cập nhật thời gian nhớ
    const updateRememberDuration = async (duration) => {
        try {
            const token = localStorage.getItem('token');
            console.log(`🔧 Đang cập nhật thời gian nhớ: ${duration} phút`);

            const response = await axios.put(`${API_URL}/api/auth/secondary-password/settings`,
                { rememberDuration: duration },
                { headers: { 'x-auth-token': token } }
            );

            if (response.data.success) {
                setRememberDuration(duration);
                console.log(`✅ Đã cập nhật thời gian nhớ: ${duration} phút`);
                toastManager.success('Đã cập nhật cài đặt');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Lỗi cập nhật cài đặt:', error);
            toastManager.error('Không thể cập nhật cài đặt');
            return false;
        }
    };

    // Tự động kiểm tra phiên mỗi phút
    useEffect(() => {
        if (!isEnabled) return;

        const interval = setInterval(() => {
            checkSession();
        }, 60000); // Kiểm tra mỗi phút

        return () => clearInterval(interval);
    }, [isEnabled, expiresAt]);

    // Tải cài đặt khi component mount
    useEffect(() => {
        console.log('🔄 Đang tải cài đặt mật khẩu cấp 2...');
        checkSettings();
    }, []);

    const value = {
        isEnabled,
        isAuthenticated,
        expiresAt,
        rememberDuration,
        loading,
        checkSession,
        authenticate,
        lock,
        enable,
        disable,
        updateRememberDuration,
        checkSettings
    };

    return (
        <SecondaryPasswordContext.Provider value={value}>
            {children}
        </SecondaryPasswordContext.Provider>
    );
};

export default SecondaryPasswordContext;

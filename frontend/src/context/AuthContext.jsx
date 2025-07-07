import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

// const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/auth` : 'http://localhost:5000/api/auth';
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/auth`
    : 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token')); // Token xác thực
    const [user, setUser] = useState(null); // Thông tin người dùng
    const [loading, setLoading] = useState(true); // Trạng thái đang tải

    // Hàm thiết lập header authorization cho tất cả axios requests
    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            localStorage.setItem('token', token);
            console.log('🔑 Đã thiết lập token xác thực');
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            localStorage.removeItem('token');
            console.log('🗑️ Đã xóa token xác thực');
        }
    };

    // Effect để tải user khi component mount
    useEffect(() => {
        console.log('🔄 Đang tải thông tin người dùng...');
        const loadUser = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                setAuthToken(savedToken);
                try {
                    const res = await axios.get(`${API_URL}/me`);
                    setUser(res.data);
                    setToken(savedToken);
                    console.log('✅ Đã tải thông tin người dùng:', res.data.username);
                } catch (err) {
                    console.error('❌ Lỗi tải thông tin người dùng:', err);
                    setAuthToken(null);
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []); // Run only once on mount

    // Effect to handle auto-logout timer based on user activity
    useEffect(() => {
        let inactivityTimer;

        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                // The logout function will only be called if there's a token
                logout(true);
            }, 15 * 60 * 1000); // 15 minutes
        };

        const userActivityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

        // If user is logged in, setup listeners
        if (token) {
            userActivityEvents.forEach(event => {
                window.addEventListener(event, resetInactivityTimer);
            });
            // Start the timer
            resetInactivityTimer();
        }

        // Cleanup function runs when component unmounts or token changes
        return () => {
            clearTimeout(inactivityTimer);
            userActivityEvents.forEach(event => {
                window.removeEventListener(event, resetInactivityTimer);
            });
        };
    }, [token]); // This effect depends on the token state

    const login = async (username, password) => {
        try {
            const res = await axios.post(`${API_URL}/login`, { username, password });
            setAuthToken(res.data.token); // Set token first
            setToken(res.data.token);

            // Fetch user data after login
            const userRes = await axios.get(`${API_URL}/me`);
            setUser(userRes.data);

            toast.success('Đăng nhập thành công!');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Đăng nhập thất bại');
            console.error(err);
        }
    };

    const register = async (username, password) => {
        try {
            console.log('🔐 Frontend - Đang gửi request đăng ký:', { username, passwordLength: password?.length });
            console.log('🌐 API URL:', `${API_URL}/register`);

            const res = await axios.post(`${API_URL}/register`, { username, password });
            console.log('✅ Frontend - Đăng ký thành công, nhận token');

            setAuthToken(res.data.token); // Set token first
            setToken(res.data.token);

            // Fetch user data after registration
            const userRes = await axios.get(`${API_URL}/me`);
            setUser(userRes.data);

            toast.success('Đăng ký thành công!');
        } catch (err) {
            console.error('❌ Frontend - Lỗi đăng ký:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message,
                url: err.config?.url,
                method: err.config?.method
            });
            console.error('📋 Chi tiết response data:', err.response?.data);

            // Hiển thị lỗi từ server (chỉ khi client-side validation không bắt được)
            if (err.response?.data?.errors && err.response.data.errors.length > 0) {
                const validationErrors = err.response.data.errors.map(error => error.msg);
                const errorMessage = `Mật khẩu chưa đủ mạnh:\n${validationErrors.join('\n')}`;
                toast.error(errorMessage, {
                    style: {
                        whiteSpace: 'pre-line'
                    }
                });
            } else {
                toast.error(err.response?.data?.msg || err.response?.data?.message || 'Đăng ký thất bại');
            }
            console.error(err);
        }
    };

    const logout = (isAutoLogout = false) => {
        const wasLoggedIn = !!token; // Check if user was logged in before clearing
        setAuthToken(null);
        setToken(null);
        setUser(null);

        if (isAutoLogout && wasLoggedIn) {
            toast.warn('Bạn đã tự động đăng xuất do không hoạt động.');
        } else if (wasLoggedIn) {
            toast.info('Bạn đã đăng xuất.');
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, loading, login, register, logout, setAuthToken, setUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

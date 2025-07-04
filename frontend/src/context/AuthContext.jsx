import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

// const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/auth` : 'http://localhost:5000/api/auth';
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/auth`
  : 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to set the authorization header for all axios requests
    const setAuthToken = (token) => {
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['x-auth-token'];
            localStorage.removeItem('token');
        }
    };

    // Effect to load user on initial mount
    useEffect(() => {
        // console.log('Env:', import.meta.env); // Xem tất cả biến môi trường
        // console.log('API URL:', import.meta.env.VITE_API_URL); // Kiểm tra biến cụ thể
        const loadUser = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                setAuthToken(savedToken);
                try {
                    const res = await axios.get(`${API_URL}/me`);
                    setUser(res.data);
                    setToken(savedToken);
                } catch (err) {
                    console.error('Failed to load user', err);
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
            const res = await axios.post(`${API_URL}/register`, { username, password });
            setAuthToken(res.data.token); // Set token first
            setToken(res.data.token);

            // Fetch user data after registration
            const userRes = await axios.get(`${API_URL}/me`);
            setUser(userRes.data);

            toast.success('Đăng ký thành công!');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Đăng ký thất bại');
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
        <AuthContext.Provider value={{ token, user, loading, login, register, logout, setAuthToken }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

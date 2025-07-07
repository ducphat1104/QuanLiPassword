import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * Context để quản lý theme (dark/light mode)
 * Lưu trữ theme preference trong localStorage
 */
const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Khởi tạo theme từ localStorage hoặc system preference
    const [theme, setTheme] = useState(() => {
        // Kiểm tra localStorage trước
        const savedTheme = localStorage.getItem('password-vault-theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Nếu không có trong localStorage, check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    });

    // Effect để apply theme vào document
    useEffect(() => {
        const root = document.documentElement;
        
        // Remove previous theme classes
        root.classList.remove('light', 'dark');
        
        // Add current theme class
        root.classList.add(theme);
        
        // Save to localStorage
        localStorage.setItem('password-vault-theme', theme);
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
        }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            // Chỉ auto-change nếu user chưa set preference
            const savedTheme = localStorage.getItem('password-vault-theme');
            if (!savedTheme) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    /**
     * Toggle giữa dark và light mode
     */
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    /**
     * Set theme cụ thể
     * @param {string} newTheme - 'light' hoặc 'dark'
     */
    const setThemeMode = (newTheme) => {
        if (newTheme === 'light' || newTheme === 'dark') {
            setTheme(newTheme);
        }
    };

    /**
     * Reset theme về system preference
     */
    const resetToSystemTheme = () => {
        localStorage.removeItem('password-vault-theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemTheme);
    };

    const value = {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setThemeMode,
        resetToSystemTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

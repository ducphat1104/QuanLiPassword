import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

/**
 * Component toggle dark/light mode
 * Hiển thị icon sun/moon và cho phép switch theme
 */
const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
                relative inline-flex items-center justify-center
                w-10 h-10 rounded-lg
                bg-bg-tertiary hover:bg-border-primary
                border border-border-primary
                transition-all duration-300 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-primary-custom focus:ring-offset-2
                group
                ${className}
            `}
            title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sun Icon - hiển thị khi dark mode */}
            <FaSun 
                className={`
                    absolute text-yellow-500 text-lg
                    transition-all duration-300 ease-in-out
                    ${isDark 
                        ? 'opacity-100 rotate-0 scale-100' 
                        : 'opacity-0 rotate-90 scale-75'
                    }
                `}
            />
            
            {/* Moon Icon - hiển thị khi light mode */}
            <FaMoon 
                className={`
                    absolute text-blue-600 text-lg
                    transition-all duration-300 ease-in-out
                    ${!isDark 
                        ? 'opacity-100 rotate-0 scale-100' 
                        : 'opacity-0 -rotate-90 scale-75'
                    }
                `}
            />
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-lg bg-primary-custom opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        </button>
    );
};

export default ThemeToggle;

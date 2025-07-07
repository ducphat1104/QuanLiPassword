import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';

// Custom Toast Component
const CustomToast = ({ type, message, onClose }) => {
    const icons = {
        success: <FiCheck className="text-green-500" />,
        error: <FiX className="text-red-500" />,
        warning: <FiAlertTriangle className="text-yellow-500" />,
        info: <FiInfo className="text-blue-500" />
    };

    const bgColors = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`
                flex items-center p-4 rounded-lg border shadow-lg backdrop-blur-sm
                ${bgColors[type]}
                max-w-sm mx-auto
            `}
        >
            <div className="flex-shrink-0 mr-3">
                {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                    {message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 ml-3 text-text-tertiary hover:text-text-secondary transition-colors"
            >
                <FiX className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

// Custom Toast Container with responsive positioning
export const ResponsiveToastContainer = () => {
    return (
        <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            className="custom-toast-container"
            toastClassName="custom-toast"
            bodyClassName="custom-toast-body"
            progressClassName="custom-toast-progress"
        />
    );
};

// Simple helper functions - styling handled by CSS
export const showToast = {
    success: (message) => toast.success(message, {
        icon: '✅'
    }),

    error: (message) => toast.error(message, {
        icon: '❌'
    }),

    warning: (message) => toast.warning(message, {
        icon: '⚠️'
    }),

    info: (message) => toast.info(message, {
        icon: 'ℹ️'
    })
};

export default CustomToast;

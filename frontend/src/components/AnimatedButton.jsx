import React from 'react';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

const AnimatedButton = ({ 
    children, 
    loading = false, 
    disabled = false, 
    variant = "primary",
    size = "lg",
    icon: Icon,
    ...props 
}) => {
    const variants = {
        primary: "bg-gradient-to-r from-primary-custom to-secondary-custom hover:from-primary-hover hover:to-purple-600 text-white shadow-lg hover:shadow-xl",
        secondary: "bg-white border-2 border-gray-200 hover:border-primary-custom text-gray-700 hover:text-primary-custom",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800"
    };

    const sizes = {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg"
    };

    const buttonVariants = {
        idle: {
            scale: 1,
            y: 0
        },
        hover: {
            scale: 1.02,
            y: -2,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        },
        tap: {
            scale: 0.98,
            y: 0,
            transition: {
                duration: 0.1
            }
        }
    };

    const iconVariants = {
        idle: { rotate: 0 },
        loading: { 
            rotate: 360,
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    return (
        <motion.button
            className={`
                relative w-full rounded-xl font-semibold
                focus:outline-none focus:ring-4 focus:ring-primary-custom/20
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 overflow-hidden
                ${variants[variant]}
                ${sizes[size]}
            `}
            variants={buttonVariants}
            initial="idle"
            whileHover={!disabled && !loading ? "hover" : "idle"}
            whileTap={!disabled && !loading ? "tap" : "idle"}
            disabled={disabled || loading}
            {...props}
        >
            {/* Background Shimmer Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                }}
            />

            {/* Button Content */}
            <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                    <motion.div
                        variants={iconVariants}
                        animate="loading"
                    >
                        <FiLoader className="text-xl" />
                    </motion.div>
                ) : Icon ? (
                    <Icon className="text-xl" />
                ) : null}
                
                <span className="font-semibold">
                    {loading ? "Đang xử lý..." : children}
                </span>
            </div>

            {/* Ripple Effect */}
            <motion.div
                className="absolute inset-0 bg-white/20 rounded-xl"
                initial={{ scale: 0, opacity: 1 }}
                whileTap={{ scale: 1, opacity: 0 }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
};

export default AnimatedButton;

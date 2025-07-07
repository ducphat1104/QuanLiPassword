import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const AnimatedInput = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    name,
    required = false,
    icon: Icon,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const labelVariants = {
        default: {
            y: 0,
            scale: 1,
            color: "#6b7280"
        },
        focused: {
            y: -24,
            scale: 0.85,
            color: "#3b82f6"
        }
    };

    const inputVariants = {
        default: {
            borderColor: "#e5e7eb",
            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)"
        },
        focused: {
            borderColor: "#3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
        }
    };

    return (
        <div className="relative mb-6">
            <motion.div
                className="relative"
                variants={inputVariants}
                animate={isFocused ? "focused" : "default"}
                transition={{ duration: 0.2 }}
            >
                {/* Icon */}
                {Icon && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                        <Icon className={`text-lg transition-colors duration-200 ${isFocused ? 'text-primary-custom' : 'text-gray-400 dark:text-gray-500'
                            }`} />
                    </div>
                )}

                {/* Input */}
                <motion.input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                        w-full h-14 px-4 pt-6 pb-2 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl
                        focus:outline-none focus:bg-white dark:focus:bg-gray-600 transition-all duration-200
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        ${Icon ? 'pl-12' : 'pl-4'}
                        ${isPassword ? 'pr-12' : 'pr-4'}
                    `}
                    placeholder=""
                    required={required}
                    variants={inputVariants}
                    animate={isFocused ? "focused" : "default"}
                    {...props}
                />

                {/* Floating Label */}
                <motion.label
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none font-medium text-gray-600 dark:text-gray-300"
                    variants={labelVariants}
                    animate={isFocused || value ? "focused" : "default"}
                    transition={{ duration: 0.2 }}
                    style={{ left: Icon ? '3rem' : '1rem' }}
                >
                    {label}
                </motion.label>

                {/* Password Toggle */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                        {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                    </button>
                )}
            </motion.div>

            {/* Focus Ring */}
            <motion.div
                className="absolute inset-0 rounded-xl border-2 border-primary-custom pointer-events-none"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{
                    opacity: isFocused ? 1 : 0,
                    scale: isFocused ? 1 : 1.05
                }}
                transition={{ duration: 0.2 }}
            />
        </div>
    );
};

export default AnimatedInput;

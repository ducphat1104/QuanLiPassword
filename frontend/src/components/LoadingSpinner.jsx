import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = "md", text = "Đang tải..." }) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8", 
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const spinVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative">
                {/* Outer ring */}
                <motion.div
                    className={`${sizeClasses[size]} border-4 border-bg-tertiary rounded-full`}
                    variants={pulseVariants}
                    animate="animate"
                />
                
                {/* Inner spinning ring */}
                <motion.div
                    className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-primary-custom rounded-full`}
                    variants={spinVariants}
                    animate="animate"
                />
                
                {/* Center dot */}
                <motion.div
                    className="absolute inset-0 m-auto w-2 h-2 bg-primary-custom rounded-full"
                    variants={pulseVariants}
                    animate="animate"
                />
            </div>
            
            {text && (
                <motion.p
                    className="mt-4 text-text-secondary text-sm font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default LoadingSpinner;

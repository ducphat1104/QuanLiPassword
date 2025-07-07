import React from 'react';
import { motion } from 'framer-motion';

const AuthBackground = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-custom via-secondary-custom to-purple-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
                {/* Floating Circles */}
                <motion.div
                    className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-40 right-32 w-96 h-96 bg-white/5 rounded-full blur-2xl"
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 60, 0],
                        scale: [1, 0.8, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 left-1/3 w-64 h-64 bg-white/8 rounded-full blur-xl"
                    animate={{
                        x: [0, 120, 0],
                        y: [0, -80, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default AuthBackground;

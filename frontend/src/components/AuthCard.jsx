import React from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaShieldAlt } from 'react-icons/fa';
import usePerformance from '../hooks/usePerformance';

const AuthCard = ({ children, title, subtitle }) => {
    const { shouldUseHeavyEffects, performanceLevel } = usePerformance();

    // Performance-based animation variants
    const cardVariants = {
        hidden: {
            opacity: 0,
            y: shouldUseHeavyEffects() ? 50 : 20,
            scale: shouldUseHeavyEffects() ? 0.9 : 0.98
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: shouldUseHeavyEffects() ? 0.6 : 0.3,
                ease: shouldUseHeavyEffects() ? [0.25, 0.46, 0.45, 0.94] : "easeOut"
            }
        }
    };

    const iconVariants = {
        hidden: {
            scale: 0,
            rotate: shouldUseHeavyEffects() ? -180 : 0
        },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                delay: shouldUseHeavyEffects() ? 0.3 : 0.1,
                duration: shouldUseHeavyEffects() ? 0.5 : 0.2,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md"
            >
                {/* Logo/Icon Section */}
                <motion.div
                    className="text-center mb-8"
                    variants={iconVariants}
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 border border-white/30">
                        <FaShieldAlt className="text-3xl text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Password Vault</h1>
                    <p className="text-white/80 text-sm">Bảo mật mật khẩu của bạn</p>
                </motion.div>

                {/* Main Card - Performance Optimized */}
                <motion.div
                    className={`${shouldUseHeavyEffects()
                            ? "bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl"
                            : "bg-white/98 dark:bg-gray-800/98 rounded-2xl shadow-lg"
                        } border border-white/20 dark:border-gray-700/50 overflow-hidden`}
                    whileHover={shouldUseHeavyEffects() ? { y: -5 } : { y: -2 }}
                    transition={{ duration: shouldUseHeavyEffects() ? 0.3 : 0.15 }}
                >
                    {/* Card Header */}
                    <div className="px-8 pt-8 pb-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-custom to-secondary-custom rounded-xl mb-4">
                            <FaLock className="text-white text-lg" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
                        {subtitle && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{subtitle}</p>
                        )}
                    </div>

                    {/* Card Body */}
                    <div className="px-8 pb-8">
                        {children}
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    className="text-center mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-white/60 text-xs">
                        © 2024 Password Vault. Bảo mật & An toàn.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AuthCard;

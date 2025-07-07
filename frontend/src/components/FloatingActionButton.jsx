import React from 'react';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';

const FloatingActionButton = ({ onClick }) => {
    const buttonVariants = {
        initial: {
            scale: 0,
            rotate: -180,
            opacity: 0
        },
        animate: {
            scale: 1,
            rotate: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.5
            }
        },
        hover: {
            scale: 1.1,
            rotate: 90,
            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
            transition: {
                duration: 0.2
            }
        },
        tap: {
            scale: 0.95,
            rotate: 45
        }
    };

    const iconVariants = {
        hover: {
            rotate: 90,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            onClick={onClick}
            className="fixed bottom-24 right-6 md:hidden w-14 h-14 bg-gradient-to-r from-primary-custom to-secondary-custom text-white rounded-full shadow-lg z-40 flex items-center justify-center"
            aria-label="Thêm mật khẩu mới"
        >
            <motion.div variants={iconVariants}>
                <FaPlus className="text-lg" />
            </motion.div>
        </motion.button>
    );
};

export default FloatingActionButton;

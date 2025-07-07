import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiPlus, FiUser, FiTrash2 } from 'react-icons/fi';

const BottomNavigation = ({ onAddPassword }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        {
            id: 'home',
            icon: FiHome,
            label: 'Trang chủ',
            path: '/',
            isActive: location.pathname === '/'
        },
        {
            id: 'add',
            icon: FiPlus,
            label: 'Thêm mới',
            action: onAddPassword,
            isActive: false
        },
        {
            id: 'profile',
            icon: FiUser,
            label: 'Hồ sơ',
            path: '/profile',
            isActive: location.pathname === '/profile'
        },
        {
            id: 'trash',
            icon: FiTrash2,
            label: 'Thùng rác',
            path: '/trash',
            isActive: location.pathname === '/trash'
        }
    ];

    const handleItemClick = (item) => {
        if (item.action) {
            item.action();
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-border-primary z-50 md:hidden">
            <div className="flex items-center justify-around py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`flex flex-col items-center justify-center p-3 min-w-[60px] min-h-[60px] rounded-lg transition-all duration-200 ${
                                item.isActive
                                    ? 'text-primary-custom bg-primary-custom/10'
                                    : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary'
                            }`}
                            aria-label={item.label}
                        >
                            <Icon className={`text-xl mb-1 ${item.isActive ? 'text-primary-custom' : ''}`} />
                            <span className={`text-xs font-medium ${item.isActive ? 'text-primary-custom' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNavigation;

import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import PasswordCard from '../components/PasswordCard';
import AddPasswordModal from '../components/AddPasswordModal';
import Pagination from '../components/Pagination';
import EditPasswordModal from '../components/EditPasswordModal';
import AuthContext from '../context/AuthContext';
import { FaPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';

import PasswordStatsChart from '../components/PasswordStatsChart';
import BottomNavigation from '../components/BottomNavigation';
import PageTransition from '../components/PageTransition';
import AnimatedCard from '../components/AnimatedCard';
import PullToRefresh from '../components/PullToRefresh';
import { hapticFeedback } from '../utils/haptics';
import LoadingSpinner from '../components/LoadingSpinner';
import FloatingActionButton from '../components/FloatingActionButton';

// const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/passwords` : 'http://localhost:5000/api/passwords'; // Backend API endpoint
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/passwords`
    : 'http://localhost:5000/api/passwords';

const Dashboard = () => {
    const [passwords, setPasswords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPassword, setSelectedPassword] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); // 12 cards per page

    const { logout, token, user } = useContext(AuthContext);

    const totalServices = useMemo(() => {
        if (!passwords || passwords.length === 0) {
            return 0;
        }
        // Use a Set to count unique, case-insensitive service names
        const serviceNames = passwords.map(p => p.serviceName.trim().toLowerCase());
        return new Set(serviceNames).size;
    }, [passwords]);

    const fetchPasswords = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL, {
                headers: { 'x-auth-token': token }
            });
            setPasswords(response.data.data);
            setError(null);
        } catch (err) {
            setError('Không thể tải mật khẩu. Máy chủ backend có đang chạy không?');
            toast.error(err.response?.data?.msg || 'Không thể tải mật khẩu.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPasswords();
    }, [fetchPasswords, token]);

    const handleAddSuccess = (newPassword) => {
        setPasswords([...passwords, newPassword.data]);
    };

    const handleUpdateSuccess = (updatedPassword) => {
        setPasswords(passwords.map(p => p._id === updatedPassword._id ? updatedPassword : p));
    };

    const handleSoftDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { 'x-auth-token': token },
            });
            setPasswords(passwords.filter(p => p._id !== id));
            toast.info('Đã chuyển mật khẩu vào thùng rác.');
        } catch (error) {
            console.error('Lỗi khi chuyển vào thùng rác:', error);
            toast.error('Không thể xóa mật khẩu.');
        }
    };

    // Pull to refresh handler
    const handleRefresh = async () => {
        hapticFeedback.refresh();
        await fetchPasswords();
    };

    const categories = useMemo(() => {
        const allCategories = passwords.map(p => p.category || 'Chưa phân loại');
        return [...new Set(allCategories)];
    }, [passwords]);

    const filteredPasswords = useMemo(() => {
        return passwords
            .filter(pw => {
                if (selectedCategory === 'all') return true;
                return (pw.category || 'Chưa phân loại') === selectedCategory;
            })
            .filter(pw =>
                pw.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pw.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [passwords, searchTerm, selectedCategory]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredPasswords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPasswords = filteredPasswords.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    const renderContent = () => {
        if (loading && passwords.length === 0) { // Show loading only on initial fetch
            return <LoadingSpinner size="lg" text="Đang tải mật khẩu..." />;
        }

        if (error) {
            return <p className="text-center text-red-500">{error}</p>;
        }

        if (passwords.length === 0) {
            return <p className="text-center text-gray-500">Không tìm thấy mật khẩu nào. Hãy thêm mật khẩu đầu tiên của bạn!</p>;
        }

        if (filteredPasswords.length === 0) {
            return <p className="text-center text-gray-500">Không có mật khẩu nào khớp với tìm kiếm hoặc bộ lọc của bạn.</p>;
        }

        return (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {currentPasswords.map((pw, index) => (
                        <AnimatedCard key={pw._id} delay={index * 0.1}>
                            <PasswordCard
                                data={pw}
                                onSoftDelete={handleSoftDelete}
                                onEditClick={(passwordData) => {
                                    setSelectedPassword(passwordData);
                                    setIsEditModalOpen(true);
                                }}
                                token={token}
                                API_URL={API_URL}
                            />
                        </AnimatedCard>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredPasswords.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </>
        );
    };

    return (
        <PageTransition className="bg-bg-secondary min-h-screen transition-colors duration-300 pb-20 md:pb-0">
            <Header
                user={user}
                onLogout={logout}
            />
            <div className="flex flex-col lg:flex-row pt-20">
                {/* Sidebar/Stats Section */}
                <aside className="w-full lg:w-72 lg:flex-shrink-0 p-4 lg:p-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-4 lg:mb-6">Thống kê</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-6">
                        {/* Total Passwords Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-xl shadow-custom text-center lg:text-left border border-border-primary">
                            <h3 className="text-sm font-medium text-text-secondary">Tổng số mật khẩu</h3>
                            <p className="mt-1 text-4xl font-bold text-text-primary">
                                {passwords.length}
                            </p>
                        </div>
                        {/* Total Services Card */}
                        <div className="bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 p-4 rounded-xl shadow-custom text-center lg:text-left border border-border-primary">
                            <h3 className="text-sm font-medium text-text-secondary">Tổng số dịch vụ</h3>
                            <p className="mt-1 text-4xl font-bold text-text-primary">
                                {totalServices}
                            </p>
                        </div>
                        {/* Strength Chart Card */}
                        <div className="bg-card-bg p-4 lg:p-6 rounded-xl shadow-custom col-span-2 lg:col-span-1 border border-border-primary">
                            <h3 className="text-sm lg:text-base font-medium text-text-secondary mb-4 text-center lg:text-left">Phân bố theo dịch vụ</h3>
                            <div className="w-full">
                                <PasswordStatsChart passwords={passwords} />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <PullToRefresh
                        onRefresh={handleRefresh}
                        className="h-full"
                        enabled={!loading}
                    >
                        <div className="p-4 lg:p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Mật khẩu</h1>
                                </div>
                                <button
                                    onClick={() => {
                                        hapticFeedback.buttonPress();
                                        setIsAddModalOpen(true);
                                    }}
                                    className="w-full sm:w-auto bg-gradient-to-r from-primary-custom to-secondary-custom hover:from-primary-hover hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 shadow-custom hover:shadow-custom-lg min-h-[48px] text-lg active:scale-95"
                                    aria-label="Add new password"
                                >
                                    <FaPlus className="mr-2 text-lg transition-transform duration-200 group-hover:rotate-90" />
                                    Thêm Mới
                                </button>
                            </div>

                            {/* Search and Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                {/* Search Bar */}
                                <div className="relative flex-grow">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FiSearch className="h-5 w-5 text-text-tertiary" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo dịch vụ hoặc tên người dùng..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => hapticFeedback.inputFocus()}
                                        className="w-full pl-10 pr-4 py-3 border border-input-border rounded-lg bg-input-bg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-custom shadow-custom transition-colors duration-200"
                                    />
                                </div>

                                {/* Category Filter */}
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            hapticFeedback.buttonPress();
                                            setSelectedCategory(e.target.value);
                                        }}
                                        className="w-full sm:w-48 pl-3 pr-10 py-3 border border-input-border rounded-lg bg-input-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-custom shadow-custom appearance-none transition-colors duration-200"
                                    >
                                        <option value="all">Tất cả danh mục</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>

                            {renderContent()}
                        </div>
                    </PullToRefresh>
                </main>
            </div>

            {/* Modals remain at the end */}
            <AddPasswordModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
                token={token}
                API_URL={API_URL}
            />
            {selectedPassword && (
                <EditPasswordModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedPassword(null);
                    }}
                    onUpdateSuccess={handleUpdateSuccess}
                    passwordData={selectedPassword}
                    token={token}
                    API_URL={API_URL}
                />
            )}

            {/* Floating Action Button for Mobile */}
            <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />

            {/* Bottom Navigation for Mobile */}
            <BottomNavigation onAddPassword={() => setIsAddModalOpen(true)} />
        </PageTransition>
    );
};

export default Dashboard;

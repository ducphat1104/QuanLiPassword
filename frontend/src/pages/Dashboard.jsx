import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import PasswordCard from '../components/PasswordCard';
import AddPasswordModal from '../components/AddPasswordModal';
import EditPasswordModal from '../components/EditPasswordModal';
import AuthContext from '../context/AuthContext';
import { FaPlus } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';

import PasswordStatsChart from '../components/PasswordStatsChart';

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

    const renderContent = () => {
        if (loading && passwords.length === 0) { // Show loading only on initial fetch
            return <p className="text-center text-gray-500">Đang tải mật khẩu...</p>;
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPasswords.map(pw => (
                    <PasswordCard 
                        key={pw._id} 
                        data={pw} 
                        onSoftDelete={handleSoftDelete} 
                        onEditClick={(passwordData) => {
                            setSelectedPassword(passwordData);
                            setIsEditModalOpen(true);
                        }}
                        token={token} 
                        API_URL={API_URL} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header user={user} onLogout={logout} />
            <div className="flex flex-col lg:flex-row">
                {/* Sidebar/Stats Section */}
                <aside className="w-full lg:w-72 lg:flex-shrink-0 p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Thống kê</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                        {/* Total Passwords Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl shadow-md text-center lg:text-left">
                            <h3 className="text-sm font-medium text-gray-600">Tổng số mật khẩu</h3>
                            <p className="mt-1 text-4xl font-bold text-gray-900">
                                {passwords.length}
                            </p>
                        </div>
                        {/* Total Services Card */}
                        <div className="bg-gradient-to-br from-green-50 to-teal-100 p-4 rounded-xl shadow-md text-center lg:text-left">
                            <h3 className="text-sm font-medium text-gray-600">Tổng số dịch vụ</h3>
                            <p className="mt-1 text-4xl font-bold text-gray-900">
                                {totalServices}
                            </p>
                        </div>
                        {/* Strength Chart Card */}
                        <div className="bg-white p-4 rounded-xl shadow-md sm:col-span-2 lg:col-span-1">
                            <h3 className="text-sm font-medium text-gray-600 mb-3 text-center lg:text-left">Tổng quan độ mạnh</h3>
                            <PasswordStatsChart passwords={passwords} />
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Mật khẩu</h1>
                        </div>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
                        >
                            <FaPlus className="mr-2" />
                            Thêm Mới
                        </button>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Search Bar */}
                        <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiSearch className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo dịch vụ hoặc tên người dùng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full sm:w-48 pl-3 pr-10 py-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none bg-white"
                            >
                                <option value="all">Tất cả danh mục</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>
                    
                    {renderContent()}
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
        </div>
    );
};

export default Dashboard;

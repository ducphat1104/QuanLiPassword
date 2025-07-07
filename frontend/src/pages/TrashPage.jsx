import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import toastManager from '../utils/toastManager';
import { FiTrash2, FiRotateCw, FiInfo, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import Header from '../components/Header';
import PageTransition from '../components/PageTransition';

// const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/passwords` : 'http://localhost:5000/api/passwords';
const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/passwords`
    : 'http://localhost:5000/api/passwords';

const TrashPage = () => {
    const { token } = useContext(AuthContext);
    const [deletedPasswords, setDeletedPasswords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDeletedPasswords = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/trash`, {
                headers: { 'x-auth-token': token },
            });
            setDeletedPasswords(response.data.data);
        } catch (error) {
            console.error('Không thể tải thùng rác:', error);
            toast.error('Không thể tải dữ liệu từ thùng rác.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedPasswords();
    }, [token]);

    const handleRestore = async (id) => {
        try {
            // Dismiss any existing confirmation toasts
            toastManager.dismiss(`permanent-delete-${id}`);
            toastManager.dismiss('empty-trash-confirmation');

            await axios.put(`${API_URL}/${id}/restore`, {}, {
                headers: { 'x-auth-token': token },
            });
            toastManager.success('Đã khôi phục mật khẩu thành công!');
            fetchDeletedPasswords(); // Refresh the list
        } catch (error) {
            console.error('Lỗi khi khôi phục:', error);
            toastManager.error('Không thể khôi phục mật khẩu.');
        }
    };

    const handlePermanentDelete = (id) => {
        const deleteToastId = `permanent-delete-${id}`;

        // Dismiss any existing toasts before showing confirmation
        toastManager.dismiss('empty-trash-confirmation');

        toastManager.custom(
            <div>
                <p className="font-semibold mb-2">Xóa vĩnh viễn?</p>
                <p className="text-sm mb-3">Hành động này không thể hoàn tác. Bạn có chắc chắn?</p>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={() => {
                            performPermanentDelete(id);
                            toastManager.dismiss(deleteToastId);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                        Xóa vĩnh viễn
                    </button>
                    <button
                        onClick={() => toastManager.dismiss(deleteToastId)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded text-sm"
                    >
                        Hủy
                    </button>
                </div>
            </div>,
            'warning',
            deleteToastId,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                draggable: false,
            }
        );
    };

    const performPermanentDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}/permanent`, {
                headers: { 'x-auth-token': token },
            });
            toast.success('Đã xóa vĩnh viễn mật khẩu.');
            fetchDeletedPasswords(); // Refresh the list
        } catch (error) {
            console.error('Lỗi khi xóa vĩnh viễn:', error);
            toast.error('Không thể xóa vĩnh viễn mật khẩu.');
        }
    };

    const handleEmptyTrash = () => {
        if (deletedPasswords.length === 0) {
            toast.info('Thùng rác trống!');
            return;
        }
        const emptyTrashToastId = 'empty-trash-confirmation';

        // Dismiss any existing individual delete confirmations
        toastManager.dismissByType('warning');

        toastManager.custom(
            <div>
                <p className="font-semibold mb-2">Dọn sạch thùng rác?</p>
                <p className="text-sm mb-3">Toàn bộ {deletedPasswords.length} mật khẩu sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?</p>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={() => {
                            performEmptyTrash();
                            toastManager.dismiss(emptyTrashToastId);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                        Dọn sạch
                    </button>
                    <button
                        onClick={() => toastManager.dismiss(emptyTrashToastId)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded text-sm"
                    >
                        Hủy
                    </button>
                </div>
            </div>,
            'warning',
            emptyTrashToastId,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                draggable: false,
            }
        );
    }

    const performEmptyTrash = async () => {
        let successCount = 0;
        const totalCount = deletedPasswords.length;
        const toastId = toast.loading(`Đang xóa 0/${totalCount}...`);

        for (const password of deletedPasswords) {
            try {
                await axios.delete(`${API_URL}/${password._id}/permanent`, {
                    headers: { 'x-auth-token': token },
                });
                successCount++;
                toast.update(toastId, { render: `Đang xóa ${successCount}/${totalCount}...` });
            } catch (error) {
                console.error(`Không thể xóa ${password.serviceName}:`, error);
                toast.error(`Lỗi khi xóa mật khẩu cho ${password.serviceName}.`);
            }
        }

        toast.update(toastId, {
            render: `Đã xóa ${successCount}/${totalCount} mật khẩu.`,
            type: successCount === totalCount ? 'success' : 'warning',
            isLoading: false,
            autoClose: 5000,
        });

        fetchDeletedPasswords(); // Refresh the list
    };

    return (
        <PageTransition>
            <div className="bg-bg-secondary min-h-screen transition-colors duration-300">
                {/* Header */}
                <Header
                    title="Thùng rác"
                    showBackButton={true}
                    backTo="/"
                />

                <div className="container mx-auto p-6 pt-24 pb-20 md:pb-6">

                    {loading ? (
                        <p className="text-center py-10 text-text-secondary">Đang tải...</p>
                    ) : deletedPasswords.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-card-bg rounded-lg shadow-custom overflow-hidden border border-border-primary">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-border-primary">
                                        <thead className="bg-bg-tertiary">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Dịch vụ</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tên đăng nhập</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Ngày xóa</th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-card-bg divide-y divide-border-primary">
                                            {deletedPasswords.map(p => (
                                                <tr key={p._id} className="hover:bg-bg-tertiary transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{p.serviceName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-mono">{p.username}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(p.deletedAt).toLocaleDateString('vi-VN')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button
                                                                onClick={() => handleRestore(p._id)}
                                                                className="text-text-tertiary hover:text-success-custom p-2 rounded-full transition-colors bg-bg-tertiary hover:bg-green-100 dark:hover:bg-green-900/20"
                                                                title="Khôi phục"
                                                            >
                                                                <FiRotateCw />
                                                            </button>
                                                            <button
                                                                onClick={() => handlePermanentDelete(p._id)}
                                                                className="text-text-tertiary hover:text-danger-custom p-2 rounded-full transition-colors bg-bg-tertiary hover:bg-red-100 dark:hover:bg-red-900/20"
                                                                title="Xóa vĩnh viễn"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {deletedPasswords.map(p => (
                                    <div key={p._id} className="bg-card-bg rounded-lg shadow-custom border border-border-primary p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-text-primary truncate">{p.serviceName}</h3>
                                                <p className="text-xs text-text-secondary font-mono mt-1 break-all">{p.username}</p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-3">
                                                <button
                                                    onClick={() => handleRestore(p._id)}
                                                    className="text-text-tertiary hover:text-success-custom p-2 rounded-full transition-colors bg-bg-tertiary hover:bg-green-100 dark:hover:bg-green-900/20"
                                                    title="Khôi phục"
                                                >
                                                    <FiRotateCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDelete(p._id)}
                                                    className="text-text-tertiary hover:text-danger-custom p-2 rounded-full transition-colors bg-bg-tertiary hover:bg-red-100 dark:hover:bg-red-900/20"
                                                    title="Xóa vĩnh viễn"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-text-tertiary">
                                            Xóa ngày: {new Date(p.deletedAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleEmptyTrash}
                                    className="flex items-center gap-2 bg-danger-custom text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors shadow-custom"
                                >
                                    <FiTrash2 />
                                    <span>Dọn sạch thùng rác</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10 px-6 bg-card-bg rounded-lg shadow-custom border border-border-primary">
                            <div className="flex justify-center items-center mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                <FiTrash2 className="text-3xl text-success-custom" />
                            </div>
                            <h2 className="text-xl font-semibold text-text-primary">Thùng rác của bạn trống</h2>
                            <p className="text-text-secondary mt-2">Các mật khẩu đã xóa sẽ xuất hiện ở đây trong 30 ngày.</p>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-primary-custom rounded-r-lg">
                        <div className="flex">
                            <div className="py-1">
                                <FiInfo className="text-primary-custom mr-3" size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Các mục trong thùng rác sẽ bị **xóa vĩnh viễn** sau 30 ngày. Hãy khôi phục nếu bạn cần.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Navigation for Mobile */}
                    <BottomNavigation />
                </div>
            </div>
        </PageTransition>
    );
};

export default TrashPage;

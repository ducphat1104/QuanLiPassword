import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiTrash2, FiRotateCw, FiInfo, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

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
            await axios.put(`${API_URL}/${id}/restore`, {}, {
                headers: { 'x-auth-token': token },
            });
            toast.success('Đã khôi phục mật khẩu thành công!');
            fetchDeletedPasswords(); // Refresh the list
        } catch (error) {
            console.error('Lỗi khi khôi phục:', error);
            toast.error('Không thể khôi phục mật khẩu.');
        }
    };

    const handlePermanentDelete = (id) => {
        toast(<div>
            <p className="font-semibold mb-2">Xóa vĩnh viễn?</p>
            <p className="text-sm mb-3">Hành động này không thể hoàn tác. Bạn có chắc chắn?</p>
            <div className="flex justify-end gap-2 mt-4">
                <button 
                    onClick={() => { performPermanentDelete(id); toast.dismiss(); }} 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                    Xóa vĩnh viễn
                </button>
                <button 
                    onClick={() => toast.dismiss()} 
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded text-sm"
                >
                    Hủy
                </button>
            </div>
        </div>, {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            draggable: false,
        });
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
        toast(<div>
            <p className="font-semibold mb-2">Dọn sạch thùng rác?</p>
            <p className="text-sm mb-3">Toàn bộ {deletedPasswords.length} mật khẩu sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?</p>
            <div className="flex justify-end gap-2 mt-4">
                <button 
                    onClick={() => { performEmptyTrash(); toast.dismiss(); }} 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                    Dọn sạch
                </button>
                <button 
                    onClick={() => toast.dismiss()} 
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded text-sm"
                >
                    Hủy
                </button>
            </div>
        </div>, {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            draggable: false,
        });
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
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">

            <div className="flex justify-between items-center mb-6">
                <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold">
                    <FiArrowLeft />
                    <span>Home</span>
                </Link>
                <h1 className="text-2xl font-bold text-gray-700">Thùng rác</h1>
            </div>

            {loading ? (
                <p className="text-center py-10">Đang tải...</p>
            ) : deletedPasswords.length > 0 ? (
                <>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dịch vụ</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày xóa</th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {deletedPasswords.map(p => (
                                        <tr key={p._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.serviceName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{p.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.deletedAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => handleRestore(p._id)}
                                                        className="text-gray-500 hover:text-green-600 p-2 rounded-full transition-colors bg-gray-100 hover:bg-green-100"
                                                        title="Khôi phục"
                                                    >
                                                        <FiRotateCw />
                                                    </button>
                                                    <button 
                                                        onClick={() => handlePermanentDelete(p._id)}
                                                        className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors bg-gray-100 hover:bg-red-100"
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
                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={handleEmptyTrash}
                            className="flex items-center gap-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        >
                            <FiTrash2 />
                            <span>Dọn sạch thùng rác</span>
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm">
                    <div className="flex justify-center items-center mx-auto w-16 h-16 bg-green-100 rounded-full mb-4">
                         <FiTrash2 className="text-3xl text-green-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700">Thùng rác của bạn trống</h2>
                    <p className="text-gray-500 mt-2">Các mật khẩu đã xóa sẽ xuất hiện ở đây trong 30 ngày.</p>
                </div>
            )}

             <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex">
                    <div className="py-1">
                        <FiInfo className="text-blue-500 mr-3" size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-blue-700">
                            Các mục trong thùng rác sẽ bị **xóa vĩnh viễn** sau 30 ngày. Hãy khôi phục nếu bạn cần.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrashPage;

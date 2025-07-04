import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiX } from 'react-icons/fi';
import PasswordGeneratorInput from './PasswordGeneratorInput';

const AddPasswordModal = ({ isOpen, onClose, onSuccess, token, API_URL }) => {
    const [serviceName, setServiceName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!serviceName || !username || !password) {
            toast.error('Vui lòng điền đầy đủ các trường.');
            return;
        }
        setIsSubmitting(true);

        try {
            const res = await axios.post(API_URL, { serviceName, username, password, category }, {
                headers: { 'x-auth-token': token }
            });
            toast.success('Đã thêm mật khẩu thành công!');
            setServiceName('');
            setUsername('');
            setPassword('');
            setCategory('');
            onSuccess(res.data);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Không thể thêm mật khẩu.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Thêm Mật khẩu Mới</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FiX size={28} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label htmlFor="serviceName" className="block text-gray-700 text-sm font-bold mb-2">Tên dịch vụ</label>
                        <input type="text" id="serviceName" value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Ví dụ: Google, Facebook" />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Tên người dùng hoặc Email</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="tendangnhap_cua_ban" />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Danh mục (tùy chọn)</label>
                        <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="Ví dụ: Công việc, Mạng xã hội" />
                    </div>
                    <PasswordGeneratorInput 
                        password={password}
                        onPasswordChange={setPassword}
                    />
                    <div className="flex items-center justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 shadow-lg">
                            {isSubmitting ? 'Đang lưu...' : 'Lưu Mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPasswordModal;

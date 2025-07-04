import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaGoogle, FaFacebook, FaGithub, FaUniversity, FaKey } from 'react-icons/fa';
import { FiCopy, FiEye, FiEyeOff, FiTrash2, FiEdit, FiMoreVertical, FiLoader } from 'react-icons/fi';

// Fallback icon generator with consistent sizing
const getServiceIcon = (serviceName) => {
    const iconProps = "w-8 h-8"; // Consistent size for fallback icons
    const name = serviceName.toLowerCase();
    if (name.includes('google')) return <FaGoogle className={`${iconProps} text-red-500`} />;
    if (name.includes('facebook')) return <FaFacebook className={`${iconProps} text-blue-600`} />;
    if (name.includes('github')) return <FaGithub className={`${iconProps} text-gray-800`} />;
    if (name.includes('bank')) return <FaUniversity className={`${iconProps} text-green-600`} />;
    return <FaKey className={`${iconProps} text-gray-500`} />;
};

// Favicon component using a Logo Map for high accuracy on popular services
const Favicon = ({ serviceName }) => {
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        setUseFallback(false);
    }, [serviceName]);

    // --- Logo Map ---
    // A curated list for high-accuracy logos.
    // Key: A simple, lowercase keyword to look for in the serviceName.
    // Value: The official domain to get the logo from.
    const logoMap = {
        'facebook': 'facebook.com',
        'fb': 'facebook.com',
        'instagram': 'instagram.com',
        'ig': 'instagram.com',
        'zalo': 'zalo.me',
        'telegram': 'telegram.org',
        'google': 'google.com',
        'github': 'github.com',
        'garena': 'garena.vn',
        'shopee': 'shopee.vn',
        'tiktok': 'tiktok.com',
        // Banks & Payments
        'vnpay': 'vnpay.vn',
        'vietcombank': 'vietcombank.com.vn',
        'techcombank': 'techcombank.com.vn',
        'acb': 'acb.com.vn',
        'bidv': 'bidv.com.vn',
        'vietinbank': 'vietinbank.vn',
        'mbbank': 'mbbank.com.vn',
        'vpbank': 'vpbank.com.vn',
    };

    const getDomainFromMap = (name) => {
        if (!name) return null;
        const lowerCaseName = name.toLowerCase();
        for (const key in logoMap) {
            if (lowerCaseName.includes(key)) {
                return logoMap[key];
            }
        }
        return null; // Return null if no match is found
    };

    const domain = getDomainFromMap(serviceName);

    // If a domain was found in our map, try to fetch the logo
    if (domain && !useFallback) {
        const logoUrl = `https://logo.clearbit.com/${domain}`;
        return (
            <img
                src={logoUrl}
                alt={`${serviceName} logo`}
                className="w-8 h-8 rounded-md object-contain bg-white"
                // If Clearbit fails for our curated domain, use the default icon.
                onError={() => setUseFallback(true)}
            />
        );
    }

    // If no domain was found in the map, or if the fetch failed, show the default icon.
    return getServiceIcon(serviceName);
};

const PasswordCard = ({ data, onSoftDelete, onEditClick, token, API_URL }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [decryptedPassword, setDecryptedPassword] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleCopy = (text, type) => {
        if (!text) {
            toast.warn('Không có gì để sao chép!');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${type} đã được sao chép vào clipboard!`);
        });
    };

    const togglePasswordVisibility = async () => {
        if (passwordVisible) {
            setPasswordVisible(false);
            return;
        }

        if (decryptedPassword) {
            setPasswordVisible(true);
            return;
        }

        setIsDecrypting(true);
        try {
            const response = await axios.get(`${API_URL}/${data._id}/decrypt`, {
                headers: { 'x-auth-token': token }
            });
            setDecryptedPassword(response.data.decryptedPassword);
            setPasswordVisible(true);
        } catch (error) {
            console.error('Không thể giải mã mật khẩu', error);
            toast.error('Không thể giải mã mật khẩu.');
        } finally {
            setIsDecrypting(false);
        }
    };

    const handleDelete = () => {
        toast(<div>
            <p className="font-semibold mb-2">Chuyển vào thùng rác?</p>
            <p className="text-sm mb-3">Mật khẩu này sẽ được chuyển vào thùng rác và có thể khôi phục trong 30 ngày.</p>
            <div className="flex justify-end gap-2 mt-4">
                <button 
                    onClick={() => { 
                        onSoftDelete(data._id); 
                        toast.dismiss(); 
                    }} 
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                    Đồng ý
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

            return (
        <div className="bg-white rounded-lg shadow-lg p-5 flex flex-col justify-between transition-transform transform hover:-translate-y-1 relative" onMouseLeave={() => setShowMenu(false)}>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center min-w-0">
                    <Favicon serviceName={data.serviceName} />
                    <div className="ml-4 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 truncate">{data.serviceName}</h3>
                        {data.category && data.category !== 'Chưa phân loại' && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full mt-1 inline-block">
                                {data.category}
                            </span>
                        )}
                    </div>
                </div>
                <div className="relative">
                                          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 hover:text-gray-600 pl-2">
                        <FiMoreVertical />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-10 py-1">
                            <button onClick={() => { onEditClick(data); setShowMenu(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <FiEdit className="mr-2" /> Sửa
                            </button>
                            <button onClick={() => { handleDelete(); setShowMenu(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <FiTrash2 className="mr-2" /> Chuyển vào thùng rác
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div>
                <div className="mb-3">
                    <p className="text-sm text-gray-500">Tên người dùng</p>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-700 font-mono truncate pr-2">{data.username}</p>
                        <button onClick={() => handleCopy(data.username, 'Tên người dùng')} className="text-gray-400 hover:text-blue-500 flex-shrink-0">
                            <FiCopy />
                        </button>
                    </div>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Mật khẩu</p>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-700 font-mono tracking-wider">
                            {isDecrypting ? 'Đang giải mã...' : (passwordVisible ? decryptedPassword : '••••••••')}
                        </p>
                        <div className="flex items-center">
                             {isDecrypting ? (
                                <FiLoader className="text-gray-400 animate-spin" />
                            ) : (
                                <>
                                    {passwordVisible && (
                                        <button onClick={() => handleCopy(decryptedPassword, 'Mật khẩu')} className="text-gray-400 hover:text-blue-500 mr-3">
                                            <FiCopy />
                                        </button>
                                    )}
                                    <button onClick={togglePasswordVisibility} className="text-gray-400 hover:text-blue-500">
                                        {passwordVisible ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordCard;

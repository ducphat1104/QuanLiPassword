import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiUserPlus } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import AuthBackground from '../components/AuthBackground';
import AuthCard from '../components/AuthCard';
import AnimatedInput from '../components/AnimatedInput';
import AnimatedButton from '../components/AnimatedButton';
import ThemeToggle from '../components/ThemeToggle';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        password2: '', // For password confirmation
    });
    const [loading, setLoading] = useState(false);

    const { username, password, password2 } = formData;
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Hàm kiểm tra mật khẩu mạnh
    const validatePassword = (password) => {
        const minLength = password.length >= 6;
        const hasLowerCase = /[a-z]/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);

        return {
            isValid: minLength && hasLowerCase && hasUpperCase && hasNumbers,
            errors: [
                !minLength && 'Mật khẩu phải có ít nhất 6 ký tự',
                !hasLowerCase && 'Mật khẩu phải có ít nhất 1 chữ thường (a-z)',
                !hasUpperCase && 'Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)',
                !hasNumbers && 'Mật khẩu phải có ít nhất 1 số (0-9)'
            ].filter(Boolean)
        };
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        console.log('📝 RegisterPage - Form submit:', { username, passwordLength: password?.length, password2Length: password2?.length });

        // Kiểm tra mật khẩu khớp
        if (password !== password2) {
            console.log('❌ RegisterPage - Mật khẩu không khớp');
            toast.error('Mật khẩu không khớp');
            return;
        }

        // Kiểm tra độ mạnh mật khẩu
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            console.log('❌ RegisterPage - Mật khẩu không đủ mạnh:', passwordValidation.errors);
            // Hiển thị lỗi tổng hợp trong 1 toast
            const errorMessage = `Mật khẩu chưa đủ mạnh:\n${passwordValidation.errors.join('\n')}`;
            toast.error(errorMessage, {
                style: {
                    whiteSpace: 'pre-line' // Cho phép xuống dòng
                }
            });
            return;
        }

        console.log('🚀 RegisterPage - Đang gọi register function...');
        setLoading(true);
        await register(username, password);
        // AuthContext handles navigation and notifications.
        setLoading(false);
        console.log('✅ RegisterPage - Hoàn thành register process');
    };

    return (
        <AuthBackground>
            {/* Theme Toggle - Fixed Position */}
            <div className="fixed top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            <AuthCard
                title="Đăng ký"
                subtitle="Tạo tài khoản mới để bắt đầu quản lý mật khẩu của bạn một cách an toàn."
            >
                <form onSubmit={onSubmit} className="space-y-6">
                    <AnimatedInput
                        label="Tên đăng nhập"
                        type="text"
                        name="username"
                        value={username}
                        onChange={onChange}
                        icon={FiUser}
                        required
                    />

                    <AnimatedInput
                        label="Mật khẩu"
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        icon={FiLock}
                        minLength="6"
                        required
                    />

                    <AnimatedInput
                        label="Xác nhận mật khẩu"
                        type="password"
                        name="password2"
                        value={password2}
                        onChange={onChange}
                        icon={FiLock}
                        minLength="6"
                        required
                    />

                    <AnimatedButton
                        type="submit"
                        loading={loading}
                        icon={FiUserPlus}
                        disabled={loading}
                    >
                        Đăng ký
                    </AnimatedButton>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Đã có tài khoản?{' '}
                        <Link
                            to="/login"
                            className="font-semibold text-primary-custom hover:text-primary-hover transition-colors duration-200 hover:underline"
                        >
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </AuthCard>
        </AuthBackground>
    );
};

export default RegisterPage;

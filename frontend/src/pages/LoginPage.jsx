import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import AuthBackground from '../components/AuthBackground';
import AuthCard from '../components/AuthCard';
import AnimatedInput from '../components/AnimatedInput';
import AnimatedButton from '../components/AnimatedButton';
import ThemeToggle from '../components/ThemeToggle';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const { username, password } = formData;
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await login(username, password);
        // AuthContext handles navigation and notifications.
        setLoading(false);
    };

    return (
        <AuthBackground>
            {/* Theme Toggle - Fixed Position */}
            <div className="fixed top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            <AuthCard
                title="Đăng nhập"
                subtitle="Chào mừng bạn trở lại! Vui lòng đăng nhập vào tài khoản của bạn."
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
                        required
                    />

                    <AnimatedButton
                        type="submit"
                        loading={loading}
                        icon={FiLogIn}
                        disabled={loading}
                    >
                        Đăng nhập
                    </AnimatedButton>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-primary-custom hover:text-primary-hover transition-colors duration-200 hover:underline"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </AuthCard>
        </AuthBackground>
    );
};

export default LoginPage;

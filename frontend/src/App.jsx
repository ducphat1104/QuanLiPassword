import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SecondaryPasswordProvider } from './context/SecondaryPasswordContext';
import { ResponsiveToastContainer } from './components/CustomToast';
import useRouteChange from './hooks/useRouteChange';
import LoadingSpinner from './components/LoadingSpinner';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TrashPage = lazy(() => import('./pages/TrashPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// A wrapper to protect routes that require authentication
const PrivateRoute = ({ children }) => {
    const { token, loading } = useContext(AuthContext);
    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }
    return token ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
    const { token } = useContext(AuthContext);

    // Hook để dismiss toasts khi chuyển trang
    useRouteChange();

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <LoadingSpinner />
            </div>
        }>
            <Routes>
                <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
                <Route path="/register" element={token ? <Navigate to="/" /> : <RegisterPage />} />
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/trash"
                    element={
                        <PrivateRoute>
                            <TrashPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <ProfilePage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Suspense>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <SecondaryPasswordProvider>
                    <Router>
                        <div className="App">
                            <ResponsiveToastContainer />
                            <AppRoutes />
                        </div>
                    </Router>
                </SecondaryPasswordProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

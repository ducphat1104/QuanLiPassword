import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TrashPage from './pages/TrashPage';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    return (
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
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <ToastContainer 
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                    <AppRoutes />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

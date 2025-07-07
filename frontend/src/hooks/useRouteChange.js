import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toastManager from '../utils/toastManager';

/**
 * Hook để xử lý khi route thay đổi
 * Tự động dismiss tất cả toasts khi chuyển trang
 */
const useRouteChange = () => {
    const location = useLocation();

    useEffect(() => {
        // Dismiss tất cả toasts khi route thay đổi
        toastManager.dismiss();
    }, [location.pathname]);
};

export default useRouteChange;

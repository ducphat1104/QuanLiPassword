import { toast } from 'react-toastify';

// Object để track các toast đang active
const activeToasts = new Set();

// Hàm helper để tạo unique ID cho toast
const generateToastId = (type, message) => {
    return `${type}-${message.slice(0, 20).replace(/\s+/g, '-')}`;
};

// Toast manager với spam protection
export const toastManager = {
    // Success toast với spam protection
    success: (message, options = {}) => {
        const id = generateToastId('success', message);

        if (activeToasts.has(id)) {
            return; // Đã có toast này rồi, không tạo thêm
        }

        activeToasts.add(id);

        return toast.success(message, {
            toastId: id,
            onClose: () => activeToasts.delete(id),
            ...options
        });
    },

    // Error toast với spam protection
    error: (message, options = {}) => {
        const id = generateToastId('error', message);

        if (activeToasts.has(id)) {
            return;
        }

        activeToasts.add(id);

        return toast.error(message, {
            toastId: id,
            onClose: () => activeToasts.delete(id),
            ...options
        });
    },

    // Warning toast với spam protection
    warning: (message, options = {}) => {
        const id = generateToastId('warning', message);

        if (activeToasts.has(id)) {
            return;
        }

        activeToasts.add(id);

        return toast.warning(message, {
            toastId: id,
            onClose: () => activeToasts.delete(id),
            ...options
        });
    },

    // Info toast với spam protection
    info: (message, options = {}) => {
        const id = generateToastId('info', message);

        if (activeToasts.has(id)) {
            return;
        }

        activeToasts.add(id);

        return toast.info(message, {
            toastId: id,
            onClose: () => activeToasts.delete(id),
            ...options
        });
    },

    // Custom toast với spam protection
    custom: (content, type = 'info', customId = null, options = {}) => {
        const id = customId || generateToastId(type, 'custom');

        if (activeToasts.has(id)) {
            return;
        }

        activeToasts.add(id);

        return toast[type](content, {
            toastId: id,
            onClose: () => activeToasts.delete(id),
            ...options
        });
    },

    // Dismiss specific toast
    dismiss: (id) => {
        if (id) {
            activeToasts.delete(id);
            toast.dismiss(id);
        } else {
            // Dismiss all toasts
            activeToasts.clear();
            toast.dismiss();
        }
    },

    // Dismiss all toasts (alias for better readability)
    dismissAll: () => {
        activeToasts.clear();
        toast.dismiss();
    },

    // Dismiss toasts by type
    dismissByType: (type) => {
        const toastsToRemove = [];
        activeToasts.forEach(id => {
            if (id.startsWith(type + '-')) {
                toastsToRemove.push(id);
            }
        });

        toastsToRemove.forEach(id => {
            activeToasts.delete(id);
            toast.dismiss(id);
        });
    },

    // Check if toast is active
    isActive: (id) => {
        return activeToasts.has(id);
    },

    // Get all active toast IDs
    getActiveToasts: () => {
        return Array.from(activeToasts);
    }
};

export default toastManager;

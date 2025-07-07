/**
 * Haptic Feedback Utilities
 * Provides tactile feedback for better user experience on mobile devices
 */

// Haptic feedback types
export const HapticType = {
    LIGHT: 'light',
    MEDIUM: 'medium',
    HEAVY: 'heavy',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    SELECTION: 'selection'
};

/**
 * Trigger haptic feedback if supported by device
 * @param {string} type - Type of haptic feedback
 */
export const triggerHaptic = (type = HapticType.LIGHT) => {
    // Check if device supports haptic feedback
    if (!navigator.vibrate && !window.navigator.vibrate) {
        return;
    }

    // Check if running on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
        return;
    }

    // Vibration patterns for different feedback types
    const patterns = {
        [HapticType.LIGHT]: [10],
        [HapticType.MEDIUM]: [20],
        [HapticType.HEAVY]: [30],
        [HapticType.SUCCESS]: [10, 50, 10],
        [HapticType.WARNING]: [20, 100, 20],
        [HapticType.ERROR]: [50, 100, 50, 100, 50],
        [HapticType.SELECTION]: [5]
    };

    const pattern = patterns[type] || patterns[HapticType.LIGHT];

    try {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        } else if (window.navigator.vibrate) {
            window.navigator.vibrate(pattern);
        }
    } catch (error) {
        console.warn('Haptic feedback not supported:', error);
    }
};

/**
 * Haptic feedback for common UI interactions
 */
export const hapticFeedback = {
    // Button interactions
    buttonPress: () => triggerHaptic(HapticType.LIGHT),
    buttonSuccess: () => triggerHaptic(HapticType.SUCCESS),
    buttonError: () => triggerHaptic(HapticType.ERROR),

    // Form interactions
    inputFocus: () => triggerHaptic(HapticType.SELECTION),
    inputError: () => triggerHaptic(HapticType.WARNING),
    formSubmit: () => triggerHaptic(HapticType.MEDIUM),

    // Navigation
    tabSwitch: () => triggerHaptic(HapticType.LIGHT),
    pageTransition: () => triggerHaptic(HapticType.MEDIUM),

    // Actions
    copy: () => triggerHaptic(HapticType.SUCCESS),
    delete: () => triggerHaptic(HapticType.ERROR),
    edit: () => triggerHaptic(HapticType.MEDIUM),
    refresh: () => triggerHaptic(HapticType.LIGHT),

    // Gestures
    swipeAction: () => triggerHaptic(HapticType.MEDIUM),
    longPress: () => triggerHaptic(HapticType.HEAVY),

    // General feedback
    light: () => triggerHaptic(HapticType.LIGHT),
    medium: () => triggerHaptic(HapticType.MEDIUM),
    heavy: () => triggerHaptic(HapticType.HEAVY)
};

export default hapticFeedback;

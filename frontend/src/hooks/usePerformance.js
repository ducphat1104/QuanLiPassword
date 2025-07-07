import { useState, useEffect } from 'react';

/**
 * Hook để detect device performance và apply effects phù hợp
 * PC: Full effects, Tablet: Medium effects, Mobile: Minimal effects
 */
export const usePerformance = () => {
    const [deviceType, setDeviceType] = useState('desktop');
    const [performanceLevel, setPerformanceLevel] = useState('high');

    useEffect(() => {
        const detectDevice = () => {
            const width = window.innerWidth;
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Device type detection
            if (width <= 768 || isMobileDevice) {
                setDeviceType('mobile');
                setPerformanceLevel('low');
            } else if (width <= 1024) {
                setDeviceType('tablet');
                setPerformanceLevel('medium');
            } else {
                setDeviceType('desktop');
                setPerformanceLevel('high');
            }

            console.log(`🎯 Device detected: ${width}px - Type: ${deviceType} - Performance: ${performanceLevel}`);
        };

        detectDevice();
        window.addEventListener('resize', detectDevice);
        return () => window.removeEventListener('resize', detectDevice);
    }, []);

    // Performance-based CSS classes
    const getPerformanceClasses = (baseClasses = '') => {
        const performanceClasses = {
            high: {
                // PC - Full effects
                card: 'transform hover:-translate-y-3 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl',
                blur: 'backdrop-blur-sm',
                gradient: 'bg-gradient-to-br from-card-bg via-card-bg/98 to-card-bg/95',
                shadow: 'shadow-lg hover:shadow-2xl',
                animation: 'transition-all duration-300 ease-out'
            },
            medium: {
                // Tablet - Medium effects
                card: 'transform hover:-translate-y-1 hover:scale-[1.01] transition-all duration-200 hover:shadow-lg',
                blur: '', // No blur
                gradient: 'bg-gradient-to-br from-card-bg to-card-bg/95',
                shadow: 'shadow-md hover:shadow-lg',
                animation: 'transition-all duration-200 ease-out'
            },
            low: {
                // Mobile - Minimal effects
                card: 'transform hover:scale-[1.005] transition-transform duration-150 hover:shadow-md',
                blur: '', // No blur
                gradient: 'bg-card-bg',
                shadow: 'shadow-sm hover:shadow-md',
                animation: 'transition-transform duration-150 ease-out'
            }
        };

        return `${baseClasses} ${performanceClasses[performanceLevel].card}`;
    };

    // Get specific performance styles
    const getPerformanceStyle = (type) => {
        const styles = {
            high: {
                blur: 'backdrop-blur-sm',
                gradient: 'bg-gradient-to-br from-card-bg via-card-bg/98 to-card-bg/95',
                shadow: 'shadow-lg hover:shadow-2xl',
                transform: 'transform hover:-translate-y-3 hover:scale-[1.02]',
                animation: 'transition-all duration-300 ease-out',
                borderRadius: 'rounded-2xl',
                border: 'border-2 border-border-primary/50 hover:border-primary-custom/40'
            },
            medium: {
                blur: '',
                gradient: 'bg-gradient-to-br from-card-bg to-card-bg/95',
                shadow: 'shadow-md hover:shadow-lg',
                transform: 'transform hover:-translate-y-1 hover:scale-[1.01]',
                animation: 'transition-all duration-200 ease-out',
                borderRadius: 'rounded-xl',
                border: 'border border-border-primary hover:border-primary-custom/30'
            },
            low: {
                blur: '',
                gradient: 'bg-card-bg',
                shadow: 'shadow-sm hover:shadow-md',
                transform: 'transform hover:scale-[1.005]',
                animation: 'transition-transform duration-150 ease-out',
                borderRadius: 'rounded-lg',
                border: 'border border-border-primary'
            }
        };

        return styles[performanceLevel][type] || '';
    };

    // Check if should use heavy effects
    const shouldUseHeavyEffects = () => performanceLevel === 'high';
    const shouldUseMediumEffects = () => performanceLevel === 'medium';
    const shouldUseMinimalEffects = () => performanceLevel === 'low';

    return {
        deviceType,
        performanceLevel,
        getPerformanceClasses,
        getPerformanceStyle,
        shouldUseHeavyEffects,
        shouldUseMediumEffects,
        shouldUseMinimalEffects,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop'
    };
};

export default usePerformance;

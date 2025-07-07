import { useState, useEffect, useRef, useCallback } from 'react';
import { hapticFeedback } from '../utils/haptics';

/**
 * Custom hook for pull-to-refresh functionality
 * @param {Function} onRefresh - Function to call when refresh is triggered
 * @param {Object} options - Configuration options
 */
export const usePullToRefresh = (onRefresh, options = {}) => {
    const {
        threshold = 80, // Distance to pull before triggering refresh
        resistance = 2.5, // Resistance factor for pull distance
        snapBackDuration = 300, // Animation duration for snap back
        enabled = true // Enable/disable pull to refresh
    } = options;

    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [canPull, setCanPull] = useState(false);

    const startY = useRef(0);
    const currentY = useRef(0);
    const containerRef = useRef(null);
    const hapticTriggered = useRef(false);

    // Check if container is at top and can be pulled
    const checkCanPull = useCallback(() => {
        if (!containerRef.current || !enabled) return false;
        
        const scrollTop = containerRef.current.scrollTop;
        return scrollTop <= 0;
    }, [enabled]);

    // Handle touch start
    const handleTouchStart = useCallback((e) => {
        if (!enabled || isRefreshing) return;
        
        const touch = e.touches[0];
        startY.current = touch.clientY;
        currentY.current = touch.clientY;
        
        setCanPull(checkCanPull());
        hapticTriggered.current = false;
    }, [enabled, isRefreshing, checkCanPull]);

    // Handle touch move
    const handleTouchMove = useCallback((e) => {
        if (!enabled || isRefreshing || !canPull) return;

        const touch = e.touches[0];
        currentY.current = touch.clientY;
        
        const deltaY = currentY.current - startY.current;
        
        if (deltaY > 0) {
            // Prevent default scroll behavior when pulling down
            e.preventDefault();
            
            // Calculate pull distance with resistance
            const distance = Math.min(deltaY / resistance, threshold * 1.5);
            setPullDistance(distance);
            setIsPulling(distance > 10);
            
            // Trigger haptic feedback when reaching threshold
            if (distance >= threshold && !hapticTriggered.current) {
                hapticFeedback.pullRefresh();
                hapticTriggered.current = true;
            }
        }
    }, [enabled, isRefreshing, canPull, threshold, resistance]);

    // Handle touch end
    const handleTouchEnd = useCallback(async () => {
        if (!enabled || isRefreshing || !isPulling) {
            setIsPulling(false);
            setPullDistance(0);
            return;
        }

        if (pullDistance >= threshold) {
            // Trigger refresh
            setIsRefreshing(true);
            hapticFeedback.formSubmit();
            
            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
                hapticFeedback.buttonError();
            } finally {
                setIsRefreshing(false);
            }
        }

        // Animate back to original position
        setIsPulling(false);
        setPullDistance(0);
    }, [enabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh]);

    // Attach event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !enabled) return;

        const options = { passive: false };
        
        container.addEventListener('touchstart', handleTouchStart, options);
        container.addEventListener('touchmove', handleTouchMove, options);
        container.addEventListener('touchend', handleTouchEnd, options);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart, options);
            container.removeEventListener('touchmove', handleTouchMove, options);
            container.removeEventListener('touchend', handleTouchEnd, options);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

    // Calculate pull indicator styles
    const pullIndicatorStyle = {
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : `transform ${snapBackDuration}ms ease-out`,
        opacity: Math.min(pullDistance / threshold, 1)
    };

    const containerStyle = {
        transform: `translateY(${Math.min(pullDistance * 0.5, threshold * 0.5)}px)`,
        transition: isPulling ? 'none' : `transform ${snapBackDuration}ms ease-out`
    };

    return {
        containerRef,
        isPulling,
        isRefreshing,
        pullDistance,
        pullIndicatorStyle,
        containerStyle,
        isAtThreshold: pullDistance >= threshold
    };
};

export default usePullToRefresh;

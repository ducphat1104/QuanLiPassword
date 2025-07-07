import React from 'react';
import { FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import usePullToRefresh from '../hooks/usePullToRefresh';

/**
 * Pull-to-Refresh Component
 * Wraps content with pull-to-refresh functionality
 */
const PullToRefresh = ({ 
    children, 
    onRefresh, 
    enabled = true,
    threshold = 80,
    className = "",
    indicatorClassName = ""
}) => {
    const {
        containerRef,
        isPulling,
        isRefreshing,
        pullDistance,
        pullIndicatorStyle,
        containerStyle,
        isAtThreshold
    } = usePullToRefresh(onRefresh, { 
        threshold, 
        enabled,
        resistance: 2.5,
        snapBackDuration: 300
    });

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Pull Indicator */}
            <div 
                className={`absolute top-0 left-0 right-0 flex items-center justify-center z-10 ${indicatorClassName}`}
                style={{
                    ...pullIndicatorStyle,
                    height: `${Math.max(pullDistance, 0)}px`,
                    marginTop: `-${threshold}px`
                }}
            >
                <div className={`flex flex-col items-center justify-center transition-all duration-200 ${
                    pullDistance > 10 ? 'opacity-100' : 'opacity-0'
                }`}>
                    {/* Icon */}
                    <div className={`relative transition-all duration-300 ${
                        isRefreshing ? 'animate-spin' : isAtThreshold ? 'rotate-180' : 'rotate-0'
                    }`}>
                        {isRefreshing ? (
                            <FiRefreshCw className="w-6 h-6 text-primary-custom" />
                        ) : (
                            <FiChevronDown className={`w-6 h-6 transition-colors duration-200 ${
                                isAtThreshold ? 'text-primary-custom' : 'text-text-tertiary'
                            }`} />
                        )}
                    </div>
                    
                    {/* Text */}
                    <div className="mt-2 text-center">
                        <p className={`text-xs font-medium transition-colors duration-200 ${
                            isAtThreshold ? 'text-primary-custom' : 'text-text-tertiary'
                        }`}>
                            {isRefreshing 
                                ? 'Đang làm mới...' 
                                : isAtThreshold 
                                    ? 'Thả để làm mới' 
                                    : 'Kéo để làm mới'
                            }
                        </p>
                        
                        {/* Progress indicator */}
                        <div className="mt-1 w-12 h-1 bg-bg-tertiary rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-200 rounded-full ${
                                    isAtThreshold ? 'bg-primary-custom' : 'bg-text-tertiary'
                                }`}
                                style={{
                                    width: `${Math.min((pullDistance / threshold) * 100, 100)}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div 
                ref={containerRef}
                className="h-full overflow-y-auto"
                style={containerStyle}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;

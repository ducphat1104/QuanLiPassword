import React from 'react';
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    totalItems, 
    itemsPerPage, 
    onPageChange,
    className = ""
}) => {
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); 
             i <= Math.min(totalPages - 1, currentPage + delta); 
             i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const visiblePages = totalPages > 1 ? getVisiblePages() : [];
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
            {/* Items Info */}
            <div className="text-sm text-text-secondary">
                Hiển thị <span className="font-medium text-text-primary">{startItem}</span> đến{' '}
                <span className="font-medium text-text-primary">{endItem}</span> trong tổng số{' '}
                <span className="font-medium text-text-primary">{totalItems}</span> mật khẩu
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-border-primary bg-card-bg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card-bg disabled:hover:text-text-secondary"
                    aria-label="Trang trước"
                >
                    <FiChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {visiblePages.map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <div className="flex items-center justify-center w-10 h-10 text-text-tertiary">
                                <FiMoreHorizontal className="w-4 h-4" />
                            </div>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200 font-medium text-sm ${
                                    currentPage === page
                                        ? 'border-primary-custom bg-primary-custom text-white shadow-lg'
                                        : 'border-border-primary bg-card-bg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                                }`}
                                aria-label={`Trang ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-border-primary bg-card-bg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card-bg disabled:hover:text-text-secondary"
                    aria-label="Trang sau"
                >
                    <FiChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;

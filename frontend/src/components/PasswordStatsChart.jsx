import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PasswordStatsChart = ({ passwords }) => {
    const { isDark } = useTheme();
    // Process data to count passwords per service
    const getChartData = () => {
        if (!passwords || passwords.length === 0) {
            return { labels: [], datasets: [] };
        }

        const serviceCounts = passwords.reduce((acc, password) => {
            const service = password.serviceName.trim() || 'Uncategorized';
            acc[service] = (acc[service] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(serviceCounts);
        const data = Object.values(serviceCounts);

        return {
            labels,
            datasets: [
                {
                    label: 'Passwords',
                    data,
                    backgroundColor: isDark ? [
                        '#EF4444',  // Red - more balanced
                        '#3B82F6',  // Blue - consistent with theme
                        '#F59E0B',  // Amber - warmer yellow
                        '#10B981',  // Emerald - better green
                        '#8B5CF6',  // Violet - consistent purple
                        '#F97316',  // Orange - vibrant but not harsh
                        '#EC4899',  // Pink - balanced
                        '#6366F1',  // Indigo - deep blue
                        '#84CC16',  // Lime - fresh green
                        '#06B6D4'   // Cyan - modern blue
                    ] : [
                        '#DC2626',  // Darker red for light mode
                        '#2563EB',  // Darker blue
                        '#D97706',  // Darker amber
                        '#059669',  // Darker emerald
                        '#7C3AED',  // Darker violet
                        '#EA580C',  // Darker orange
                        '#DB2777',  // Darker pink
                        '#4F46E5',  // Darker indigo
                        '#65A30D',  // Darker lime
                        '#0891B2'   // Darker cyan
                    ],
                    hoverBackgroundColor: isDark ? [
                        '#F87171',  // Lighter on hover for dark mode
                        '#60A5FA',
                        '#FBBF24',
                        '#34D399',
                        '#A78BFA',
                        '#FB923C',
                        '#F472B6',
                        '#818CF8',
                        '#A3E635',
                        '#22D3EE'
                    ] : [
                        '#B91C1C',  // Darker on hover for light mode
                        '#1D4ED8',
                        '#B45309',
                        '#047857',
                        '#6D28D9',
                        '#C2410C',
                        '#BE185D',
                        '#3730A3',
                        '#4D7C0F',
                        '#0E7490'
                    ],
                    borderColor: isDark ? '#374151' : '#ffffff',
                    borderWidth: 2
                },
            ],
        };
    };

    const chartData = getChartData();

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: window.innerWidth < 768 ? 'bottom' : 'right', // Bottom on mobile, right on desktop
                labels: {
                    color: isDark ? '#d1d5db' : '#374151',
                    font: {
                        size: window.innerWidth < 768 ? 11 : 12
                    },
                    padding: window.innerWidth < 768 ? 15 : 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: true,
                text: 'Phân bố mật khẩu theo dịch vụ',
                color: isDark ? '#f9fafb' : '#111827',
                font: {
                    size: window.innerWidth < 768 ? 14 : 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                titleColor: isDark ? '#f9fafb' : '#111827',
                bodyColor: isDark ? '#d1d5db' : '#374151',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }
        }
    };

    // Don't render the chart if there's no data to display
    if (!chartData.labels || chartData.labels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-text-secondary text-sm">Chưa có dữ liệu để hiển thị</p>
                <p className="text-text-tertiary text-xs mt-1">Thêm mật khẩu để xem thống kê</p>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            <div className="h-48 sm:h-56 lg:h-64 w-full">
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
};

export default PasswordStatsChart;

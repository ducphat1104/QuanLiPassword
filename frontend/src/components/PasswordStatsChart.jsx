import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PasswordStatsChart = ({ passwords }) => {
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
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ],
                    hoverBackgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ]
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
                position: 'top',
            },
            title: {
                display: true,
                text: 'Passwords by Service',
                font: {
                    size: 18
                }
            },
        },
    };

    // Don't render the chart if there's no data to display
    if (!chartData.labels || chartData.labels.length === 0) {
        return <p className="text-center text-gray-500 py-4">Không có dữ liệu</p>;
    }

    return (
        <div className="relative h-56 w-full overflow-hidden">
            <Pie data={chartData} options={options} />
        </div>
    );
};

export default PasswordStatsChart;

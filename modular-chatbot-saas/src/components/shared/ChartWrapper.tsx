import React, { ReactNode } from 'react';

interface ChartWrapperProps {
    title: string;
    children: ReactNode;
    loading?: boolean;
    isEmpty?: boolean;
}

export function ChartWrapper({ title, children, loading, isEmpty }: ChartWrapperProps) {
    return (
        <div className="chart-wrapper bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            {loading ? (
                <div data-testid="chart-loading" className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : isEmpty ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>No data available</p>
                </div>
            ) : (
                <div className="responsive-container">
                    {children}
                </div>
            )}
        </div>
    );
}

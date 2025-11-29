import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullPage?: boolean;
}

export function LoadingSpinner({ size = 'md', fullPage = false }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    const spinner = (
        <div
            data-testid="loading-spinner"
            className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}
        ></div>
    );

    if (fullPage) {
        return (
            <div
                data-testid="loading-overlay"
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
                {spinner}
            </div>
        );
    }

    return spinner;
}

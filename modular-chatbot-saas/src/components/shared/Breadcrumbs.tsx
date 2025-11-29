import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
    name: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav data-testid="breadcrumbs" className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <span>/</span>}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-primary-600">
                            {item.name}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium">{item.name}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

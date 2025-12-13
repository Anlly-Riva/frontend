import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Card = ({ className, children }) => (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100", className)}>
        {children}
    </div>
);

export const StatCard = ({ title, value, trend, trendLabel, icon: Icon, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <Card className="p-6 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
                    {(trend || trendLabel) && (
                        <div className="flex items-center text-xs">
                            {trend && (
                                <span className={cn(
                                    "font-medium px-1.5 py-0.5 rounded mr-2",
                                    trend.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {trend}
                                </span>
                            )}
                            <span className="text-gray-400">{trendLabel}</span>
                        </div>
                    )}
                </div>
                <div className={cn("p-3 rounded-lg", colorClasses[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </Card>
    );
};

export const ChartContainer = ({ title, subtitle, children, action }) => (
    <Card className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            {action}
        </div>
        <div className="w-full flex-1 min-h-[300px]">
            {children}
        </div>
    </Card>
);

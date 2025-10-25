import type { MetricsData } from "@/types";

interface StatsBarProps {
        metrics: MetricsData | null;
        loading?: boolean;
}

export default function StatsBar({ metrics, loading }: StatsBarProps) {
        if (loading || !metrics) {
                return (
                        <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map((i) => (
                                        <div
                                                key={i}
                                                className="h-16 bg-white rounded-xl shadow-sm animate-pulse"
                                        />
                                ))}
                        </div>
                );
        }

        return (
                <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-xl shadow-sm p-4">
                                <div className="text-sm text-gray-500">
                                        Resolved
                                </div>
                                <div className="text-2xl font-bold text-green-700">
                                        {metrics.resolved}
                                </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4">
                                <div className="text-sm text-gray-500">
                                        Active (Pending/In-Progress)
                                </div>
                                <div className="text-2xl font-bold text-yellow-600">
                                        {metrics.active}
                                </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4">
                                <div className="text-sm text-gray-500">
                                        Overdue
                                </div>
                                <div className="text-xs text-gray-500">
                                        Stalled / Revived
                                </div>
                                <div className="text-2xl font-bold text-red-700">
                                        {metrics.overdue}
                                </div>
                        </div>
                </div>
        );
}

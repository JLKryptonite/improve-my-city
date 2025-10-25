import Link from "next/link";
import type { MetricsData } from "@/types";

interface StatsBarProps {
        metrics: MetricsData | null;
        loading?: boolean;
}

export default function StatsBar({ metrics, loading }: StatsBarProps) {
        if (loading || !metrics) {
                return (
                        <div className="flex justify-center">
                                <div className="grid grid-cols-3 gap-8">
                                        {[1, 2, 3].map((i) => (
                                                <div
                                                        key={i}
                                                        className="w-48 h-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl animate-pulse hover:bg-white transition-all duration-300"
                                                />
                                        ))}
                                </div>
                        </div>
                );
        }

        return (
                <div className="flex justify-center">
                        <div className="grid grid-cols-3 gap-8">
                                {/* Resolved Box */}
                                <Link href="/complaints?status=resolved" className="block">
                                        <div className="w-48 h-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col items-center justify-center border-l-4 border-green-500 hover:bg-white hover:shadow-green-200 hover:scale-105 transition-all duration-300 cursor-pointer">
                                                <div className="text-green-500 text-3xl mb-3">
                                                        ✓
                                                </div>
                                                <div className="text-base text-gray-600 font-medium text-center">
                                                        Resolved
                                                </div>
                                                <div className="text-3xl font-bold text-green-700">
                                                        {metrics.resolved}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                        Reports
                                                </div>
                                        </div>
                                </Link>

                                {/* In Progress Box */}
                                <Link href="/complaints?status=pending,in_progress" className="block">
                                        <div className="w-48 h-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col items-center justify-center border-l-4 border-yellow-500 hover:bg-white hover:shadow-yellow-200 hover:scale-105 transition-all duration-300 cursor-pointer">
                                                <div className="text-yellow-500 text-3xl mb-3">
                                                        ⏱
                                                </div>
                                                <div className="text-base text-gray-600 font-medium text-center">
                                                        In Progress
                                                </div>
                                                <div className="text-3xl font-bold text-yellow-600">
                                                        {metrics.active}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                        Reports
                                                </div>
                                        </div>
                                </Link>

                                {/* Delayed Box */}
                                <Link href="/complaints?status=stalled,revived" className="block">
                                        <div className="w-48 h-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col items-center justify-center border-l-4 border-red-500 hover:bg-white hover:shadow-red-200 hover:scale-105 transition-all duration-300 cursor-pointer">
                                                <div className="text-red-500 text-3xl mb-3">
                                                        ⚠
                                                </div>
                                                <div className="text-base text-gray-600 font-medium text-center">
                                                        Delayed
                                                </div>
                                                <div className="text-3xl font-bold text-red-700">
                                                        {metrics.overdue}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                        Reports
                                                </div>
                                        </div>
                                </Link>
                        </div>
                </div>
        );
}

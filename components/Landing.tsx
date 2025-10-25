'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import StatsBar from "@/components/StatsBar";
import type { MetricsData } from "@/types";

export default function Landing() {
        const [metrics, setMetrics] = useState<MetricsData | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
                publicApi.getMetrics()
                        .then((data) => {
                                setMetrics(data);
                                setLoading(false);
                        })
                        .catch((err) => {
                                setError(err.message || 'Failed to load metrics');
                                setLoading(false);
                        });
        }, []);

        if (error) {
                return (
                        <div className="space-y-6">
                                <div className="text-center space-y-2">
                                        <h1 className="text-2xl font-bold">
                                                See how citizens are improving their city
                                        </h1>
                                        <p className="text-sm text-red-600">
                                                {error}
                                        </p>
                                </div>
                        </div>
                );
        }

        return (
                <div className="space-y-8">
                        <div className="text-center space-y-2">
                                <h1 className="text-2xl font-bold text-white">
                                        See how citizens are improving their city
                                </h1>
                                <p className="text-sm text-gray-200">
                                        National overview by default. Provide your location to zoom into your area.
                                </p>
                        </div>
                        
                        {/* Search Bar */}
                        <div className="flex justify-center">
                                <div className="w-full max-w-md">
                                        <input
                                                type="text"
                                                placeholder="Search by complaint number"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                </div>
                        </div>

                        <StatsBar metrics={metrics} loading={loading} />
                        
                        <div className="flex justify-center">
                                <Link
                                        href="/report"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-lg transition-colors text-lg"
                                >
                                        File a Complaint
                                </Link>
                        </div>
                </div>
        );
}

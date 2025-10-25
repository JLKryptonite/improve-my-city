'use client';

import { useEffect, useState } from "react";
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
                <div className="space-y-6">
                        <div className="text-center space-y-2">
                                <h1 className="text-2xl font-bold">
                                        See how citizens are improving their city
                                </h1>
                                <p className="text-sm text-gray-600">
                                        National overview by default. Provide your location to zoom into your area.
                                </p>
                        </div>
                        <StatsBar metrics={metrics} loading={loading} />
                        {/* Map placeholder */}
                        <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl grid place-items-center">
                                <span className="text-gray-600">
                                        [ National Map Placeholder ]
                                </span>
                        </div>
                </div>
        );
}

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import StatsBar from "../components/StatsBar";

export default function Landing() {
        const [metrics, setMetrics] = useState<any>(null);
        useEffect(() => {
                api.get("/metrics").then((r) => setMetrics(r.data));
        }, []);

        return (
                <div className="space-y-6">
                        <div className="text-center space-y-2">
                                <h1 className="text-2xl font-bold">
                                        See how citizens are improving their
                                        city
                                </h1>
                                <p className="text-sm text-gray-600">
                                        National overview by default. Provide
                                        your location to zoom into your area.
                                </p>
                        </div>
                        <StatsBar metrics={metrics} />
                        {/* Map placeholder */}
                        <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl grid place-items-center">
                                <span className="text-gray-600">
                                        [ National Map Placeholder ]
                                </span>
                        </div>
                </div>
        );
}

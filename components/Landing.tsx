'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publicApi } from "@/lib/api";
import StatsBar from "@/components/StatsBar";
import type { MetricsData } from "@/types";

export default function Landing() {
	const [metrics, setMetrics] = useState<MetricsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();

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

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/complaints/${searchQuery.trim()}`);
		}
	};

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4 animate-fadeIn">
				<div className="text-center space-y-4 py-12 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-gray-900">
						Error Loading
					</h1>
					<p className="text-base text-red-600">
						{error}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 space-y-8 animate-fadeIn">
			{/* Hero Section - Large centered title */}
			<div className="text-center space-y-1 mb-8">
				<h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight text-shadow-strong"
				    style={{
						fontFamily: '"Times New Roman", Times, serif',
						fontWeight: '300',
						letterSpacing: '-0.02em'
					}}>
					Improve My City
				</h1>
			</div>

			{/* Status Cards */}
			<div className="w-full">
				<StatsBar metrics={metrics} loading={loading} />
			</div>
			
			{/* Search Bar */}
			<div className="w-full max-w-5xl">
				<form onSubmit={handleSearch}>
					<div className="relative group">
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by complaint ID..."
							className="w-full px-6 py-4 text-base rounded-2xl opaque-search shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-200 text-gray-900 placeholder-gray-500"
						/>
					</div>
				</form>
			</div>

			{/* File Complaint Button */}
			<div className="w-full max-w-5xl">
				<Link
					href="/report"
					className="group relative inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg w-full"
				>
					<svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
					</svg>
					File new Complaint
				</Link>
			</div>
		</div>
	);
}

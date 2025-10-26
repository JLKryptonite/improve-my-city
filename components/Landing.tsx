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
			<div className="space-y-6 animate-fadeIn">
				<div className="text-center space-y-4 py-12">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
						<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-gray-900">
						See how citizens are improving their city
					</h1>
					<p className="text-base text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-md mx-auto">
						{error}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-12 animate-fadeIn">
			{/* Hero Section */}
			<div className="text-center space-y-6 pt-8">
				<div className="space-y-3">
					<h1 className="text-4xl md:text-5xl font-bold text-white" style={{textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'}}>
						See how citizens are improving their city
					</h1>
					<p className="text-base md:text-lg text-gray-50 max-w-2xl mx-auto font-medium" style={{textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)'}}>
						National overview by default. Provide your location to zoom into your area.
					</p>
				</div>
				
				{/* Trust indicators */}
				<div className="flex items-center justify-center gap-6 text-white text-sm font-medium" style={{textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>
					<div className="flex items-center gap-2">
						<svg className="w-5 h-5 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
						</svg>
						<span>Fast Response</span>
					</div>
					<div className="flex items-center gap-2">
						<svg className="w-5 h-5 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
						</svg>
						<span>Transparent Updates</span>
					</div>
					<div className="flex items-center gap-2">
						<svg className="w-5 h-5 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
						</svg>
						<span>Proven Results</span>
					</div>
				</div>
			</div>
			
			{/* Search Bar */}
			<div className="flex justify-center px-4">
				<form onSubmit={handleSearch} className="w-full max-w-2xl">
					<div className="relative group">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by complaint ID (e.g., 67397cd12da1d1d4f38c86a3)"
							className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-300 bg-white/98 backdrop-blur-sm shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
						/>
					</div>
				</form>
			</div>

			<StatsBar metrics={metrics} loading={loading} />
			
			<div className="flex justify-center pb-8">
				<Link
					href="/report"
					className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-10 py-5 rounded-xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.6)] transition-all duration-300 hover:scale-105 text-lg ring-2 ring-blue-500/20"
				>
					<svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
					</svg>
					File a Complaint
					<div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
				</Link>
			</div>
		</div>
	);
}

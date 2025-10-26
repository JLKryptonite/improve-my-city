'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import type { Complaint } from "@/types";

export default function ComplaintList() {
	const searchParams = useSearchParams();
	const [complaints, setComplaints] = useState<{ items: Complaint[]; total: number; page: number; pageSize: number; totalPages: number } | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState({
		status: '',
		state: '',
		city: '',
		category: '',
		page: 1,
	});
	// Local state for text inputs (debounced)
	const [localState, setLocalState] = useState('');
	const [localCity, setLocalCity] = useState('');
	const [initialized, setInitialized] = useState(false);

	// Initialize filters from URL parameters
	useEffect(() => {
		const urlStatus = searchParams.get('status') || '';
		
		// Reset all filters to match URL (including when URL has no params)
		setFilters({
			status: urlStatus,
			state: '',
			city: '',
			category: '',
			page: 1,
		});
		setLocalState('');
		setLocalCity('');
		
		setInitialized(true);
	}, [searchParams]);

	useEffect(() => {
		if (initialized) {
			loadComplaints();
		}
	}, [filters, initialized]);

	const loadComplaints = async () => {
		setLoading(true);
		setError(null);

		try {
			const params: any = { page: filters.page };
			if (filters.status) params.status = filters.status;
			if (filters.state) params.state = filters.state;
			if (filters.city) params.city = filters.city;
			if (filters.category) params.category = filters.category;

			const data = await publicApi.getComplaints(params);
			setComplaints(data);
		} catch (err: any) {
			setError(err.message || 'Failed to load complaints');
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (key: string, value: string) => {
		setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
		// Also update local state when clearing filters
		if (key === 'state') setLocalState(value);
		if (key === 'city') setLocalCity(value);
	};

	const applyTextFilters = () => {
		setFilters(prev => ({ ...prev, state: localState, city: localCity, page: 1 }));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			applyTextFilters();
		}
	};

	const getStatusInfo = (status: string) => {
		switch (status) {
			case 'resolved':
				return {
					color: 'bg-green-100 text-green-700 border-green-200',
					icon: (
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
						</svg>
					),
				};
			case 'in_progress':
				return {
					color: 'bg-blue-100 text-blue-700 border-blue-200',
					icon: (
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					),
				};
			case 'pending':
				return {
					color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
					icon: (
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					),
				};
			case 'stalled':
				return {
					color: 'bg-red-100 text-red-700 border-red-200',
					icon: (
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					),
				};
			case 'revived':
				return {
					color: 'bg-orange-100 text-orange-700 border-orange-200',
					icon: (
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					),
				};
			default:
				return {
					color: 'bg-gray-100 text-gray-700 border-gray-200',
					icon: null,
				};
		}
	};

	if (loading) {
		return (
			<div className="space-y-6 max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<h2 className="text-3xl font-bold text-gray-900">Browse Complaints</h2>
					<Link href="/report" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Report Issue
					</Link>
				</div>
				<div className="grid gap-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="bg-white rounded-xl shadow-md p-6 animate-shimmer h-32" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6 max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<h2 className="text-3xl font-bold text-gray-900">Browse Complaints</h2>
					<Link href="/report" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Report Issue
					</Link>
				</div>
				<div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
					<svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
					</svg>
					<p className="text-red-700 font-medium">{error}</p>
				</div>
			</div>
		);
	}

	const getPageTitle = () => {
		if (filters.status === 'resolved') return 'Resolved Complaints';
		if (filters.status === 'pending,in_progress') return 'Active Complaints';
		if (filters.status === 'stalled,revived') return 'Delayed Complaints';
		if (filters.status) {
			// Check if multiple statuses
			if (filters.status.includes(',')) {
				const statuses = filters.status.split(',').map(s => 
					s.trim().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
				);
				return `${statuses.join(' & ')} Complaints`;
			}
			return `${filters.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Complaints`;
		}
		
		return 'Browse Complaints';
	};

	const hasActiveFilters = filters.status || filters.state || filters.city || filters.category;

	return (
		<div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto px-4 py-4 sm:py-8 animate-fadeIn">
			{/* Header */}
			<div className="flex flex-col gap-3 sm:gap-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div className="flex items-center gap-3 flex-wrap">
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{getPageTitle()}</h2>
						{hasActiveFilters && (
							<Link
								href="/complaints"
								className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
							>
								<svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
								Clear Filters
							</Link>
						)}
					</div>
					<Link href="/report" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base">
						<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Report Issue
					</Link>
				</div>
			</div>

			{/* Active Filter Badges */}
			{hasActiveFilters && (
				<div className="flex flex-wrap gap-2">
					{filters.status && (
						<span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
							Status: {filters.status.includes(',') 
								? filters.status.split(',').map(s => s.trim().replace('_', ' ')).join(' & ')
								: filters.status.replace('_', ' ')
							}
							<button
								onClick={() => handleFilterChange('status', '')}
								className="hover:text-blue-900 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</span>
					)}
					{filters.city && (
						<span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							City: {filters.city}
							<button
								onClick={() => handleFilterChange('city', '')}
								className="hover:text-purple-900 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</span>
					)}
					{filters.state && (
						<span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
							</svg>
							State: {filters.state}
							<button
								onClick={() => handleFilterChange('state', '')}
								className="hover:text-green-900 hover:bg-green-200 rounded-full p-0.5 transition-colors"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</span>
					)}
					{filters.category && (
						<span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
							Category: {filters.category}
							<button
								onClick={() => handleFilterChange('category', '')}
								className="hover:text-amber-900 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</span>
					)}
				</div>
			)}

			{/* Filters */}
			<div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
				<h3 className="text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
					<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
					</svg>
					Filter Complaints
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					<div>
						<label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Status</label>
						<select
							className="w-full border-2 border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
							value={filters.status}
							onChange={(e) => handleFilterChange('status', e.target.value)}
						>
							<option value="">All Statuses</option>
							<option value="pending,in_progress">✨ Active</option>
							<option value="stalled,revived">⚠️ Delayed</option>
							<option value="pending">⏳ Pending</option>
							<option value="in_progress">🔄 In Progress</option>
							<option value="resolved">✅ Resolved</option>
							<option value="stalled">🛑 Stalled</option>
							<option value="revived">🔄 Revived</option>
						</select>
					</div>
					<div>
						<label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">State</label>
						<input
							className="w-full border-2 border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
							placeholder="e.g., Karnataka"
							value={localState}
							onChange={(e) => setLocalState(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
					</div>
					<div>
						<label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">City</label>
						<input
							className="w-full border-2 border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
							placeholder="e.g., Bangalore"
							value={localCity}
							onChange={(e) => setLocalCity(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
					</div>
					<div>
						<label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Category</label>
						<select
							className="w-full border-2 border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
							value={filters.category}
							onChange={(e) => handleFilterChange('category', e.target.value)}
						>
							<option value="">All Categories</option>
							<option value="pothole">🕳️ Pothole</option>
							<option value="streetlight">💡 Streetlight</option>
							<option value="garbage">🗑️ Garbage Overflow</option>
							<option value="water">💧 Water Leakage</option>
							<option value="tree">🌳 Fallen Tree / Debris</option>
						</select>
					</div>
				</div>
				<div className="mt-3 sm:mt-4 flex justify-center">
					<button
						onClick={applyTextFilters}
						className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
					>
						<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						Search
					</button>
				</div>
			</div>

			{/* Results */}
			<div className="space-y-3 sm:space-y-4">
				{complaints?.items?.map((complaint, index) => {
					const statusInfo = getStatusInfo(complaint.status);
					return (
						<div 
							key={complaint._id} 
							className="bg-white rounded-xl shadow-md hover:shadow-xl p-4 sm:p-6 transition-all duration-300 border-l-4 hover:scale-[1.01] animate-fadeIn group"
							style={{ 
								borderLeftColor: statusInfo.color.includes('green') ? '#10b981' : 
												 statusInfo.color.includes('blue') ? '#3b82f6' :
												 statusInfo.color.includes('yellow') ? '#f59e0b' :
												 statusInfo.color.includes('red') ? '#ef4444' : '#f97316',
								animationDelay: `${index * 50}ms`
							}}
						>
							<div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
								<div className="flex-1 space-y-2 sm:space-y-3 w-full">
									<div className="flex items-center gap-2 sm:gap-3 flex-wrap">
										<h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize">
											{complaint.category}
										</h3>
										<span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
											{statusInfo.icon}
											{complaint.status.replace('_', ' ')}
										</span>
									</div>
									<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
										<div className="flex items-center gap-1.5">
											<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
											<span className="font-medium">{complaint.city}, {complaint.state}</span>
										</div>
										<div className="flex items-center gap-1.5">
											<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span>{new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
										</div>
									</div>
									<div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 sm:px-3 py-1.5 rounded-lg inline-block break-all">
										ID: {complaint._id}
									</div>
								</div>
								<Link
									href={`/complaints/${complaint._id}`}
									className="w-full sm:w-auto flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-105 text-sm sm:text-base"
								>
									<span>View Details</span>
									<svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</Link>
							</div>
						</div>
					);
				})}

				{(!complaints?.items || complaints.items.length === 0) && (
					<div className="text-center py-16 bg-white rounded-xl shadow-md">
						<svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<p className="text-gray-500 font-medium text-lg">No complaints found matching your criteria.</p>
						<p className="text-gray-400 text-sm mt-2">Try adjusting your filters or report a new issue.</p>
					</div>
				)}
			</div>

			{/* Pagination */}
			{complaints && complaints.totalPages > 1 && (
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white rounded-xl shadow-md p-4 sm:p-6">
					<div className="text-xs sm:text-sm text-gray-600 font-medium text-center sm:text-left">
						Showing <span className="text-gray-900 font-semibold">{((complaints.page - 1) * complaints.pageSize) + 1}</span> to <span className="text-gray-900 font-semibold">{Math.min(complaints.page * complaints.pageSize, complaints.total)}</span> of <span className="text-gray-900 font-semibold">{complaints.total}</span> results
					</div>
					<div className="flex items-center gap-2 w-full sm:w-auto">
						<button
							onClick={() => handleFilterChange('page', String(complaints.page - 1))}
							disabled={complaints.page <= 1}
							className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							<span className="hidden sm:inline">Previous</span>
							<span className="sm:hidden">Prev</span>
						</button>
						<span className="px-3 sm:px-4 py-2 font-semibold text-gray-700 bg-gray-50 rounded-lg border-2 border-gray-200 text-xs sm:text-sm whitespace-nowrap">
							{complaints.page}/{complaints.totalPages}
						</span>
						<button
							onClick={() => handleFilterChange('page', String(complaints.page + 1))}
							disabled={complaints.page >= complaints.totalPages}
							className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
						>
							Next
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

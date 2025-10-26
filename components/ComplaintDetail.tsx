'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicApi, authorityApi, auth } from "@/lib/api";
import type { Complaint, Status } from "@/types";

interface ComplaintDetailProps {
	id: string;
}

export default function ComplaintDetail({ id }: ComplaintDetailProps) {
	const [complaint, setComplaint] = useState<Complaint | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isAuthority, setIsAuthority] = useState(false);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	useEffect(() => {
		// Check if user is authenticated as authority
		const authenticated = auth.isAuthenticated();
		setIsAuthority(authenticated);
		loadComplaint(authenticated);
	}, [id]);

	const loadComplaint = async (authenticated: boolean = isAuthority) => {
		setLoading(true);
		setError(null);

		try {
			// Use authority API if user is authenticated, otherwise use public API
			const data = authenticated
				? await authorityApi.getComplaint(id)
				: await publicApi.getComplaint(id);
			setComplaint(data);
		} catch (err: any) {
			setError(err.message || 'Failed to load complaint');
		} finally {
			setLoading(false);
		}
	};

	const handleAuthorityAction = async (action: string, data?: any) => {
		if (!complaint || !isAuthority) return;

		setActionLoading(action);
		try {
			let updatedComplaint: Complaint;

			switch (action) {
				case 'start-progress':
					updatedComplaint = await authorityApi.startProgress(complaint._id, data?.note);
					break;
				case 'update-progress':
					updatedComplaint = await authorityApi.updateProgress(complaint._id, data?.note);
					break;
				case 'hold':
					updatedComplaint = await authorityApi.putOnHold(
						complaint._id,
						data.reason,
						data.expected_resume_at
					);
					break;
				case 'resolve':
					updatedComplaint = await authorityApi.resolve(complaint._id, data?.note);
					break;
				default:
					throw new Error('Unknown action');
			}

			setComplaint(updatedComplaint);
		} catch (err: any) {
			setError(err.message || 'Action failed');
		} finally {
			setActionLoading(null);
		}
	};

	const getStatusColor = (status: Status) => {
		switch (status) {
			case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
			case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
			case 'stalled': return 'bg-red-100 text-red-700 border-red-200';
			case 'revived': return 'bg-orange-100 text-orange-700 border-orange-200';
			default: return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	};

	const getTimelineIcon = (eventType: string) => {
		switch (eventType) {
			case 'submitted':
				return {
					icon: (
						<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					),
					bg: 'bg-blue-100',
				};
			case 'progress_started':
				return {
					icon: (
						<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					),
					bg: 'bg-green-100',
				};
			case 'work_update':
				return {
					icon: (
						<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					),
					bg: 'bg-blue-100',
				};
			case 'work_on_hold':
				return {
					icon: (
						<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					),
					bg: 'bg-amber-100',
				};
			case 'resolved':
				return {
					icon: (
						<svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
						</svg>
					),
					bg: 'bg-green-100',
				};
			case 'no_progress_update':
				return {
					icon: (
						<svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					),
					bg: 'bg-purple-100',
				};
			default:
				return {
					icon: (
						<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
					),
					bg: 'bg-gray-100',
				};
		}
	};

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold text-gray-900">Complaint Details</h2>
					<Link href="/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Back to List
					</Link>
				</div>
				<div className="bg-white rounded-xl shadow-md p-8 animate-shimmer h-96" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold text-gray-900">Complaint Details</h2>
					<Link href="/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Back to List
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

	if (!complaint) {
		return (
			<div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold text-gray-900">Complaint Details</h2>
					<Link href="/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Back to List
					</Link>
				</div>
				<div className="text-center py-16 bg-white rounded-xl shadow-md">
					<svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<p className="text-gray-600 font-medium">Complaint not found.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold text-gray-900">Complaint Details</h2>
				<Link href="/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors hover:gap-3">
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Back to List
				</Link>
			</div>

			{/* Complaint Header */}
			<div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-500">
				<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
					<div className="flex items-center gap-4 flex-wrap">
						<span className="text-3xl font-bold text-gray-900">#{complaint._id}</span>
						<span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(complaint.status)}`}>
							{complaint.status.replace('_', ' ').toUpperCase()}
						</span>
					</div>
					<div className="flex items-center gap-2 text-sm text-gray-500">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						Created: <span className="font-medium text-gray-700">{new Date(complaint.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					<div className="space-y-6">
						<div>
							<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h3>
							<p className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">
								<span className="w-2 h-2 bg-blue-500 rounded-full"></span>
								{complaint.category}
							</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
							<p className="text-gray-700 leading-relaxed">{complaint.description || 'No description provided'}</p>
						</div>
						<div>
							<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</h3>
							<div className="space-y-2">
								<p className="text-gray-900 font-medium flex items-center gap-2">
									<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									{complaint.city}, {complaint.state}
									{complaint.ward && ` • Ward ${complaint.ward}`}
								</p>
								<p className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg inline-flex items-center gap-2">
									<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
									</svg>
									Lat: {complaint.location.coordinates[1].toFixed(6)}, Lng: {complaint.location.coordinates[0].toFixed(6)}
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<div>
							<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Photos</h3>
							{complaint.photos_before && complaint.photos_before.length > 0 ? (
								<div className="grid grid-cols-2 gap-3">
									{complaint.photos_before.map((photo, index) => (
										<div key={index} className="group relative">
											<img
												src={photo}
												alt={`Before ${index + 1}`}
												className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-200 cursor-pointer"
											/>
											<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
										</div>
									))}
								</div>
							) : (
								<p className="text-gray-500 italic">No photos uploaded</p>
							)}
						</div>

						{(complaint.photos_progress && complaint.photos_progress.length > 0) && (
							<div>
								<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Progress Photos</h3>
								<div className="grid grid-cols-2 gap-3">
									{complaint.photos_progress.map((photo, index) => (
										<div key={index} className="group relative">
											<img
												src={photo}
												alt={`Progress ${index + 1}`}
												className="w-full h-40 object-cover rounded-lg border-2 border-green-200 group-hover:border-green-400 transition-all duration-200 cursor-pointer"
											/>
											<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Authority Actions */}
			{isAuthority && (
				<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-100">
					<h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
						<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						Authority Actions
					</h3>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
						{complaint.status === 'pending' && (
							<button
								onClick={() => handleAuthorityAction('start-progress')}
								disabled={actionLoading !== null}
								className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{actionLoading === 'start-progress' ? 'Starting...' : 'Start Progress'}
							</button>
						)}

						{(complaint.status === 'in_progress' || complaint.status === 'revived') && (
							<>
								<button
									onClick={() => handleAuthorityAction('update-progress')}
									disabled={actionLoading !== null}
									className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									{actionLoading === 'update-progress' ? 'Updating...' : 'Update Progress'}
								</button>
								<button
									onClick={() => handleAuthorityAction('hold')}
									disabled={actionLoading !== null}
									className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{actionLoading === 'hold' ? 'Holding...' : 'Put On Hold'}
								</button>
								<button
									onClick={() => handleAuthorityAction('resolve')}
									disabled={actionLoading !== null}
									className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
								>
									<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									{actionLoading === 'resolve' ? 'Resolving...' : 'Mark Resolved'}
								</button>
							</>
						)}
					</div>
				</div>
			)}

			{/* Timeline */}
			<div className="bg-white rounded-2xl shadow-xl p-8">
				<h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
					<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Timeline
				</h3>
				<div className="relative">
					{/* Vertical line */}
					{complaint.timeline.length > 1 && (
						<div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-transparent"></div>
					)}

					<div className="space-y-6">
						{complaint.timeline.map((event, index) => {
							const timelineInfo = getTimelineIcon(event.type);
							return (
								<div key={index} className="flex gap-6 relative animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
									{/* Icon */}
									<div className="flex-shrink-0 relative z-10">
										<div className={`w-12 h-12 ${timelineInfo.bg} rounded-full flex items-center justify-center shadow-md border-4 border-white`}>
											{timelineInfo.icon}
										</div>
									</div>
									
									{/* Content */}
									<div className="flex-1 pb-8">
										<div className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-blue-200 transition-colors">
											<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
												<span className="text-base font-bold text-gray-900 capitalize">
													{event.type.replace(/_/g, ' ')}
												</span>
												<span className="text-sm text-gray-500 flex items-center gap-1.5">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													{new Date(event.ts).toLocaleString('en-US', { 
														month: 'short', 
														day: 'numeric', 
														year: 'numeric', 
														hour: 'numeric', 
														minute: '2-digit',
														hour12: true 
													})}
												</span>
											</div>
											{event.note && (
												<p className="text-sm text-gray-700 mb-3 leading-relaxed">{event.note}</p>
											)}
											{event.images && event.images.length > 0 && (
												<div className="flex gap-3 flex-wrap">
													{event.images.map((img, imgIndex) => (
														<div key={imgIndex} className="group relative">
															<img
																src={img}
																alt={`Timeline ${imgIndex + 1}`}
																className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 group-hover:border-blue-400 transition-all duration-200 cursor-pointer"
															/>
															<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								</div>
							);
						})}

						{complaint.timeline.length === 0 && (
							<div className="text-center py-12">
								<svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p className="text-gray-500">No timeline events yet</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

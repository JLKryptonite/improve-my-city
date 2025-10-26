'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { authorityApi, auth } from "@/lib/api";
import type { Complaint } from "@/types";

export default function AuthorityDashboard() {
	const [newComplaints, setNewComplaints] = useState<{ items: Complaint[] } | null>(null);
	const [overdue, setOverdue] = useState<{ items: Complaint[] } | null>(null);
	const [requiringAction, setRequiringAction] = useState<{ items: Complaint[] } | null>(null);
	const [resolved, setResolved] = useState<{ items: Complaint[] } | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	// State to track which categories are expanded
	const [expandedCategories, setExpandedCategories] = useState<{
		new: boolean;
		overdue: boolean;
		requiringAction: boolean;
		resolved: boolean;
	}>({
		new: true,
		overdue: true,
		requiringAction: true,
		resolved: false,
	});

	const toggleCategory = (category: 'new' | 'overdue' | 'requiringAction' | 'resolved') => {
		setExpandedCategories(prev => ({
			...prev,
			[category]: !prev[category]
		}));
	};

	useEffect(() => {
		// Check if user is authenticated
		if (!auth.isAuthenticated()) {
			window.location.href = '/authority/login';
			return;
		}

		// Load complaints by category
		Promise.all([
			// New: pending complaints
			authorityApi.getComplaints({ status: 'pending' }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })),
			// Overdue: stalled and revived complaints
			Promise.all([
				authorityApi.getComplaints({ status: 'stalled' }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })),
				authorityApi.getComplaints({ status: 'revived' }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }))
			]).then(([stalledData, revivedData]) => ({
				items: [...(stalledData.items || []), ...(revivedData.items || [])],
				total: (stalledData.total || 0) + (revivedData.total || 0)
			})),
			// Requiring Action: in_progress complaints only
			authorityApi.getComplaints({ status: 'in_progress' }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })),
			// Resolved: resolved complaints
			authorityApi.getComplaints({ status: 'resolved' }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }))
		]).then(([newData, overdueData, requiringActionData, resolvedData]) => {
			setNewComplaints(newData);
			setOverdue(overdueData);
			setRequiringAction(requiringActionData);
			setResolved(resolvedData);
			setLoading(false);
		}).catch((err) => {
			setError(err.message || 'Failed to load complaints');
			setLoading(false);
		});
	}, []);

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold text-gray-900">Complaint Management Dashboard</h2>
				</div>
				<div className="grid gap-6">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="bg-white rounded-xl shadow-md p-6 animate-shimmer h-48" />
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
				<h2 className="text-3xl font-bold text-gray-900">Complaint Management Dashboard</h2>
				<div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
					<svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
					</svg>
					<p className="text-red-700 font-medium">{error}</p>
				</div>
			</div>
		);
	}

	const renderCategory = (
		categoryKey: 'new' | 'overdue' | 'requiringAction' | 'resolved',
		title: string,
		subtitle: string,
		complaints: { items: Complaint[] } | null,
		icon: React.ReactNode,
		colorClasses: {
			bg: string;
			border: string;
			text: string;
			iconBg: string;
		},
		emptyMessage: string,
		actionText: string
	) => {
		const isExpanded = expandedCategories[categoryKey];
		const count = complaints?.items?.length || 0;

		return (
			<div className={`bg-white rounded-xl shadow-lg overflow-hidden border-l-4 ${colorClasses.border} animate-fadeIn`}>
				{/* Category Header */}
				<button
					onClick={() => toggleCategory(categoryKey)}
					className={`w-full p-6 flex items-center justify-between hover:${colorClasses.bg} transition-colors group`}
				>
					<div className="flex items-center gap-4">
						<div className={`w-12 h-12 ${colorClasses.iconBg} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
							{icon}
						</div>
						<div className="text-left">
							<div className={`font-bold text-xl ${colorClasses.text} flex items-center gap-3`}>
								{title}
								<span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-bold">
									{count}
								</span>
							</div>
							<div className="text-sm text-gray-500 mt-1">
								{subtitle}
							</div>
						</div>
					</div>
					<svg
						className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{/* Category Content */}
				{isExpanded && (
					<div className="border-t-2 border-gray-100 bg-gray-50">
						{count === 0 ? (
							<div className="p-12 text-center">
								<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<p className="text-gray-500 font-medium">{emptyMessage}</p>
							</div>
						) : (
							<div className="p-6">
								<div className="grid gap-4">
									{complaints?.items?.map((c, index) => (
										<div
											key={c._id}
											className="bg-white rounded-lg p-5 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 animate-fadeIn group"
											style={{ animationDelay: `${index * 50}ms` }}
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 space-y-2">
													<div className="flex items-center gap-3 flex-wrap">
														<h4 className="font-bold text-lg text-gray-900 capitalize">
															{c.category}
														</h4>
														<span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
															{c.status.replace('_', ' ')}
														</span>
													</div>
													<div className="flex items-center gap-4 text-sm text-gray-600">
														<span className="flex items-center gap-1.5">
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
															</svg>
															{c.city}, {c.state}
														</span>
														<span className="flex items-center gap-1.5">
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
															{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
														</span>
													</div>
													{c.description && (
														<p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
													)}
													<div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
														#{c._id}
													</div>
												</div>
												<Link
													href={`/complaints/${c._id}`}
													className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg flex items-center gap-2 group-hover:scale-105"
												>
													<span>{actionText}</span>
													<svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
													</svg>
												</Link>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold text-gray-900">
						Complaint Management Dashboard
					</h2>
					<p className="text-gray-600 mt-2">Manage and track civic complaints efficiently</p>
				</div>
				<Link 
					href="/complaints" 
					className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
					</svg>
					View All Complaints
				</Link>
			</div>
			
			{/* Summary Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
					<div className="text-3xl font-bold">{newComplaints?.items?.length || 0}</div>
					<div className="text-blue-100 text-sm mt-1">New Complaints</div>
				</div>
				<div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
					<div className="text-3xl font-bold">{overdue?.items?.length || 0}</div>
					<div className="text-red-100 text-sm mt-1">Overdue</div>
				</div>
				<div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
					<div className="text-3xl font-bold">{requiringAction?.items?.length || 0}</div>
					<div className="text-orange-100 text-sm mt-1">In Progress</div>
				</div>
				<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
					<div className="text-3xl font-bold">{resolved?.items?.length || 0}</div>
					<div className="text-green-100 text-sm mt-1">Resolved</div>
				</div>
			</div>

			{/* Category Sections */}
			<div className="space-y-6">
				{/* New Category */}
				{renderCategory(
					'new',
					'New Complaints',
					'Pending complaints awaiting action',
					newComplaints,
					<svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>,
					{
						bg: 'bg-blue-50',
						border: 'border-blue-500',
						text: 'text-blue-700',
						iconBg: 'bg-blue-100',
					},
					'No new complaints at the moment',
					'Take Action'
				)}

				{/* Overdue Category */}
				{renderCategory(
					'overdue',
					'Overdue Complaints',
					'Stalled & Revived complaints requiring immediate attention',
					overdue,
					<svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>,
					{
						bg: 'bg-red-50',
						border: 'border-red-500',
						text: 'text-red-700',
						iconBg: 'bg-red-100',
					},
					'No overdue complaints',
					'Urgent Action'
				)}

				{/* Requiring Action Category */}
				{renderCategory(
					'requiringAction',
					'In Progress',
					'Complaints currently being worked on',
					requiringAction,
					<svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>,
					{
						bg: 'bg-orange-50',
						border: 'border-orange-500',
						text: 'text-orange-700',
						iconBg: 'bg-orange-100',
					},
					'No complaints currently in progress',
					'Update Status'
				)}

				{/* Resolved Category */}
				{renderCategory(
					'resolved',
					'Resolved Complaints',
					'Successfully completed complaints',
					resolved,
					<svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
					</svg>,
					{
						bg: 'bg-green-50',
						border: 'border-green-500',
						text: 'text-green-700',
						iconBg: 'bg-green-100',
					},
					'No resolved complaints yet',
					'View Details'
				)}
			</div>
		</div>
	);
}

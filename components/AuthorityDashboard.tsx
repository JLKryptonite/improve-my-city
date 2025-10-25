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
		resolved: true,
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
			<div className="space-y-6">
				<h2 className="text-xl font-semibold">Complaint Management Dashboard</h2>
				<div className="space-y-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse">
							<div className="h-8 bg-gray-200 rounded mb-3 w-64"></div>
							<div className="h-24 bg-gray-100 rounded"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

        if (error) {
                return (
                        <div className="space-y-6">
                                <h2 className="text-xl font-semibold">Complaint Management Dashboard</h2>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <p className="text-red-600">{error}</p>
                                </div>
                        </div>
                );
        }

	const renderCategory = (
		categoryKey: 'new' | 'overdue' | 'requiringAction' | 'resolved',
		title: string,
		subtitle: string,
		complaints: { items: Complaint[] } | null,
		colorClass: string,
		emptyMessage: string,
		actionText: string
	) => {
		const isExpanded = expandedCategories[categoryKey];
		const count = complaints?.items?.length || 0;

		return (
			<div className="bg-white rounded-xl shadow overflow-hidden">
				{/* Category Header */}
				<button
					onClick={() => toggleCategory(categoryKey)}
					className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
				>
					<div className="flex items-center gap-4">
						<svg
							className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
						<div className="text-left">
							<div className={`font-semibold text-lg ${colorClass}`}>
								{title} ({count})
							</div>
							<div className="text-xs text-gray-500">
								{subtitle}
							</div>
						</div>
					</div>
				</button>

				{/* Category Content */}
				{isExpanded && (
					<div className="border-t">
						{count === 0 ? (
							<div className="p-6 text-center text-gray-500">
								{emptyMessage}
							</div>
						) : (
							<div className="p-4 overflow-x-auto">
								<div className="flex gap-4 min-w-max">
									{complaints?.items?.map((c) => (
										<div
											key={c._id}
											className="bg-gray-50 rounded-lg p-4 min-w-[300px] max-w-[400px] border border-gray-200 hover:border-gray-300 transition-colors"
										>
											<div className="mb-3">
												<div className="font-semibold text-base mb-1">
													{c.category} — {c.city}
												</div>
												<div className="text-xs text-gray-500 font-mono">
													#{c._id}
												</div>
											</div>
											<div className="text-sm text-gray-700 mb-3 line-clamp-2">
												{c.description}
											</div>
											<div className="flex items-center justify-between">
												<div className="text-xs text-gray-500">
													Status: <span className="font-medium">{c.status}</span>
												</div>
												<Link
													href={`/complaints/${c._id}`}
													className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
												>
													{actionText}
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
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">
					Complaint Management Dashboard
				</h2>
				<Link href="/complaints" className="text-sm underline">
					View All Complaints
				</Link>
			</div>
			
			<div className="space-y-4">
				{/* New Category */}
				{renderCategory(
					'new',
					'New',
					'Pending complaints',
					newComplaints,
					'text-blue-700',
					'No new complaints',
					'Open'
				)}

				{/* Overdue Category */}
				{renderCategory(
					'overdue',
					'Overdue',
					'Stalled & Revived complaints',
					overdue,
					'text-red-700',
					'No overdue complaints',
					'Open'
				)}

				{/* Requiring Action Category */}
				{renderCategory(
					'requiringAction',
					'Requiring Action',
					'In Progress complaints',
					requiringAction,
					'text-orange-700',
					'No complaints requiring action',
					'Open'
				)}

				{/* Resolved Category */}
				{renderCategory(
					'resolved',
					'Resolved',
					'Resolved complaints',
					resolved,
					'text-green-700',
					'No resolved complaints',
					'View'
				)}
			</div>
		</div>
	);
}

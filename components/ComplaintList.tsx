'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import type { Complaint } from "@/types";

export default function ComplaintList() {
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

        useEffect(() => {
                loadComplaints();
        }, [filters]);

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
        };

        if (loading) {
                return (
                        <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">Browse Complaints</h2>
                                        <Link href="/report" className="bg-black text-white px-4 py-2 rounded">
                                                Report Issue
                                        </Link>
                                </div>
                                <div className="space-y-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse">
                                                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                                </div>
                                        ))}
                                </div>
                        </div>
                );
        }

        if (error) {
                return (
                        <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">Browse Complaints</h2>
                                        <Link href="/report" className="bg-black text-white px-4 py-2 rounded">
                                                Report Issue
                                        </Link>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <p className="text-red-600">{error}</p>
                                </div>
                        </div>
                );
        }

        return (
                <div className="space-y-4">
                        <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Browse Complaints</h2>
                                <Link href="/report" className="bg-black text-white px-4 py-2 rounded">
                                        Report Issue
                                </Link>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow p-4">
                                <div className="grid md:grid-cols-5 gap-4">
                                        <div>
                                                <label className="block text-sm mb-1">Status</label>
                                                <select
                                                        className="w-full border rounded p-2"
                                                        value={filters.status}
                                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                                >
                                                        <option value="">All</option>
                                                        <option value="pending">Pending</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="resolved">Resolved</option>
                                                        <option value="stalled">Stalled</option>
                                                        <option value="revived">Revived</option>
                                                </select>
                                        </div>
                                        <div>
                                                <label className="block text-sm mb-1">State</label>
                                                <input
                                                        className="w-full border rounded p-2"
                                                        placeholder="e.g., Karnataka"
                                                        value={filters.state}
                                                        onChange={(e) => handleFilterChange('state', e.target.value)}
                                                />
                                        </div>
                                        <div>
                                                <label className="block text-sm mb-1">City</label>
                                                <input
                                                        className="w-full border rounded p-2"
                                                        placeholder="e.g., Bangalore"
                                                        value={filters.city}
                                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                                />
                                        </div>
                                        <div>
                                                <label className="block text-sm mb-1">Category</label>
                                                <input
                                                        className="w-full border rounded p-2"
                                                        placeholder="e.g., pothole"
                                                        value={filters.category}
                                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                                />
                                        </div>
                                        <div className="flex items-end">
                                                <button
                                                        onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                                                        className="bg-gray-500 text-white px-4 py-2 rounded"
                                                >
                                                        Filter
                                                </button>
                                        </div>
                                </div>
                        </div>

                        {/* Results */}
                        <div className="space-y-2">
                                {complaints?.items?.map((complaint) => (
                                        <div key={complaint._id} className="bg-white rounded-xl shadow p-4">
                                                <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-medium">{complaint.category}</span>
                                                                        <span className="text-sm text-gray-500">•</span>
                                                                        <span className="text-sm text-gray-600">{complaint.city}, {complaint.state}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                        #{complaint._id} • {new Date(complaint.created_at).toLocaleDateString()}
                                                                </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                                        complaint.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                                        complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                                        complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                        complaint.status === 'stalled' ? 'bg-red-100 text-red-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                        {complaint.status.replace('_', ' ')}
                                                                </span>
                                                                <Link
                                                                        href={`/complaints/${complaint._id}`}
                                                                        className="text-sm underline"
                                                                >
                                                                        View
                                                                </Link>
                                                        </div>
                                                </div>
                                        </div>
                                ))}

                                {(!complaints?.items || complaints.items.length === 0) && (
                                        <div className="text-center py-8 text-gray-500">
                                                No complaints found matching your criteria.
                                        </div>
                                )}
                        </div>

                        {/* Pagination */}
                        {complaints && complaints.totalPages > 1 && (
                                <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                                Showing {((complaints.page - 1) * complaints.pageSize) + 1} to {Math.min(complaints.page * complaints.pageSize, complaints.total)} of {complaints.total} results
                                        </div>
                                        <div className="flex gap-2">
                                                <button
                                                        onClick={() => handleFilterChange('page', String(complaints.page - 1))}
                                                        disabled={complaints.page <= 1}
                                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                                >
                                                        Previous
                                                </button>
                                                <span className="px-3 py-1">
                                                        Page {complaints.page} of {complaints.totalPages}
                                                </span>
                                                <button
                                                        onClick={() => handleFilterChange('page', String(complaints.page + 1))}
                                                        disabled={complaints.page >= complaints.totalPages}
                                                        className="px-3 py-1 border rounded disabled:opacity-50"
                                                >
                                                        Next
                                                </button>
                                        </div>
                                </div>
                        )}
                </div>
        );
}

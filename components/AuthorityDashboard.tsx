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
                                <div className="grid md:grid-cols-4 gap-6">
                                        {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse">
                                                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                                        <div className="space-y-2">
                                                                {[1, 2, 3].map((j) => (
                                                                        <div key={j} className="h-12 bg-gray-100 rounded"></div>
                                                                ))}
                                                        </div>
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
                        <div className="grid md:grid-cols-4 gap-6">
                                {/* New Category */}
                                <div className="bg-white rounded-xl shadow p-4">
                                        <div className="font-medium text-blue-700 mb-2">
                                                New ({newComplaints?.items?.length || 0})
                                        </div>
                                        <div className="text-xs text-gray-500 mb-3">
                                                Pending complaints
                                        </div>
                                        <ul className="divide-y">
                                                {newComplaints?.items?.map(
                                                        (c) => (
                                                                <li
                                                                        key={
                                                                                c._id
                                                                        }
                                                                        className="py-2 flex items-center justify-between"
                                                                >
                                                                        <div>
                                                                                <div className="font-medium">
                                                                                        {
                                                                                                c.category
                                                                                        }{" "}
                                                                                        —{" "}
                                                                                        {
                                                                                                c.city
                                                                                        }
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                        #
                                                                                        {
                                                                                                c._id
                                                                                        }
                                                                                </div>
                                                                        </div>
                                                                        <Link
                                                                                href={`/complaints/${c._id}`}
                                                                                className="text-sm underline"
                                                                        >
                                                                                Open
                                                                        </Link>
                                                                </li>
                                                        )
                                                )}
                                                {(!newComplaints?.items || newComplaints.items.length === 0) && (
                                                        <li className="py-2 text-gray-500 text-sm">
                                                                No new complaints
                                                        </li>
                                                )}
                                        </ul>
                                </div>

                                {/* Overdue Category */}
                                <div className="bg-white rounded-xl shadow p-4">
                                        <div className="font-medium text-red-700 mb-2">
                                                Overdue ({overdue?.items?.length || 0})
                                        </div>
                                        <div className="text-xs text-gray-500 mb-3">
                                                Stalled & Revived complaints
                                        </div>
                                        <ul className="divide-y">
                                                {overdue?.items?.map(
                                                        (c) => (
                                                                <li
                                                                        key={
                                                                                c._id
                                                                        }
                                                                        className="py-2 flex items-center justify-between"
                                                                >
                                                                        <div>
                                                                                <div className="font-medium">
                                                                                        {
                                                                                                c.category
                                                                                        }{" "}
                                                                                        —{" "}
                                                                                        {
                                                                                                c.city
                                                                                        }
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                        #
                                                                                        {
                                                                                                c._id
                                                                                        }
                                                                                </div>
                                                                        </div>
                                                                        <Link
                                                                                href={`/complaints/${c._id}`}
                                                                                className="text-sm underline"
                                                                        >
                                                                                Open
                                                                        </Link>
                                                                </li>
                                                        )
                                                )}
                                                {(!overdue?.items || overdue.items.length === 0) && (
                                                        <li className="py-2 text-gray-500 text-sm">
                                                                No overdue complaints
                                                        </li>
                                                )}
                                        </ul>
                                </div>

                                {/* Requiring Action Category */}
                                <div className="bg-white rounded-xl shadow p-4">
                                        <div className="font-medium text-orange-700 mb-2">
                                                Requiring Action ({requiringAction?.items?.length || 0})
                                        </div>
                                        <div className="text-xs text-gray-500 mb-3">
                                                In Progress complaints
                                        </div>
                                        <ul className="divide-y">
                                                {requiringAction?.items?.map(
                                                        (c) => (
                                                                <li
                                                                        key={
                                                                                c._id
                                                                        }
                                                                        className="py-2 flex items-center justify-between"
                                                                >
                                                                        <div>
                                                                                <div className="font-medium">
                                                                                        {
                                                                                                c.category
                                                                                        }{" "}
                                                                                        —{" "}
                                                                                        {
                                                                                                c.city
                                                                                        }
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                        #
                                                                                        {
                                                                                                c._id
                                                                                        }
                                                                                </div>
                                                                        </div>
                                                                        <Link
                                                                                href={`/complaints/${c._id}`}
                                                                                className="text-sm underline"
                                                                        >
                                                                                Open
                                                                        </Link>
                                                                </li>
                                                        )
                                                )}
                                                {(!requiringAction?.items || requiringAction.items.length === 0) && (
                                                        <li className="py-2 text-gray-500 text-sm">
                                                                No complaints requiring action
                                                        </li>
                                                )}
                                        </ul>
                                </div>

                                {/* Resolved Category */}
                                <div className="bg-white rounded-xl shadow p-4">
                                        <div className="font-medium text-green-700 mb-2">
                                                Resolved ({resolved?.items?.length || 0})
                                        </div>
                                        <div className="text-xs text-gray-500 mb-3">
                                                Resolved complaints
                                        </div>
                                        <ul className="divide-y">
                                                {resolved?.items?.map(
                                                        (c) => (
                                                                <li
                                                                        key={
                                                                                c._id
                                                                        }
                                                                        className="py-2 flex items-center justify-between"
                                                                >
                                                                        <div>
                                                                                <div className="font-medium">
                                                                                        {
                                                                                                c.category
                                                                                        }{" "}
                                                                                        —{" "}
                                                                                        {
                                                                                                c.city
                                                                                        }
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                        #
                                                                                        {
                                                                                                c._id
                                                                                        }
                                                                                </div>
                                                                        </div>
                                                                        <Link
                                                                                href={`/complaints/${c._id}`}
                                                                                className="text-sm underline"
                                                                        >
                                                                                View
                                                                        </Link>
                                                                </li>
                                                        )
                                                )}
                                                {(!resolved?.items || resolved.items.length === 0) && (
                                                        <li className="py-2 text-gray-500 text-sm">
                                                                No resolved complaints
                                                        </li>
                                                )}
                                        </ul>
                                </div>
                        </div>
                </div>
        );
}

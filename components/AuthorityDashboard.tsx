'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { authorityApi, auth } from "@/lib/api";
import type { Complaint } from "@/types";

export default function AuthorityDashboard() {
        const [stalled, setStalled] = useState<{ items: Complaint[] } | null>(null);
        const [revived, setRevived] = useState<{ items: Complaint[] } | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
                // Check if user is authenticated
                if (!auth.isAuthenticated()) {
                        window.location.href = '/authority/login';
                        return;
                }

                // Load overdue complaints
                Promise.all([
                        authorityApi.getComplaints({ status: 'stalled' }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })),
                        authorityApi.getComplaints({ status: 'revived' }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }))
                ]).then(([stalledData, revivedData]) => {
                        setStalled(stalledData);
                        setRevived(revivedData);
                        setLoading(false);
                }).catch((err) => {
                        setError(err.message || 'Failed to load complaints');
                        setLoading(false);
                });
        }, []);

        if (loading) {
                return (
                        <div className="space-y-6">
                                <h2 className="text-xl font-semibold">Overdue Center</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                        {[1, 2].map((i) => (
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
                                <h2 className="text-xl font-semibold">Overdue Center</h2>
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
                                        Overdue Center
                                </h2>
                                <Link href="/complaints" className="text-sm underline">
                                        View All Complaints
                                </Link>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl shadow p-4">
                                        <div className="font-medium text-red-700 mb-2">
                                                Stalled ({stalled?.items?.length || 0})
                                        </div>
                                        <ul className="divide-y">
                                                {stalled?.items?.map(
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
                                                {(!stalled?.items || stalled.items.length === 0) && (
                                                        <li className="py-2 text-gray-500 text-sm">
                                                                No stalled complaints
                                                        </li>
                                                )}
                                        </ul>
                                </div>
                                <div className="bg-white rounded-xl shadow p-4">
                                        <div className="font-medium text-red-700 mb-2">
                                                Revived ({revived?.items?.length || 0})
                                        </div>
                                        <ul className="divide-y">
                                                {revived?.items?.map(
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
                                                {(!revived?.items || revived.items.length === 0) && (
                                                        <li className="py-2 text-gray-500 text-sm">
                                                                No revived complaints
                                                        </li>
                                                )}
                                        </ul>
                                </div>
                        </div>
                </div>
        );
}

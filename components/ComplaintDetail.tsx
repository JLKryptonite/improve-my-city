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
                        case 'resolved': return 'bg-green-100 text-green-700';
                        case 'in_progress': return 'bg-blue-100 text-blue-700';
                        case 'pending': return 'bg-yellow-100 text-yellow-700';
                        case 'stalled': return 'bg-red-100 text-red-700';
                        case 'revived': return 'bg-orange-100 text-orange-700';
                        default: return 'bg-gray-100 text-gray-700';
                }
        };

        if (loading) {
                return (
                        <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">Complaint Details</h2>
                                        <Link href="/complaints" className="text-sm underline">
                                                Back to List
                                        </Link>
                                </div>
                                <div className="bg-white rounded-xl shadow p-6 animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                                        <div className="space-y-2">
                                                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                                        </div>
                                </div>
                        </div>
                );
        }

        if (error) {
                return (
                        <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">Complaint Details</h2>
                                        <Link href="/complaints" className="text-sm underline">
                                                Back to List
                                        </Link>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <p className="text-red-600">{error}</p>
                                </div>
                        </div>
                );
        }

        if (!complaint) {
                return (
                        <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">Complaint Details</h2>
                                        <Link href="/complaints" className="text-sm underline">
                                                Back to List
                                        </Link>
                                </div>
                                <div className="text-center py-8 text-gray-500">
                                        Complaint not found.
                                </div>
                        </div>
                );
        }

        return (
                <div className="space-y-6">
                        <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Complaint Details</h2>
                                <Link href="/complaints" className="text-sm underline">
                                        Back to List
                                </Link>
                        </div>

                        {/* Complaint Header */}
                        <div className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                                <span className="text-2xl font-bold">#{complaint._id}</span>
                                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(complaint.status)}`}>
                                                        {complaint.status.replace('_', ' ')}
                                                </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                                Created: {new Date(complaint.created_at).toLocaleDateString()}
                                        </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                                <div>
                                                        <h3 className="font-medium mb-2">Category</h3>
                                                        <p className="text-gray-700 capitalize">{complaint.category}</p>
                                                </div>
                                                <div>
                                                        <h3 className="font-medium mb-2">Description</h3>
                                                        <p className="text-gray-700">{complaint.description || 'No description provided'}</p>
                                                </div>
                                                <div>
                                                        <h3 className="font-medium mb-2">Location</h3>
                                                        <p className="text-gray-700">
                                                                {complaint.city}, {complaint.state}
                                                                {complaint.ward && ` • Ward ${complaint.ward}`}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                                Lat: {complaint.location.coordinates[1].toFixed(6)},
                                                                Lng: {complaint.location.coordinates[0].toFixed(6)}
                                                        </p>
                                                </div>
                                        </div>

                                        <div className="space-y-4">
                                                <div>
                                                        <h3 className="font-medium mb-2">Photos</h3>
                                                        {complaint.photos_before && complaint.photos_before.length > 0 ? (
                                                                <div className="grid grid-cols-2 gap-2">
                                                                        {complaint.photos_before.map((photo, index) => (
                                                                                <img
                                                                                        key={index}
                                                                                        src={photo}
                                                                                        alt={`Before ${index + 1}`}
                                                                                        className="w-full h-32 object-cover rounded border"
                                                                                />
                                                                        ))}
                                                                </div>
                                                        ) : (
                                                                <p className="text-gray-500">No photos uploaded</p>
                                                        )}
                                                </div>

                                                {(complaint.photos_progress && complaint.photos_progress.length > 0) && (
                                                        <div>
                                                                <h3 className="font-medium mb-2">Progress Photos</h3>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                        {complaint.photos_progress.map((photo, index) => (
                                                                                <img
                                                                                        key={index}
                                                                                        src={photo}
                                                                                        alt={`Progress ${index + 1}`}
                                                                                        className="w-full h-32 object-cover rounded border"
                                                                                />
                                                                        ))}
                                                                </div>
                                                        </div>
                                                )}
                                        </div>
                                </div>
                        </div>

                        {/* Authority Actions */}
                        {isAuthority && (
                                <div className="bg-white rounded-xl shadow p-6">
                                        <h3 className="font-medium mb-4">Authority Actions</h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {complaint.status === 'pending' && (
                                                        <button
                                                                onClick={() => handleAuthorityAction('start-progress')}
                                                                disabled={actionLoading !== null}
                                                                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                                                        >
                                                                {actionLoading === 'start-progress' ? 'Starting...' : 'Start Progress'}
                                                        </button>
                                                )}

                                                {(complaint.status === 'in_progress' || complaint.status === 'revived') && (
                                                        <button
                                                                onClick={() => handleAuthorityAction('update-progress')}
                                                                disabled={actionLoading !== null}
                                                                className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                                                        >
                                                                {actionLoading === 'update-progress' ? 'Updating...' : 'Update Progress'}
                                                        </button>
                                                )}

                                                {(complaint.status === 'in_progress' || complaint.status === 'revived') && (
                                                        <button
                                                                onClick={() => handleAuthorityAction('hold')}
                                                                disabled={actionLoading !== null}
                                                                className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
                                                        >
                                                                {actionLoading === 'hold' ? 'Holding...' : 'Put On Hold'}
                                                        </button>
                                                )}

                                                {(complaint.status === 'in_progress' || complaint.status === 'revived') && (
                                                        <button
                                                                onClick={() => handleAuthorityAction('resolve')}
                                                                disabled={actionLoading !== null}
                                                                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                                                        >
                                                                {actionLoading === 'resolve' ? 'Resolving...' : 'Mark Resolved'}
                                                        </button>
                                                )}
                                        </div>
                                </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white rounded-xl shadow p-6">
                                <h3 className="font-medium mb-4">Timeline</h3>
                                <div className="space-y-4">
                                        {complaint.timeline.map((event, index) => (
                                                <div key={index} className="flex gap-4">
                                                        <div className="flex-shrink-0">
                                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                                        <span className="text-xs text-gray-500">
                                                                                {event.type === 'submitted' ? '📝' :
                                                                                 event.type === 'progress_started' ? '▶️' :
                                                                                 event.type === 'work_update' ? '🔄' :
                                                                                 event.type === 'work_on_hold' ? '⏸️' :
                                                                                 event.type === 'resolved' ? '✅' :
                                                                                 event.type === 'no_progress_update' ? '📸' :
                                                                                 '📋'}
                                                                        </span>
                                                                </div>
                                                        </div>
                                                        <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-sm font-medium capitalize">
                                                                                {event.type.replace('_', ' ')}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                                {new Date(event.ts).toLocaleString()}
                                                                        </span>
                                                                </div>
                                                                {event.note && (
                                                                        <p className="text-sm text-gray-600 mb-2">{event.note}</p>
                                                                )}
                                                                {event.images && event.images.length > 0 && (
                                                                        <div className="flex gap-2">
                                                                                {event.images.map((img, imgIndex) => (
                                                                                        <img
                                                                                                key={imgIndex}
                                                                                                src={img}
                                                                                                alt={`Timeline ${imgIndex + 1}`}
                                                                                                className="w-16 h-16 object-cover rounded border"
                                                                                        />
                                                                                ))}
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        ))}

                                        {complaint.timeline.length === 0 && (
                                                <p className="text-gray-500 text-center py-4">No timeline events yet</p>
                                        )}
                                </div>
                        </div>
                </div>
        );
}

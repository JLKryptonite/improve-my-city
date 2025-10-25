'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";

// Helper: SHA-256 to prevent uploading the exact same photo twice
async function sha256hex(file: File) {
        const buf = await file.arrayBuffer();
        const hash = await crypto.subtle.digest("SHA-256", buf);
        const bytes = new Uint8Array(hash);
        return Array.from(bytes)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
}

export default function ReportIssue() {
        const [category, setCategory] = useState("pothole");
        const [desc, setDesc] = useState("");
        const [lat, setLat] = useState<number | "">("");
        const [lng, setLng] = useState<number | "">("");
        const [acc, setAcc] = useState<number>(50);
        const [useManualLoc, setUseManualLoc] = useState(false);

        const [files, setFiles] = useState<File[]>([]);
        const [hashes, setHashes] = useState<string[]>([]);
        const [busy, setBusy] = useState(false);
        const [message, setMessage] = useState<string>("");
        const [suggested, setSuggested] = useState<any[]>([]);

        const fileInputRef = useRef<HTMLInputElement>(null);
        const router = useRouter();

        // Try to auto-detect location once
        useEffect(() => {
                if (useManualLoc) return;
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(
                        (p) => {
                                setLat(Number(p.coords.latitude.toFixed(6)));
                                setLng(Number(p.coords.longitude.toFixed(6)));
                                setAcc(Math.round(p.coords.accuracy || 50));
                        },
                        () => {
                                /* ignore */
                        }
                );
        }, [useManualLoc]);

        async function onFilesSelected(list: FileList | null) {
                if (!list) return;
                const next: File[] = [...files];
                const nextHashes = new Set(hashes);
                for (const f of Array.from(list)) {
                        if (!/^image\/(jpeg|png)$/.test(f.type)) {
                                setMessage("Only JPEG/PNG images are allowed.");
                                continue;
                        }
                        const h = await sha256hex(f);
                        if (nextHashes.has(h)) {
                                setMessage(
                                        "One of the selected photos matches an existing one. Please add a different angle."
                                );
                                continue;
                        }
                        next.push(f);
                        nextHashes.add(h);
                }
                setFiles(next);
                setHashes(Array.from(nextHashes));
        }

        function removeFile(i: number) {
                const next = files.slice();
                next.splice(i, 1);
                setFiles(next);
                // Rebuild hashes for safety
                Promise.all(next.map(sha256hex)).then((h) => setHashes(h));
        }

        async function submit(e: React.FormEvent) {
                e.preventDefault();
                setMessage("");
                setSuggested([]);

                if (files.length < 1) {
                        setMessage("Please add at least one photo.");
                        return;
                }
                if (lat === "" || lng === "") {
                        setMessage(
                                "Please provide a location (auto or manual)."
                        );
                        return;
                }

                const fd = new FormData();
                fd.append("category", category);
                if (desc) fd.append("description", desc);
                fd.append("latitude", String(lat));
                fd.append("longitude", String(lng));
                fd.append(
                        "accuracyM",
                        String(
                                Math.max(
                                        5,
                                        Math.min(200, Math.round(acc || 50))
                                )
                        )
                );
                files.forEach((f) => fd.append("images", f));

                setBusy(true);
                try {
                        const r = await publicApi.createComplaint(fd);
                        if (r.status === "duplicate_suspected") {
                                setSuggested(r.suggested || []);
                                setMessage(
                                        r.message ||
                                                "A similar complaint exists nearby."
                                );
                        } else if (r.status === "created") {
                                setMessage(
                                        `Complaint created: ${r.complaint_id}`
                                );
                                setFiles([]);
                                setHashes([]);
                                setDesc("");
                                // Navigate to complaint detail when ready
                                // router.push(`/complaints/${r.complaint_id}`);
                        } else {
                                setMessage("Unexpected response from server.");
                        }
                } catch (err: any) {
                        setMessage(
                                err?.response?.data?.error ||
                                        "Submission failed"
                        );
                } finally {
                        setBusy(false);
                }
        }

        async function appendToExisting(id: string) {
                if (files.length < 1) {
                        setMessage("Please add at least one photo to append.");
                        return;
                }
                const fd = new FormData();
                files.forEach((f) => fd.append("images", f));
                setBusy(true);
                try {
                        const r = await publicApi.appendNoProgress(id, fd);
                        setMessage(`Update added to ${r.complaint_id}`);
                        setSuggested([]);
                        setFiles([]);
                        setHashes([]);
                } catch (err: any) {
                        setMessage(
                                err?.response?.data?.error || "Failed to append"
                        );
                } finally {
                        setBusy(false);
                }
        }

        return (
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-4 space-y-4">
                        <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                        Report an Issue
                                </h2>
                                <Link href="/" className="text-sm underline">
                                        Back to Home
                                </Link>
                        </div>

                        <form className="space-y-4" onSubmit={submit}>
                                {/* Category */}
                                <div>
                                        <label className="block text-sm mb-1">
                                                Category
                                        </label>
                                        <select
                                                className="w-full border rounded p-2"
                                                value={category}
                                                onChange={(e) =>
                                                        setCategory(
                                                                e.target.value
                                                        )
                                                }
                                        >
                                                <option value="pothole">
                                                        Pothole
                                                </option>
                                                <option value="streetlight">
                                                        Streetlight
                                                </option>
                                                <option value="garbage">
                                                        Garbage Overflow
                                                </option>
                                                <option value="water">
                                                        Water Leakage
                                                </option>
                                                <option value="tree">
                                                        Fallen Tree / Debris
                                                </option>
                                        </select>
                                </div>

                                {/* Description */}
                                <div>
                                        <label className="block text-sm mb-1">
                                                Description (optional)
                                        </label>
                                        <textarea
                                                className="w-full border rounded p-2"
                                                rows={3}
                                                value={desc}
                                                onChange={(e) =>
                                                        setDesc(e.target.value)
                                                }
                                                placeholder="Add any helpful details (e.g., lane name, landmarks)"
                                        />
                                </div>

                                {/* Photos */}
                                <div>
                                        <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium">
                                                        Photos{" "}
                                                        <span className="text-red-600">
                                                                *
                                                        </span>
                                                </label>
                                                <span className="text-xs text-amber-600">
                                                        Adding a few clear
                                                        photos from different
                                                        angles helps authorities
                                                        judge severity faster
                                                        and dispatch the right
                                                        team on the first go.
                                                </span>
                                        </div>
                                        <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                multiple
                                                onChange={(e) =>
                                                        onFilesSelected(
                                                                e.target.files
                                                        )
                                                }
                                                className="block w-full border rounded p-2 mt-1"
                                        />
                                        {files.length > 0 && (
                                                <div className="flex gap-2 mt-2 flex-wrap">
                                                        {files.map((f, i) => (
                                                                <span
                                                                        key={i}
                                                                        className="text-xs bg-gray-100 rounded px-2 py-1 flex items-center gap-2"
                                                                >
                                                                        {f.name}
                                                                        <button
                                                                                type="button"
                                                                                className="text-red-600"
                                                                                onClick={() =>
                                                                                        removeFile(
                                                                                                i
                                                                                        )
                                                                                }
                                                                        >
                                                                                ×
                                                                        </button>
                                                                </span>
                                                        ))}
                                                </div>
                                        )}
                                </div>

                                {/* Location */}
                                <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                                <label className="block text-sm font-medium">
                                                        Location
                                                </label>
                                                <label className="text-xs flex items-center gap-2">
                                                        <input
                                                                type="checkbox"
                                                                checked={
                                                                        useManualLoc
                                                                }
                                                                onChange={(e) =>
                                                                        setUseManualLoc(
                                                                                e
                                                                                        .target
                                                                                        .checked
                                                                        )
                                                                }
                                                        />
                                                        Enter manually
                                                </label>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-2">
                                                <div>
                                                        <label className="block text-xs">
                                                                Latitude
                                                        </label>
                                                        <input
                                                                className="w-full border rounded p-2"
                                                                value={lat}
                                                                onChange={(e) =>
                                                                        setLat(
                                                                                e
                                                                                        .target
                                                                                        .value ===
                                                                                        ""
                                                                                        ? ""
                                                                                        : Number(
                                                                                                  e
                                                                                                          .target
                                                                                                          .value
                                                                                          )
                                                                        )
                                                                }
                                                                placeholder="e.g., 28.6139"
                                                        />
                                                </div>
                                                <div>
                                                        <label className="block text-xs">
                                                                Longitude
                                                        </label>
                                                        <input
                                                                className="w-full border rounded p-2"
                                                                value={lng}
                                                                onChange={(e) =>
                                                                        setLng(
                                                                                e
                                                                                        .target
                                                                                        .value ===
                                                                                        ""
                                                                                        ? ""
                                                                                        : Number(
                                                                                                  e
                                                                                                          .target
                                                                                                          .value
                                                                                          )
                                                                        )
                                                                }
                                                                placeholder="e.g., 77.2090"
                                                        />
                                                </div>
                                                <div>
                                                        <label className="block text-xs">
                                                                Accuracy (m)
                                                        </label>
                                                        <input
                                                                className="w-full border rounded p-2"
                                                                value={acc}
                                                                onChange={(e) =>
                                                                        setAcc(
                                                                                parseInt(
                                                                                        e
                                                                                                .target
                                                                                                .value
                                                                                ) ||
                                                                                        50
                                                                        )
                                                                }
                                                        />
                                                </div>
                                        </div>
                                        <div className="h-40 bg-gray-100 rounded grid place-items-center text-xs text-gray-600">
                                                [ Map preview placeholder ]
                                        </div>
                                </div>

                                <button
                                        className="bg-black text-white rounded p-2 disabled:opacity-60"
                                        disabled={busy}
                                >
                                        {busy ? "Submitting…" : "Submit"}
                                </button>
                        </form>

                        {message && (
                                <div className="text-sm mt-2 p-3 rounded bg-gray-50 border">
                                        {message}
                                </div>
                        )}

                        {suggested.length > 0 && (
                                <div className="mt-4 border rounded p-3 bg-amber-50">
                                        <div className="font-medium mb-2">
                                                We found similar complaints
                                                nearby:
                                        </div>
                                        <ul className="list-disc ml-5 text-sm space-y-1">
                                                {suggested.map((s: any) => (
                                                        <li
                                                                key={s.id}
                                                                className="flex items-center justify-between gap-2"
                                                        >
                                                                <span>
                                                                        #{s.id}{" "}
                                                                        —{" "}
                                                                        {s.city ||
                                                                                "Unknown"}
                                                                        ,{" "}
                                                                        {s.state ||
                                                                                "Unknown"}{" "}
                                                                        —{" "}
                                                                        {
                                                                                s.status
                                                                        }
                                                                </span>
                                                                <button
                                                                        onClick={() =>
                                                                                appendToExisting(
                                                                                        s.id
                                                                                )
                                                                        }
                                                                        className="text-blue-700 underline"
                                                                >
                                                                        Confirm
                                                                        & Add my
                                                                        photos
                                                                </button>
                                                        </li>
                                                ))}
                                        </ul>
                                </div>
                        )}
                </div>
        );
}

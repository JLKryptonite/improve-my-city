'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapPreview'), { 
        ssr: false,
        loading: () => <div className="h-40 bg-gray-100 rounded grid place-items-center text-xs text-gray-600">Loading map...</div>
});

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
		<div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
				<div>
					<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
						Report an Issue
					</h2>
					<p className="text-xs sm:text-sm text-gray-500 mt-1">
						Help improve your city by reporting problems
					</p>
				</div>
				<Link 
					href="/" 
					className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors whitespace-nowrap"
				>
					← Back to Home
				</Link>
			</div>

			<form className="space-y-4 sm:space-y-6" onSubmit={submit}>
				{/* Category */}
				<div>
					<label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
						Category <span className="text-red-500">*</span>
					</label>
					<select
						className="w-full border-2 border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white text-gray-900 cursor-pointer hover:border-gray-300"
						value={category}
						onChange={(e) =>
							setCategory(
								e.target.value
							)
						}
					>
                                                <option value="pothole">
                                                        🕳️ Pothole
                                                </option>
                                                <option value="streetlight">
                                                        💡 Streetlight
                                                </option>
                                                <option value="garbage">
                                                        🗑️ Garbage Overflow
                                                </option>
                                                <option value="water">
                                                        💧 Water Leakage
                                                </option>
                                                <option value="tree">
                                                        🌳 Fallen Tree / Debris
                                                </option>
                                        </select>
                                </div>

				{/* Description */}
				<div>
					<label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
						Description <span className="text-gray-400 font-normal">(optional)</span>
					</label>
					<textarea
						className="w-full border-2 border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none hover:border-gray-300"
						rows={4}
						value={desc}
						onChange={(e) =>
							setDesc(e.target.value)
						}
						placeholder="Add any helpful details (e.g., lane name, landmarks, severity)..."
					/>
				</div>

				{/* Photos */}
				<div>
					<label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
						Photos <span className="text-gray-400 font-normal">(optional)</span>
					</label>
					<div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg p-3 sm:p-4 hover:border-blue-400 transition-colors">
						<div className="flex items-start gap-2 sm:gap-3">
							<div className="flex-shrink-0 text-xl sm:text-2xl">
								📸
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs text-blue-800 font-medium mb-2">
									💡 Pro tip: Adding clear photos from different angles helps authorities assess severity faster!
								</p>
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
									className="block w-full text-xs sm:text-sm text-gray-600 file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer file:transition-colors"
								/>
							</div>
						</div>
					</div>
                                        {files.length > 0 && (
                                                <div className="flex gap-2 mt-3 flex-wrap">
                                                        {files.map((f, i) => (
                                                                <span
                                                                        key={i}
                                                                        className="text-xs bg-green-100 border border-green-300 text-green-800 rounded-lg px-3 py-2 flex items-center gap-2 font-medium shadow-sm"
                                                                >
                                                                        <span className="text-base">✓</span>
                                                                        {f.name}
                                                                        <button
                                                                                type="button"
                                                                                className="text-red-600 hover:text-red-800 font-bold ml-1 hover:scale-110 transition-transform"
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
				<div className="space-y-2 sm:space-y-3">
					<div className="flex items-center justify-between">
						<label className="block text-xs sm:text-sm font-semibold text-gray-700">
							📍 Location <span className="text-red-500">*</span>
						</label>
						<label className="text-xs flex items-center gap-2 bg-gray-100 px-2 sm:px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
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
								className="rounded"
							/>
							<span className="font-medium text-gray-700 text-xs">Enter manually</span>
						</label>
					</div>
					<div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
						<div>
							<label className="block text-xs font-medium text-gray-600 mb-1.5">
								Latitude
							</label>
							<input
								className="w-full border-2 border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none hover:border-gray-300"
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
							<label className="block text-xs font-medium text-gray-600 mb-1.5">
								Longitude
							</label>
							<input
								className="w-full border-2 border-gray-200 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none hover:border-gray-300"
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
					</div>
                                        <div className="h-48 rounded-xl overflow-hidden shadow-md border-2 border-gray-200">
                                                <MapComponent 
                                                        latitude={lat} 
                                                        longitude={lng} 
                                                />
                                        </div>
                                </div>

				<button
					className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl p-3 sm:p-4 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
					disabled={busy}
				>
					{busy ? (
						<span className="flex items-center justify-center gap-2">
							<svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Submitting…
						</span>
					) : (
						"🚀 Submit Report"
					)}
				</button>
                        </form>

                        {message && (
                                <div className={`text-sm p-4 rounded-lg border-l-4 ${
                                        message.includes("created") 
                                                ? "bg-green-50 border-green-500 text-green-800" 
                                                : message.includes("similar") 
                                                ? "bg-amber-50 border-amber-500 text-amber-800"
                                                : "bg-red-50 border-red-500 text-red-800"
                                }`}>
                                        <div className="flex items-start gap-2">
                                                <span className="text-lg">
                                                        {message.includes("created") 
                                                                ? "✅" 
                                                                : message.includes("similar")
                                                                ? "⚠️"
                                                                : "❌"}
                                                </span>
                                                <div className="flex-1">
                                                        {message}
                                                </div>
                                        </div>
                                </div>
                        )}

                        {suggested.length > 0 && (
                                <div className="border-2 border-amber-300 rounded-xl p-5 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md">
                                        <div className="flex items-center gap-2 mb-4">
                                                <span className="text-2xl">🔍</span>
                                                <div>
                                                        <h3 className="font-bold text-amber-900">
                                                                Similar Complaints Found Nearby
                                                        </h3>
                                                        <p className="text-xs text-amber-700">
                                                                Consider adding your photos to an existing complaint instead
                                                        </p>
                                                </div>
                                        </div>
                                        <div className="space-y-2">
                                                {suggested.map((s: any) => (
                                                        <div
                                                                key={s.id}
                                                                className="bg-white rounded-lg p-3 border border-amber-200 flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
                                                        >
                                                                <div className="flex-1">
                                                                        <div className="font-semibold text-gray-900">
                                                                                Complaint #{s.id}
                                                                        </div>
                                                                        <div className="text-xs text-gray-600 mt-1">
                                                                                📍 {s.city || "Unknown"}, {s.state || "Unknown"}
                                                                                {" • "}
                                                                                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                                                        {s.status}
                                                                                </span>
                                                                        </div>
                                                                </div>
                                                                <button
                                                                        onClick={() =>
                                                                                appendToExisting(
                                                                                        s.id
                                                                                )
                                                                        }
                                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                                                                >
                                                                        Add Photos
                                                                </button>
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        )}
                </div>
        );
}

import Link from "next/link";
import type { MetricsData } from "@/types";

interface StatsBarProps {
	metrics: MetricsData | null;
	loading?: boolean;
}

export default function StatsBar({ metrics, loading }: StatsBarProps) {
	if (loading || !metrics) {
		return (
			<div className="flex justify-center px-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-48 status-box rounded-2xl shadow-xl animate-shimmer"
						/>
					))}
				</div>
			</div>
		);
	}

	const stats = [
		{
			title: "Resolved",
			count: metrics.resolved,
			href: "/complaints?status=resolved",
			icon: (
				<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			gradient: "from-green-500 to-emerald-600",
			bgHover: "hover:bg-green-50",
			borderColor: "border-green-500",
			textColor: "text-green-700",
			iconColor: "text-green-600",
		},
		{
			title: "In Progress",
			count: metrics.active,
			href: "/complaints?status=pending,in_progress",
			icon: (
				<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			gradient: "from-amber-500 to-orange-600",
			bgHover: "hover:bg-amber-50",
			borderColor: "border-amber-500",
			textColor: "text-amber-700",
			iconColor: "text-amber-600",
		},
		{
			title: "Delayed",
			count: metrics.overdue,
			href: "/complaints?status=stalled,revived",
			icon: (
				<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
			),
			gradient: "from-red-500 to-rose-600",
			bgHover: "hover:bg-red-50",
			borderColor: "border-red-500",
			textColor: "text-red-700",
			iconColor: "text-red-600",
		},
	];

	return (
		<div className="flex justify-center px-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl">
				{stats.map((stat, index) => (
					<Link
						key={stat.title}
						href={stat.href}
						className="block group animate-fadeIn"
						style={{ animationDelay: `${index * 100}ms` }}
					>
						<div className={`relative h-32 sm:h-36 rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col items-center justify-center status-box ${stat.bgHover} hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}>
							{/* Gradient background */}
							<div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-300`}></div>

							{/* Title */}
							<div className={`text-base sm:text-lg font-bold text-center mb-2 z-10`} style={{
								color: stat.textColor.includes('green') ? '#15803d' :
									   stat.textColor.includes('amber') ? '#d97706' : '#dc2626',
								textShadow: '0 2px 4px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)'
							}}>
								{stat.title}
							</div>

							{/* Count */}
							<div className={`text-2xl sm:text-3xl font-bold group-hover:scale-110 transition-transform duration-300 z-10`} style={{
								color: stat.textColor.includes('green') ? '#15803d' :
									   stat.textColor.includes('amber') ? '#d97706' : '#dc2626',
								textShadow: '0 2px 4px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)'
							}}>
								{stat.count}
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

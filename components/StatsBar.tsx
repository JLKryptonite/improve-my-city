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
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl animate-shimmer"
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
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
				{stats.map((stat, index) => (
					<Link 
						key={stat.title}
						href={stat.href} 
						className="block group animate-fadeIn"
						style={{ animationDelay: `${index * 100}ms` }}
					>
						<div className={`relative h-48 bg-white/98 backdrop-blur-sm rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center border-l-4 ${stat.borderColor} ${stat.bgHover} hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden`}>
							{/* Gradient background on hover */}
							<div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
							
							{/* Icon */}
							<div className={`${stat.iconColor} mb-3 group-hover:scale-110 transition-transform duration-300`}>
								{stat.icon}
							</div>
							
							{/* Title */}
							<div className="text-base text-gray-600 font-semibold text-center mb-2 group-hover:text-gray-900 transition-colors">
								{stat.title}
							</div>
							
							{/* Count */}
							<div className={`text-4xl font-bold ${stat.textColor} group-hover:scale-110 transition-transform duration-300`}>
								{stat.count}
							</div>
							
							{/* Label */}
							<div className="text-sm text-gray-500 mt-1">
								Reports
							</div>

							{/* Hover indicator */}
							<div className="absolute bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

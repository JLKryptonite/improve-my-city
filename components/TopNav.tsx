import Link from 'next/link';

export default function TopNav() {
	return (
		<header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
			<div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
				<Link href="/" className="flex items-center gap-3 group">
					<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
						<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
					</div>
					<div className="flex flex-col">
						<span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
							Improve My City
						</span>
						<span className="text-xs text-gray-500 -mt-1">
							Civic Complaint Portal
						</span>
					</div>
				</Link>
				<nav className="flex items-center gap-2">
					<Link
						href="/complaints"
						className="text-sm font-medium text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
					>
						Browse Issues
					</Link>
					<Link
						href="/report"
						className="text-sm font-medium text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Report Issue
					</Link>
					<Link
						href="/authority/login"
						className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
					>
						Authority Login
					</Link>
				</nav>
			</div>
		</header>
	);
}

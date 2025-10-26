'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TopNav() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 bg-transparent">
			<div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
				<Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
					<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105" style={{
						background: 'rgba(255, 255, 255, 0.15)',
						backdropFilter: 'blur(8px)',
						WebkitBackdropFilter: 'blur(8px)',
						border: '1px solid rgba(255, 255, 255, 0.3)',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
					}}>
						<svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
							filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
							textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.6)'
						}}>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
					</div>
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-3">
					<Link
						href="/complaints"
						className="text-sm font-medium text-white px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
						style={{
							background: 'rgba(255, 255, 255, 0.15)',
							backdropFilter: 'blur(8px)',
							WebkitBackdropFilter: 'blur(8px)',
							border: '1px solid rgba(255, 255, 255, 0.3)',
							textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.6)',
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
							e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.5)';
							e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
							e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)';
							e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
						}}
					>
						Browse Issues
					</Link>
					<Link
						href="/report"
						className="text-sm font-medium text-white px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
						style={{
							background: 'rgba(255, 255, 255, 0.15)',
							backdropFilter: 'blur(8px)',
							WebkitBackdropFilter: 'blur(8px)',
							border: '1px solid rgba(255, 255, 255, 0.3)',
							textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.6)',
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
							e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.5)';
							e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
							e.currentTarget.style.border = 'rgba(255, 255, 255, 0.3)';
							e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
						}}
					>
						Report Issue
					</Link>
					<Link
						href="/authority/login"
						className="text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
					>
						Authority Login
					</Link>
				</nav>

			{/* Mobile Menu Button */}
			<button
				onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
				className="md:hidden p-2 rounded-lg transition-all shadow-lg hover:scale-105"
				style={{
					background: 'rgba(255, 255, 255, 0.15)',
					backdropFilter: 'blur(8px)',
					WebkitBackdropFilter: 'blur(8px)',
					border: '1px solid rgba(255, 255, 255, 0.3)',
					color: 'white',
					textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.6)',
					boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
					e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.5)';
					e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
					e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)';
					e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
				}}
				aria-label="Toggle menu"
			>
				{mobileMenuOpen ? (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'white'}}>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				) : (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'white'}}>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				)}
			</button>
		</div>

		{/* Mobile Navigation Menu */}
		{mobileMenuOpen && (
			<div className="md:hidden shadow-xl" style={{
				background: 'rgba(255, 255, 255, 0.95)',
				backdropFilter: 'blur(10px)',
				WebkitBackdropFilter: 'blur(10px)',
				border: '1px solid rgba(255, 255, 255, 0.8)',
				borderTop: 'none'
			}}>
				<nav className="flex flex-col p-4 space-y-2">
					<Link
						href="/complaints"
						onClick={() => setMobileMenuOpen(false)}
						className="text-base font-medium px-4 py-3 rounded-xl transition-all duration-200 text-center hover:scale-105"
						style={{
							color: '#374151',
							textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
							e.currentTarget.style.color = '#2563eb';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'transparent';
							e.currentTarget.style.color = '#374151';
						}}
					>
						Browse Issues
					</Link>
					<Link
						href="/report"
						onClick={() => setMobileMenuOpen(false)}
						className="text-base font-medium px-4 py-3 rounded-xl transition-all duration-200 text-center hover:scale-105"
						style={{
							color: '#374151',
							textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
							e.currentTarget.style.color = '#2563eb';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'transparent';
							e.currentTarget.style.color = '#374151';
						}}
					>
						Report Issue
					</Link>
					<Link
						href="/authority/login"
						onClick={() => setMobileMenuOpen(false)}
						className="text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center hover:scale-105"
					>
						Authority Login
					</Link>
				</nav>
			</div>
		)}
		</header>
	);
}

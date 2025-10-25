import Link from 'next/link';

export default function TopNav() {
        return (
                <header className="border-b bg-white">
                        <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
                                <Link href="/" className="font-semibold">
                                        Improve My City
                                </Link>
                                <nav className="flex items-center gap-4">
                                        <Link
                                                href="/complaints"
                                                className="text-sm"
                                        >
                                                Browse
                                        </Link>
                                        <Link
                                                href="/authority/login"
                                                className="text-sm font-medium border px-3 py-1.5 rounded-md"
                                        >
                                                Authority Login
                                        </Link>
                                </nav>
                        </div>
                </header>
        );
}

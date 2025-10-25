'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authorityApi, auth } from "@/lib/api";

export default function AuthorityLogin() {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [error, setError] = useState("");
        const [loading, setLoading] = useState(false);
        const router = useRouter();

        const submit = async (e: React.FormEvent) => {
                e.preventDefault();
                setError("");
                setLoading(true);

                try {
                        const response = await authorityApi.login(email, password);
                        auth.setToken(response.token);
                        router.push("/authority");
                } catch (e: any) {
                        setError(e?.response?.data?.error || "Login failed");
                } finally {
                        setLoading(false);
                }
        };

        return (
                <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow">
                        <h2 className="text-2xl font-semibold mb-6 text-center">
                                Authority Login
                        </h2>
                        <form className="space-y-4" onSubmit={submit}>
                                <input
                                        className="w-full border rounded-lg p-3 text-base"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) =>
                                                setEmail(e.target.value)
                                        }
                                        required
                                />
                                <input
                                        className="w-full border rounded-lg p-3 text-base"
                                        placeholder="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                                setPassword(e.target.value)
                                        }
                                        required
                                />
                                {error && (
                                        <div className="text-red-600 text-sm">
                                                {error}
                                        </div>
                                )}
                                <button
                                        className="w-full bg-black text-white rounded-lg p-3 text-base font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
                                        disabled={loading}
                                >
                                        {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                        </form>
                </div>
        );
}

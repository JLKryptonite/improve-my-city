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
                <div className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow">
                        <h2 className="text-xl font-semibold mb-4">
                                Authority Login
                        </h2>
                        <form className="space-y-3" onSubmit={submit}>
                                <input
                                        className="w-full border rounded p-2"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) =>
                                                setEmail(e.target.value)
                                        }
                                        required
                                />
                                <input
                                        className="w-full border rounded p-2"
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
                                        className="w-full bg-black text-white rounded p-2 disabled:opacity-50"
                                        disabled={loading}
                                >
                                        {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                        </form>
                </div>
        );
}

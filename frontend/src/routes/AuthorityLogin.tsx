import { useState } from "react";
import { api } from "../lib/api";
import { saveToken } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function AuthorityLogin() {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [error, setError] = useState("");
        const nav = useNavigate();

        const submit = async (e: React.FormEvent) => {
                e.preventDefault();
                setError("");
                try {
                        const r = await api.post("/authority/login", {
                                email,
                                password,
                        });
                        saveToken(r.data.token);
                        nav("/authority");
                } catch (e: any) {
                        setError(e?.response?.data?.error || "Login failed");
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
                                />
                                <input
                                        className="w-full border rounded p-2"
                                        placeholder="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                                setPassword(e.target.value)
                                        }
                                />
                                {error && (
                                        <div className="text-red-600 text-sm">
                                                {error}
                                        </div>
                                )}
                                <button className="w-full bg-black text-white rounded p-2">
                                        Sign in
                                </button>
                        </form>
                </div>
        );
}

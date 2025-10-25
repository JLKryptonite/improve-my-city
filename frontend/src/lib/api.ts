import axios from "axios";

// Prefer an env var set in Netlify. Fall back to relative "/api" so you can use a Netlify proxy.
const base = import.meta.env.VITE_API_BASE || "/api";

export const api = axios.create({ baseURL: base });

// If you also use an auth instance:
export const apiAuth = axios.create({ baseURL: base });
apiAuth.interceptors.request.use((cfg) => {
        const t = localStorage.getItem("imc_token");
        if (t) cfg.headers.Authorization = `Bearer ${t}`;
        return cfg;
});

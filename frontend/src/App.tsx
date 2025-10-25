import { Outlet } from "react-router-dom";
import TopNav from "./components/TopNav";

export default function App() {
        return (
                <div className="min-h-screen bg-gray-50 text-gray-900">
                        <TopNav />
                        <main className="max-w-6xl mx-auto p-4">
                                <Outlet />
                        </main>
                </div>
        );
}

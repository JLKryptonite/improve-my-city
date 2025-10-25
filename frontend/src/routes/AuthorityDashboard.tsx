import { useEffect, useState } from "react";
import { apiAuth } from "../lib/api";
import { Link } from "react-router-dom";

export default function AuthorityDashboard() {
        const [stalled, setStalled] = useState<any>(null);
        const [revived, setRevived] = useState<any>(null);

        useEffect(() => {
                apiAuth.get("/authority/complaints?status=stalled").then((r) =>
                        setStalled(r.data)
                );
                apiAuth.get("/authority/complaints?status=revived").then((r) =>
                        setRevived(r.data)
                );
        }, []);

        return (
                <div className="space-y-6">
                        <h2 className="text-xl font-semibold">
                                Overdue Center
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl shadow p-4">
                                        <div className="font-medium text-red-700 mb-2">
                                                Stalled
                                        </div>
                                        <ul className="divide-y">
                                                {stalled?.items?.map(
                                                        (c: any) => (
                                                                <li
                                                                        key={
                                                                                c._id
                                                                        }
                                                                        className="py-2 flex items-center justify-between"
                                                                >
                                                                        <div>
                                                                                <div className="font-medium">
                                                                                        {
                                                                                                c.category
                                                                                        }{" "}
                                                                                        —{" "}
                                                                                        {
                                                                                                c.city
                                                                                        }
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                        #
                                                                                        {
                                                                                                c._id
                                                                                        }
                                                                                </div>
                                                                        </div>
                                                                        <Link
                                                                                to={`/complaints/${c._id}`}
                                                                                className="text-sm underline"
                                                                        >
                                                                                Open
                                                                        </Link>
                                                                </li>
                                                        )
                                                )}
                                        </ul>
                                </div>
                                <div className="bg-white rounded-xl shadow p-4">
                                        <div className="font-medium text-red-700 mb-2">
                                                Revived
                                        </div>
                                        <ul className="divide-y">
                                                {revived?.items?.map(
                                                        (c: any) => (
                                                                <li
                                                                        key={
                                                                                c._id
                                                                        }
                                                                        className="py-2 flex items-center justify-between"
                                                                >
                                                                        <div>
                                                                                <div className="font-medium">
                                                                                        {
                                                                                                c.category
                                                                                        }{" "}
                                                                                        —{" "}
                                                                                        {
                                                                                                c.city
                                                                                        }
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">
                                                                                        #
                                                                                        {
                                                                                                c._id
                                                                                        }
                                                                                </div>
                                                                        </div>
                                                                        <Link
                                                                                to={`/complaints/${c._id}`}
                                                                                className="text-sm underline"
                                                                        >
                                                                                Open
                                                                        </Link>
                                                                </li>
                                                        )
                                                )}
                                        </ul>
                                </div>
                        </div>
                </div>
        );
}

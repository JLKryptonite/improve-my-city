import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Landing from "./routes/Landing";
import AuthorityLogin from "./routes/AuthorityLogin";
import AuthorityDashboard from "./routes/AuthorityDashboard";
import ComplaintList from "./routes/ComplaintList";
import ComplaintDetail from "./routes/ComplaintDetail";
import "./styles/index.css";

const router = createBrowserRouter([
        {
                path: "/",
                element: <App />,
                children: [
                        { index: true, element: <Landing /> },
                        {
                                path: "authority/login",
                                element: <AuthorityLogin />,
                        },
                        { path: "authority", element: <AuthorityDashboard /> },
                        { path: "complaints", element: <ComplaintList /> },
                        {
                                path: "complaints/:id",
                                element: <ComplaintDetail />,
                        },
                ],
        },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
                <RouterProvider router={router} />
        </React.StrictMode>
);

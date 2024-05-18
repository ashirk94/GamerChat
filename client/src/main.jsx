import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider
} from "react-router-dom";
import App from "./components/App.jsx";
import "./css/main.css";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

// Using React Router to route to our pages
const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<App />} errorElement={<ErrorPage />}>
			<Route index={true} path="/" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/chat" element={<ChatPage />} />
			<Route path="/profile" element={<ProfilePage />} />
		</Route>
	)
);

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);

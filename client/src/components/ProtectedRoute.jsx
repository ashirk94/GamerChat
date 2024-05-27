import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// protects routes on frontend
const ProtectedRoute = ({ children }) => {
	const { userInfo } = useSelector((state) => state.auth);

	if (!userInfo) {
		return <Navigate to="/login" />;
	}
	return children;
};

export default ProtectedRoute;

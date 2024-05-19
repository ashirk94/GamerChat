import React from "react";
import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
	const error = useRouteError();
	console.error(error);

	return (
		<div className="error-state">
			<h1>Oops! Something went wrong.</h1>
			<p>{error.statusText || error.message}</p>
		</div>
	);
};

export default ErrorPage;

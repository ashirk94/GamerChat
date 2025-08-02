export default {
	setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
	testEnvironment: "jest-environment-jsdom",
	transform: {
		"^.+\\.(js|jsx)$": "babel-jest"
	},
	moduleNameMapper: {
		"\\.(css|less|scss|sass)$": "identity-obj-proxy"
	}
};

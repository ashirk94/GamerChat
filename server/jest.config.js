export default {
	testEnvironment: "node",
	setupFiles: ["dotenv/config"],
	transform: {
		"^.+\\.jsx?$": "babel-jest"
	},
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1"
	}
};

module.exports = {
	projects: [
		{
			displayName: 'client',
			testMatch: ['<rootDir>/client/src/**/*.test.{js,jsx}'],
			setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.js'],
			testEnvironment: 'jest-environment-jsdom',
			transform: {
				'^.+\\.(js|jsx)$': 'babel-jest'
			},
			moduleNameMapper: {
				'\\.(css|less|scss|sass)$': 'identity-obj-proxy'
			},
			rootDir: '.',
			modulePaths: ['<rootDir>/client/src'],
			collectCoverageFrom: [
				'client/src/**/*.{js,jsx}',
				'!client/src/main.jsx',
				'!client/src/**/*.test.{js,jsx}',
				'!client/src/tests/**/*'
			]
		},
		{
			displayName: 'server',
			testMatch: ['<rootDir>/server/**/*.test.{js,jsx}'],
			testEnvironment: 'node',
			setupFiles: ['dotenv/config'],
			transform: {
				'^.+\\.jsx?$': 'babel-jest'
			},
			moduleNameMapper: {
				'^(\\.{1,2}/.*)\\.js$': '$1'
			},
			rootDir: '.',
			collectCoverageFrom: [
				'server/**/*.js',
				'!server/server.js',
				'!server/**/*.test.js'
			]
		}
	],
	coverageDirectory: 'coverage',
	collectCoverage: true,
	coverageReporters: ['text', 'lcov', 'html']
};

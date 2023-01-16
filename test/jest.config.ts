import type { Config } from 'jest';

const config: Config = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '..',
	modulePaths: ['<rootDir>'],
	testRegex: '.*\\.spec\\.ts$',
	transform: { '^.+\\.(t|j)s$': 'ts-jest' },
	testEnvironment: 'node',
	// collectCoverageFrom: ['src/**/*.(t|j)s', '!src/(main).ts'],
	// coverageDirectory: './coverage',
	// coverageReporters: ['json', 'lcov'],
	// coveragePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
	globalSetup: './test/setup.ts',
	globalTeardown: './test/teardown.ts',
	maxWorkers: 1, // run in band (for performance measurement)
};
export default config;

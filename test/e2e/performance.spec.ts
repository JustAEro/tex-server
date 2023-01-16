import { getPdf } from 'test/util';

jest.setTimeout(60 * 1000); // 60 seconds

interface PerformanceTestOptions {
	kind: 'simultaneous' | 'sequential';
	count: number;
	texData: string;
}

const performance = async ({ kind, count, texData }: PerformanceTestOptions) => {
	const then = Date.now();
	if (kind === 'simultaneous')
		await Promise.all(new Array(count).fill(0).map(() => getPdf(texData)));
	else for (let i = 0; i < count; i++) await getPdf(texData);
	return Date.now() - then;
};

describe('performance', () => {
	const types = ['simultaneous', 'sequential'];
	const counts = [1, 10, 25, 50];
	const texData = ['Hello World!'];

	const testMatrix = types.flatMap((kind: PerformanceTestOptions['kind']) =>
		counts.flatMap(count =>
			texData.map(texData => ({
				kind,
				count,
				texData,
			})),
		),
	);

	test.each(testMatrix)('should quickly process $kind $count', async ({ kind, count, texData }) => {
		const time = await performance({ kind, count, texData });
		expect(time).toBeLessThan(1000 * count); // less than 1 second per request
	});
});

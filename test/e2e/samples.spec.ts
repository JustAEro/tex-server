import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Stream } from 'stream';
import { getPdf } from 'test/util';

const sampleDir = __dirname + '/../samples';
const samples = readdirSync(sampleDir).map(x => join(sampleDir, x));

const specFilename = '_spec.pdf'; // the reference file
const resultFilename = '_spec.result.pdf'; // the result file received from the server

// ignore file unique metadata
const ignorePdfDiffRegexs = [
	/\/ModDate \([^\)]+\)/g,
	/\/CreationDate \([^\)]+\)/g,
	/\/ID \[<[^>]+> <[^>]+>\]/g,
];

describe('samples', () => {
	test.each(samples)('should compile %s', async dir => {
		const files = readdirSync(dir)
			.filter(x => !x.startsWith('_')) // remove result files
			.reduce((prev, f) => {
				return {
					...prev,
					[f]: readFileSync(join(dir, f)),
				};
			}, {} as Record<string, Stream>);

		const received = await getPdf(files);
		expect(received).toBeTruthy();

		// write the recieved result to a file
		writeFileSync(join(dir, resultFilename), received);

		// compare reference buffer with result buffer
		const diffAgainst: Buffer = readFileSync(join(dir, specFilename));

		// apply ignore regexs
		const [receivedN, diffAgainstN] = [received, diffAgainst]
			.map(x => x.toString('utf8'))
			.map(x => ignorePdfDiffRegexs.reduce((acc, regex) => acc.replace(regex, ''), x));

		expect(receivedN).toEqual(diffAgainstN);
	});
});

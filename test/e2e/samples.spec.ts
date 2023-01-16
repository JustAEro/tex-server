import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { getPdf } from 'test/util';

const sampleDir = __dirname + '/../samples';
const files = readdirSync(sampleDir).filter(s => s.endsWith('.tex')); // analyze all .tex files in the samples directory

// ignore file unique metadata
const ignorePdfDiffRegexs = [
	/\/ModDate \([^\)]+\)/g,
	/\/CreationDate \([^\)]+\)/g,
	/\/ID \[<[^>]+> <[^>]+>\]/g,
];

describe('samples', () => {
	test.each(files)('should compile %s', async texFile => {
		const pdfFile = texFile.replace(/.tex$/, '.pdf');

		const texData = readFileSync(sampleDir + '/' + texFile, 'utf8');

		const received = await getPdf(texData);
		expect(received).toBeTruthy();

		// write the recieved result to a file
		writeFileSync(sampleDir + '/' + pdfFile.replace(/.pdf$/, '.result.pdf'), received);

		// compare reference buffer with result buffer
		const diffAgainst: Buffer = readFileSync(sampleDir + '/' + pdfFile);

		// apply ignore regexs
		const [receivedN, diffAgainstN] = [received, diffAgainst]
			.map(x => x.toString('utf8'))
			.map(x => ignorePdfDiffRegexs.reduce((acc, regex) => acc.replace(regex, ''), x));

		expect(receivedN).toEqual(diffAgainstN);
	});
});

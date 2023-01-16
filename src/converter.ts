import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { Readable, Stream } from 'stream';
import * as MultiStream from 'multistream';
import { v4 } from 'uuid';
import { Latex } from './latex';
import { PdfError } from './logger';

const fetchTemplate = (name: string): ReadStream => {
	return createReadStream(join(__dirname, '..', 'templates', name), 'utf8');
};

export interface ProcessingDetails {
	jobId: string;
	duration: number;
}

export class Tex2PdfConvert extends MultiStream implements ProcessingDetails {
	constructor(input: Readable) {
		super([fetchTemplate('doc_start.tex'), input, fetchTemplate('doc_end.tex')]);
	}

	public readonly jobId = v4();

	private start = -1;

	get duration(): number {
		if (this.start === -1) return -1;
		return Date.now() - this.start;
	}

	get pdf(): Promise<Stream> {
		this.start = Date.now();
		return new Latex(this.jobId, this).compile().catch((e: Error) => {
			throw new PdfError(e, this);
		});
	}
}

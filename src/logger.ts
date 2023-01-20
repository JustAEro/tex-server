import { Request } from 'express';

export interface ProcessingDetails {
	jobId: string;
	duration: number;
}

export const log = (level: 'log' | 'warn' | 'error', event: string, meta: ProcessingDetails) => {
	console[level](
		JSON.stringify({
			event,
			...meta,
		}),
	);
};

export class PdfError {
	private readonly baseError: Error;
	private readonly meta: ProcessingDetails;
	constructor(message: string | Error, req: Request, public readonly code = 500) {
		this.baseError = typeof message === 'string' ? new Error(message) : message;
		this.meta = {
			jobId: req.id,
			duration: Date.now() - req.timestamp,
		};
	}

	get message(): string {
		return this.baseError.message;
	}

	public log() {
		log(
			'warn',
			this.message
				.split('\n')
				.map(x => x.trim())
				.filter(x => x.length !== 0)[0],
			this.meta,
		);
	}
}

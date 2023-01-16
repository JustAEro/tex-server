import { ProcessingDetails } from './converter';

export const log = (level: 'log' | 'warn' | 'error', event: string, meta: ProcessingDetails) => {
	console[level](
		JSON.stringify({
			event,
			jobId: meta.jobId,
			duration: meta.duration,
		}),
	);
};

export class PdfError {
	private readonly baseError: Error;
	constructor(message: string | Error, private meta: ProcessingDetails) {
		this.baseError = typeof message === 'string' ? new Error(message) : message;
	}

	get message(): string {
		return this.baseError.message;
	}

	public log() {
		log('warn', this.baseError.name, this.meta);
	}
}

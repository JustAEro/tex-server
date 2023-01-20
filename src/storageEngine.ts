import { createWriteStream } from 'fs';
import { join } from 'path';
import { Request } from 'express';
import { StorageEngine } from 'multer';

export class PerRequestStorage implements StorageEngine {
	_handleFile(
		req: Request,
		file: Express.Multer.File,
		cb: (error: any, info?: Partial<Express.Multer.File>) => void,
	): void {
		const path = join(req.workdir, file.fieldname.replace(/[^A-z0-9.]*/gm, ''));
		const s = createWriteStream(path);
		file.stream.pipe(s);
		s.on('error', cb);
		s.on('finish', () =>
			cb(null, { destination: req.workdir, filename: file.fieldname, path, size: s.bytesWritten }),
		);
	}

	_removeFile() {
		return; // remove is handled by teardown hook
	}
}

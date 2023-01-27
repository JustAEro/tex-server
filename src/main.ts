import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import * as express from 'express';
import * as multer from 'multer';
import { v4 } from 'uuid';
import { Latex } from './latex';
import { log, PdfError } from './logger';
import { PerRequestStorage } from './storageEngine';

const storage = new PerRequestStorage();
mkdirSync(storage.dir, { recursive: true });
const upload = multer({ storage });

// init
const app = express();

app.use((req, _res, next) => {
	// add metadata to request
	req.id = v4();
	req.workdir = join(storage.dir, req.id);
	req.workdirClear = () => rmSync(req.workdir, { recursive: true });
	req.timestamp = Date.now();

	// create workdir
	mkdirSync(req.workdir);

	// continue
	next();
});

app.post('/', upload.any(), async (req: express.Request, res, next) => {
	// require main.tex
	if (!Array.isArray(req.files)) {
		req.workdirClear();
		return next(new PdfError('no files given', req, 400));
	}
	if (!req.files.some(({ fieldname }) => fieldname === 'main.tex')) {
		req.workdirClear();
		return next(new PdfError('no main.tex given', req, 400));
	}

	new Latex(req.workdir)
		.compile()
		.then(docStream => {
			// send pdf
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', 'attachment; filename=doc.pdf');
			let empty = true;
			docStream
				.on('error', (e: Error) => next(new PdfError(e, req)))
				.on('data', () => (empty = false))
				.on('end', () => {
					if (empty) return next(new PdfError('Empty PDF', req));
					log('log', 'success', { jobId: req.id, duration: Date.now() - req.timestamp });
					//req.workdirClear();
					res.end();
				})
				.pipe(res);
		})
		.catch(e => next(new PdfError(e, req)));
});

app.use((err: PdfError | Error, _req: any, res: express.Response, _next: any) => {
	if (err instanceof PdfError) err.log();
	else log('error', err.message, { jobId: 'unknown', duration: -1 });
	res
		.status(err instanceof PdfError ? err.code : 500)
		.send(err.message ?? (err || 'Internal Server Error'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(JSON.stringify({ message: 'Server running on port ' + port }));
});

import * as express from 'express';
import { Tex2PdfConvert } from './converter';
import { log, PdfError } from './logger';

const app = express();

app.post('/', async (req: express.Request, res, next) => {
	// build pdf
	const converter = new Tex2PdfConvert(req);
	converter.pdf
		.then(docStream => {
			// send pdf
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', 'attachment; filename=doc.pdf');
			docStream
				.on('error', (e: Error) => {
					next(new PdfError(e, converter));
				})
				.on('end', () => {
					log('log', 'success', converter);
					res.end();
				})
				.pipe(res);
		})
		.catch(next);
});

app.use((err: PdfError | Error, _req: any, res: express.Response, _next: any) => {
	if (err instanceof PdfError) err.log();
	else log('error', err.name, { jobId: 'unknown', duration: -1 });
	res.status(500).send(err.message ?? (err || 'Internal Server Error'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log('Server running on port ' + port);
});

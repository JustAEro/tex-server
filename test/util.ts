import { exec } from 'child_process';
import { Stream } from 'stream';
import axios from 'axios';
import * as FormData from 'form-data';
import { options } from './setup';

const clearLastLine = () => {
	process.stdout.moveCursor(0, -1); // up one line
	process.stdout.clearLine(1); // from cursor to end
};
let prevMsg: string = undefined;
export const log = (msg: string, status?: string, color: 'red' | 'green' = 'green') => {
	if (msg === prevMsg) clearLastLine();
	process.stdout.write(msg);
	if (status) {
		process.stdout.write(color === 'red' ? '\x1b[31m' : '\x1b[32m');
		process.stdout.write(' ' + status);
	}
	process.stdout.write('\x1b[0m\n');
	prevMsg = msg;
};

export const sh = async (cmd: string, taskDesc: string) =>
	await new Promise((resolve, reject) => {
		log(taskDesc);
		exec(cmd, (err, stdout, stderr) => {
			if (!err) return resolve(stdout);
			log(taskDesc, '✖', 'red');
			console.log('Error: ', stderr);
			reject(err);
		});
	}).then(r => {
		log(taskDesc, '✔');
		return r;
	});

export const getPdf = async (
	data: string | Record<string, Buffer | Stream>,
	path = '/',
): Promise<Buffer> => {
	const opts = options();

	const f = new FormData();
	if (typeof data === 'string') f.append('main.tex', Buffer.from(data), { filename: 'main.tex' });
	else for (const [k, v] of Object.entries(data)) f.append(k, v, { filename: k });

	const result = await axios
		.post(`http://localhost:${opts.port}` + path, f, {
			responseType: 'arraybuffer',
		})
		.catch(e => {
			console.log(e.response);
			throw e;
		})
		.then(response => Buffer.from(response.data, 'binary'));
	return result;
};

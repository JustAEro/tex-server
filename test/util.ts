import { exec } from 'child_process';
import axios from 'axios';
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

export const getPdf = async (data: string, path = '/'): Promise<Buffer> => {
	const opts = options();
	const result = await axios
		.post(`http://localhost:${opts.port}` + path, data, {
			responseType: 'arraybuffer',
		})
		.then(response => Buffer.from(response.data, 'binary'));
	return result;
};

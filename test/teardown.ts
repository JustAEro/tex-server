require('ts-node/register');
import { options } from './setup';
import { sh } from './util';

export default async () => {
	const opts = options();
	// stop the container
	await sh(`docker stop ${opts.imageName}-${opts.port}`, 'Stop test-container');
};

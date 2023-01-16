import { log, sh } from './util';

export const options = () => {
	// could do some env var stuff here
	return {
		imageName: 'test-container',
		port: 3990,
		maxMem: 1.5 * 1024 * 1024 * 1024, // 1.5GB
		maxCores: 1,
	};
};

export default async () => {
	log('');
	const opts = options();
	// build the image
	await sh(`pnpm build:docker -t ${opts.imageName}`, 'Building docker image');

	// run the container
	await sh(
		`docker run --name ${opts.imageName}-${opts.port} --rm -d -m ${opts.maxMem} --cpus=${opts.maxCores} -p ${opts.port}:3000 ${opts.imageName}`,
		'Start test-container',
	);

	// wait for the container to start
	await new Promise(resolve => setTimeout(resolve, 1000));
};

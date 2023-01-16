import { ProcessEnvOptions, spawn } from 'child_process';
import { createReadStream, mkdirSync, readFileSync, rmSync } from 'fs';
import { delimiter } from 'path';
import { Stream } from 'stream';

export interface LatexAssetOptions {
	/**
	 * The absolute path (or an array of absolute paths) to the directory which
	 * contains the assets necessary for the doc.
	 */
	inputs?: string | string[];

	/**
	 * The absolute path (or an array of absolute paths) to the directory which
	 * contains the fonts necessary for the doc (you will most likely want to use
	 * this option if you're working with fontspec).
	 */
	fonts?: string | string[];

	/**
	 * The absolute path (or an array of absolute paths) to the directory which
	 * contains the precompiled files necessary for the doc.
	 */
	precompiled?: string | string[];
}

export interface LatexOptions extends LatexAssetOptions, ProcessEnvOptions {
	args?: string[];
}

const prompt = "(Please type a command or say `\\end')\n";
const outputAfterLastPrompt = (filename: string): string => {
	try {
		const logContents = readFileSync(filename, 'utf8');
		const pieces = logContents.split(prompt);
		return pieces[pieces.length - 1] ?? 'Error could not be determined.';
	} catch (e) {
		return 'Log file is empty.';
	}
};

/**
 * Combines all paths into a single PATH to be added to process.env.
 */
const joinPaths = (inputs: string | string[]) =>
	(Array.isArray(inputs) ? inputs.join(delimiter) : inputs) + delimiter;

export class Latex {
	// job id
	private readonly cwd = '/tmp/pdftex/' + this.jobId;

	// pdflatex process options
	private readonly options: LatexOptions;

	constructor(
		private readonly jobId: string,
		private readonly src: Stream,
		opts: LatexAssetOptions = {},
	) {
		// initialize the options
		this.options = {
			...opts,
			args: ['-halt-on-error', '-jobname=document'],
			cwd: this.cwd,
			env: {
				...process.env,
				TEXINPUTS: joinPaths(opts.inputs),
				TTFONTS: joinPaths(opts.fonts),
				OPENTYPEFONTS: joinPaths(opts.fonts),
			},
		};
	}

	public async compile(): Promise<Stream> {
		// create the working directory
		mkdirSync(this.cwd, { recursive: true });

		// create the pdflatex process and setup the pipes
		const pdflatex = spawn('/usr/bin/pdflatex', this.options.args, this.options);
		this.src.pipe(pdflatex.stdin);

		return new Promise<void>((resolve, reject) => {
			pdflatex.on('exit', code => {
				// resolve on success
				if (code === 0) return resolve();
				// else read log and detect error
				const err = outputAfterLastPrompt(this.cwd + '/document.log');
				reject(
					new Error(`
						pdflatex exited with code ${code} (job id: ${this.jobId})
						
						## LaTeX error log ##
						${err}
						`),
				);
			});
			pdflatex.on('error', reject);
			pdflatex.on('close', reject);
			pdflatex.on('disconnect', reject);
		}).then(() =>
			createReadStream(this.cwd + '/document.pdf').on('close', () =>
				rmSync(this.cwd, { recursive: true }),
			),
		);
	}
}

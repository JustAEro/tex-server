// to make the file a module and avoid the TypeScript error
export {};

declare global {
	namespace Express {
		export interface Request {
			id: string;
			workdir: string;
			workdirClear: () => void;
			timestamp: number;
		}
	}
}

export class Application {
	application_id?: string;
	name?: string;
	display_id?: string;
	theme?: string;
	display_order?: number;
}

export interface ApplicationRes {
	getApplications?: Application[];
	error?: string;
}
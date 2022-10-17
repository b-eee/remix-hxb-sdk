export interface SetWsInput {
	workspace_id: string;
}

export interface CreateWsInput {
	name: string;
}

export interface ArchiveWorkspacePl {
	archived: boolean;
	w_id: string;
}
export interface ArchiveWorkspace {
	payload: ArchiveWorkspacePl;
}

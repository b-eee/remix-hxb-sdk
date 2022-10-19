export interface WorkSpacesInfo {
	workspace_name?: string;
	workspace_id?: string;
}

export interface Workspaces {
	workspaces: [WorkSpacesInfo];
	current_workspace_id?: string;
}

export interface WorkspacesRes {
	workspaces?: Workspaces;
	error?: string;
}

export interface WorkspaceCurrent {
	workspace_id?: string;
}

export interface WorkspaceCurrentRes {
	wsCurrent?: WorkspaceCurrent;
	error?: string;
}

export interface WorkspacesRes {
	workspaces?: Workspaces;
	error?: string;
}
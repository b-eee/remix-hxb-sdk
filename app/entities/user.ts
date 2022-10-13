export interface UserRoles {
  r_id: string;
  role_name: string;
  role_id: string;
  p_id: string;
  application_id: string;
  application_name: string;
  application_display_order: string;
}

export interface UserInfo {
  username: string;
  email: string;
  profile_pic: string;
  u_id: string;
  current_workspace_id: string;
  is_ws_admin: string;
  user_roles: [UserRoles];
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    created_at: string;
    updated_at: string;
    avatar?: string;
    permissions: Permission[];
    roles: Role[];
}


export interface UserForm {
    id?: number
    name: string
    email: string
    password?: string
    file?: string
    permission_ids?: number[]
    role_ids?: number[]
}

export interface Permission {
    id: number
    name: string
    group: string
}

export interface PermissionForm {
    id?: number
    name: string
    group: string
}

export interface Role {
    id: number
    name: string
    permissions: Permission[]
}

export interface RoleForm {
    id?: number
    name: string
    permission_ids?: number[]
}
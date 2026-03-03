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

export type LatLng = { lat: number; lng: number }

export interface AllowedArea {
    id: number
    name: string
    polygon?: LatLng[] | null
    is_active: boolean
}

export interface AllowedAreaForm {
    id?: number
    name: string
    is_active: boolean
    polygon?: LatLng[] | null
}

export interface Attendance {
    id: number
    allowed_area: AllowedArea
    user: User
    latitude: number
    longitude: number
    status: string
    created_at: string
}
import DashboardIndex from '@/pages/dashboard/Index.vue'
import UsersIndex from '@/pages/users/Index.vue'
import Login from '@/pages/auth/Login.vue'
import PermissionsIndex from '@/pages/permissions/Index.vue'
import RolesIndex from '@/pages/roles/Index.vue'
import UnAuthorized from '@/pages/UnAuthorized.vue'
const routes = [
    { path: '/login', component: Login, meta: { requiresGuest: true } },
    { path: '/', component: DashboardIndex, meta: { requiresAuth: true, can: 'view dashboard' } },
    { path: '/users', component: UsersIndex, meta: { requiresAuth: true, can: 'view users' } },
    { path: '/permissions', component: PermissionsIndex, meta: { requiresAuth: true, can: 'view permissions' } },
    { path: '/roles', component: RolesIndex, meta: { requiresAuth: true, can: 'view roles' } },
    { path: '/403', component: UnAuthorized },
]

export default routes
import DashboardIndex from '@/pages/dashboard/Index.vue'
import UsersIndex from '@/pages/users/Index.vue'
import Login from '@/pages/auth/Login.vue'
import PermissionsIndex from '@/pages/permissions/Index.vue'
import RolesIndex from '@/pages/roles/Index.vue'
import UnAuthorized from '@/pages/UnAuthorized.vue'
import NotFound from '@/pages/NotFound.vue'
import CheckInOut from '@/pages/attendances/CheckInOut.vue'
import AllowedAreasIndex from '@/pages/allowed-areas/Index.vue'
import AttendancesIndex from '@/pages/attendances/Index.vue'
const routes = [
    { path: '/login', component: Login, meta: { requiresGuest: true } },
    { path: '/', component: DashboardIndex, meta: { requiresAuth: true, can: 'view dashboard' } },
    { path: '/users', component: UsersIndex, meta: { requiresAuth: true, can: 'view users' } },
    { path: '/permissions', component: PermissionsIndex, meta: { requiresAuth: true, can: 'view permissions' } },
    { path: '/roles', component: RolesIndex, meta: { requiresAuth: true, can: 'view roles' } },
    { path: '/403', component: UnAuthorized },
    { path: '/:pathMatch(.*)*', component: NotFound },
    { path: '/check-in-out', component: CheckInOut},
    { path: '/allowed-areas', component: AllowedAreasIndex, meta: { requiresAuth: true, can: 'view allowed areas' } },
    { path: '/attendances', component: AttendancesIndex, meta: { requiresAuth: true, can: 'view attendances' } },
]

export default routes
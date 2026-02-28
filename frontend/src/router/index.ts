import { createRouter, createWebHistory } from 'vue-router'
import useAuthStore from '@/stores/auth'
import routes from './routesList'

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {
    const {can,isLoggedIn} = useAuthStore()

    if (to.meta.requiresAuth && !isLoggedIn) {
        return '/login'
    } else if (to.meta.requiresGuest && isLoggedIn) {
        return '/'
    } else {
        if (to.meta.can && !can(to.meta.can as string)) {
            return '/403'
        }
        return true
    }
})

export default router
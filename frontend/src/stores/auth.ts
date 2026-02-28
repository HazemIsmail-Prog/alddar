import axiosInstance from "@/lib/axios"
import { defineStore } from "pinia"
import { computed, ref, watch } from "vue"
import router from "@/router"
import type { User } from "@/types"

const useAuthStore = defineStore('auth', () => {

    const token = ref<string | null>(localStorage.getItem('token') ?? null)
    const user = ref<User | null>(JSON.parse(localStorage.getItem('user') ?? 'null') ?? null)
    const abilities = ref<string | null>(JSON.parse(localStorage.getItem('abilities') ?? 'null') ?? null)
    const isLoggedIn = computed(() => {
        return token.value && user.value !== null
    })

    const can = (permission: string) => {
        return abilities.value?.includes(permission) ?? false
    }

    const canAny = (permissions: string[]) => {
        return permissions.some(permission => abilities.value?.includes(permission) ?? false)
    }

    const canAll = (permissions: string[]) => {
        return permissions.every(permission => abilities.value?.includes(permission) ?? false)
    }

    const loggingIn = ref(false)

    const setUser = (response: any) => {
        user.value = response.data.user ?? null
        token.value = response.data.token ?? null
        abilities.value = response.data.abilities ?? null
    }

    const clearUser = () => {
        user.value = null
        token.value = null
        abilities.value = null
    }

    const login = (email: string, password: string) => {
        if (token.value){
            return
        }
        loggingIn.value = true
        axiosInstance.post('/api/login', {
            email,
            password,
        })
        .then(response => {
            setUser(response)
            router.push('/')
        })
        .catch(() => {
            clearUser()
        })
        .finally(() => {
            loggingIn.value = false
        })
    }

    const logout = () => {
        if (!token.value){
            return
        }
        axiosInstance.post('/api/logout')
        .finally(() => {
            clearUser()
            router.push('/login')
        })
    }

    watch(token, (newToken) => {
        if (newToken) {
            localStorage.setItem('token', newToken)
        }else{
            localStorage.removeItem('token')
        }
    })
        watch(user, (newUser) => {
            if (newUser) {
                localStorage.setItem('user', JSON.stringify(newUser))
            }else{
                localStorage.removeItem('user')
            }
        })
        watch(abilities, (newAbilities) => {
        if (newAbilities && newAbilities.length > 0) {
            localStorage.setItem('abilities', JSON.stringify(newAbilities))
        } else if (newAbilities === null) {
            localStorage.removeItem('abilities')
        }
    })   

    return {
        token,
        user,
        abilities,
        isLoggedIn,
        loggingIn,
        setUser,
        clearUser,
        login,
        logout,
        can,
        canAny,
        canAll,
    }
})

export default useAuthStore
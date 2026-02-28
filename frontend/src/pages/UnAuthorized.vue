<template>
    <div class="flex flex-col items-center justify-center min-h-[70vh] text-center gap-6">
        <div class="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-1">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-12 h-12 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <rect x="5" y="11" width="14" height="8" rx="2" stroke-width="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke-width="2"/>
                <circle cx="12" cy="15" r="1" stroke-width="2"/>
            </svg>
        </div>
        <div>
            <h1 class="text-3xl font-semibold text-foreground mb-2">Unauthorized</h1>
            <p class="text-muted-foreground mb-5 max-w-md">You do not have permission to access this page.</p>
        </div>
        <div class="flex gap-3">
            <Button variant="outline" @click="goBack">
                Go Back
            </Button>
            <Button variant="destructive" @click="logout">
                Logout
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { Button } from '@/components/ui/button'
    import useAuthStore from '@/stores/auth'
    const { logout } = useAuthStore()
    import router from '@/router'
    const goBack = () => {
        router.go(-1)
    }
</script>
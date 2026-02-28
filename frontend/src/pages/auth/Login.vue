<script setup lang="ts">
import { ref } from 'vue'
import useAuthStore from '@/stores/auth'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/AuthLayout.vue';

const email = ref('test@example.com')
const password = ref('password')

const auth = useAuthStore()

</script>

<template>
    <AuthLayout title="Log in" description="Enter your email and password below to log in">

        <form
            @submit.prevent="auth.login(email, password)"
            class="flex flex-col gap-6"
        >
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label for="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        v-model="email"
                        required
                        autofocus
                        autocomplete="email"
                        placeholder="email@example.com"
                    />
                    <!-- <InputError :message="errors.email" /> -->
                </div>

                <div class="grid gap-2">
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        v-model="password"
                        required
                        autocomplete="current-password"
                        placeholder="Password"
                    />
                    <!-- <InputError :message="errors.password" /> -->
                </div>

                <Button
                    type="submit"
                    class="mt-4 w-full"
                    :disabled="auth.loggingIn"
                >
                    <Spinner v-if="auth.loggingIn" />
                    Log in
                </Button>
            </div>
        </form>
    </AuthLayout>

</template>

<script setup lang="ts">
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { ChevronUp,GalleryVerticalEnd, Home, Users, Shield, ShieldCheck } from 'lucide-vue-next'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import useAuthStore from '@/stores/auth'
const authStore = useAuthStore()



const sidebarGroups = [
    {
        label: '',
        show: authStore.canAny(['view dashboard']),
        items: [
            {
            label: 'Dashboard',
            icon: Home,
            href: '/',
            show: authStore.can('view dashboard'),
            },
        ],
    },
    {
        label: 'Admin',
        show: authStore.canAny(['view permissions', 'view roles', 'view users']),
        items: [
            {
                label: 'Permissions',
                icon: Shield,
                href: '/permissions',
                show: authStore.can('view permissions'),
            },
            {
                label: 'Roles',
                icon: ShieldCheck,
                href: '/roles',
                show: authStore.can('view roles'),
            },
            {
                label: 'Users',
                icon: Users,
                href: '/users',
                show: authStore.can('view users'),
            },
        ],
    },
]


</script>

<template>
<SidebarProvider>
    <Sidebar variant="floating" side="left">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                        <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <GalleryVerticalEnd class="size-4" />
                        </div>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-semibold">Acme Inc</span>
                            <span class="truncate text-xs">Enterprise</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup v-for="group in sidebarGroups.filter(group => group.show)" :key="group.label">
                <SidebarGroupLabel v-if="group.label">{{ group.label }}</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem 
                            v-for="item in group.items.filter(item => item.show)" 
                            :key="item.href"
                        >
                            <SidebarMenuButton as-child>
                                <RouterLink :to="item.href">
                                    <component :is="item.icon" />
                                    <span>{{ item.label }}</span>
                                </RouterLink>  
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <SidebarMenuButton>
                                <Avatar>
                                    <AvatarImage :src="authStore.user?.avatar ?? ''" />
                                    <AvatarFallback>
                                        {{ authStore.user?.name?.charAt(0) }}
                                    </AvatarFallback>
                                </Avatar>
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium">{{ authStore.user?.name }}</span>
                                    <span class="text-xs text-muted-foreground">{{ authStore.user?.email }}</span>
                                </div>
                                <ChevronUp class="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            class="w-(--reka-popper-anchor-width)"
                        >
                            <DropdownMenuItem>
                                <span>Account</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem @click="authStore.logout">
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
    <SidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div class="flex items-center gap-2 px-4 w-full">
                <SidebarTrigger class="-ms-1" />
                <slot name="header" />
            </div>
        </header>
        <main class="px-4">
            <slot />
        </main>
    </SidebarInset>
</SidebarProvider>
</template>
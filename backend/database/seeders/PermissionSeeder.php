<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;
class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            [
                'name' => 'view dashboard',
                'group' => 'dashboard',
            ],
            [
                'name' => 'view permissions',
                'group' => 'permissions',
            ],
            [
                'name' => 'create permission',
                'group' => 'permissions',
            ],
            [
                'name' => 'edit permission',
                'group' => 'permissions',
            ],
            [
                'name' => 'delete permission',
                'group' => 'permissions',
            ],
            [
                'name' => 'view roles',
                'group' => 'roles',
            ],
            [
                'name' => 'create role',
                'group' => 'roles',
            ],
            [
                'name' => 'edit role',
                'group' => 'roles',
            ],
            [
                'name' => 'delete role',
                'group' => 'roles',
            ],
            [
                'name' => 'view users',
                'group' => 'users',
            ],
            [
                'name' => 'create user',
                'group' => 'users',
            ],
            [
                'name' => 'edit user',
                'group' => 'users',
            ],
            [
                'name' => 'delete user',
                'group' => 'users',
            ],
        ];

        Permission::insert($permissions);

    }
}

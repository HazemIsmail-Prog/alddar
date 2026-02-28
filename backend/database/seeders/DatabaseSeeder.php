<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        
        User::factory(500)->create();

        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
        ]);

        $permissions = Permission::all();
        $role = Role::find(1);

        $role->permissions()->sync($permissions->pluck('id'));

        $super_admin_user = User::find(1);
        $super_admin_user->roles()->sync([1]);
    }
}

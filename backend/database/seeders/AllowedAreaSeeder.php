<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AllowedArea;

class AllowedAreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $allowedAreas = [
            [
                'name' => 'Salmiya',
                'latitude' => 29.340300,
                'longitude' => 48.073300,
                'radius' => 1345,
            ],
            [
                'name' => 'Kuwait City',
                'latitude' => 29.3759,
                'longitude' => 47.9774,
                'radius' => 8000,
            ],
        ];
        AllowedArea::insert($allowedAreas);
    }
}

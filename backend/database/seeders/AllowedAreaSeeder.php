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
                'polygon' => [
                    ['lat' => 29.340300, 'lng' => 48.073300],
                    ['lat' => 29.340300, 'lng' => 48.073300],
                    ['lat' => 29.340300, 'lng' => 48.073300],
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Kuwait City',
                'polygon' => [
                    ['lat' => 29.3759, 'lng' => 47.9774],
                    ['lat' => 29.3759, 'lng' => 47.9774],
                    ['lat' => 29.3759, 'lng' => 47.9774],
                    ['lat' => 29.3759, 'lng' => 47.9774],
                ],
                'is_active' => true,
            ],
        ];
        foreach ($allowedAreas as $allowedArea) {
            AllowedArea::create($allowedArea);
        }
    }
}

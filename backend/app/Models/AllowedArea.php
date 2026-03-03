<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AllowedArea extends Model
{
    protected $guarded = [];

    protected $casts = [
        'polygon' => 'array', // array of ['lat' => float, 'lng' => float]
        'is_active' => 'boolean',
    ];
}

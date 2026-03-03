<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $guarded = [];

    // relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function allowedArea()
    {
        return $this->belongsTo(AllowedArea::class);
    }
}

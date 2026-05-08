<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = ['user_id', 'type', 'student_name', 'detail', 'checked'];
    
    protected $casts = [
        'checked' => 'boolean',
    ];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
protected $fillable = [
    'full_name',
    'massar_code',
    'last_year_grade',
    'status'
];
}

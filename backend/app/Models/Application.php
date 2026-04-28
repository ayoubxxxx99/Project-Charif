<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
protected $fillable = [
    'user_id',
    'full_name',
    'email',
    'massar_code',
    'maths',
    'physique',
    'langue_etrangere',
    'langue_secondaire',
    'histoire_geo',
    'education_islamique',
    'sport',
    'status',
    'convocation_sent',
];
}

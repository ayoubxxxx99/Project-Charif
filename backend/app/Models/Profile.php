<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    // Indispensable pour autoriser l'enregistrement
    protected $fillable = [
        'user_id', 
        'address', 
        'date_of_birth', 
        'guardian_name', 
        'guardian_phone', 
        'avatar_path'
    ];

    // Relation inverse : un profil appartient à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
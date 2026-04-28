<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('profiles', function (Blueprint $table) {
        $table->id();
        // Lie le profil à l'utilisateur, si l'user est supprimé, le profil l'est aussi
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
        $table->string('address')->nullable();
        $table->date('date_of_birth')->nullable();
        $table->string('guardian_name')->nullable();
        $table->string('guardian_phone')->nullable();
        $table->string('avatar_path')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};

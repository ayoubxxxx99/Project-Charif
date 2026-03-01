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
    Schema::create('applications', function (Blueprint $table) {
        $table->id();
        $table->string('full_name');
        $table->string('massar_code')->unique();
        $table->float('math_mark')->nullable();
        $table->float('physics_mark')->nullable();
        $table->float('french_mark')->nullable();
        $table->float('last_year_grade');
        $table->string('status')->default('pending'); // pending, accepted, rejected
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};

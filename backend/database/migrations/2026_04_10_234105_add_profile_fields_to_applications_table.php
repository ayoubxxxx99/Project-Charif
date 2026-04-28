<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            //
        });
    }
    public function up() {
    Schema::table('applications', function (Blueprint $table) {
        $table->string('address')->nullable();
        $table->date('date_of_birth')->nullable();
        $table->string('guardian_name')->nullable();
        $table->string('guardian_phone')->nullable();
        $table->string('avatar_path')->nullable();
    });
}
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('email'); // 📧 CRITICAL: Required for the convocation system
            $table->string('massar_code')->unique();

            // Grades
            $table->decimal('maths', 4, 2);
            $table->decimal('physique', 4, 2);
            $table->decimal('langue_etrangere', 4, 2);
            $table->decimal('langue_secondaire', 4, 2);
            $table->decimal('histoire_geo', 4, 2);
            $table->decimal('education_islamique', 4, 2);
            $table->decimal('sport', 4, 2);

            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')->insert([
            'key' => 'main_list_ids',
            'value' => json_encode([]),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'main_list_ids')->delete();
    }
};
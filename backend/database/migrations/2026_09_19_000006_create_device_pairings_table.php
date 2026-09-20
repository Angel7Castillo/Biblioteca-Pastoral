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
        Schema::create('device_pairings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique()->index();
            $table->string('vault_id', 50)->index();
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);
            $table->timestamps();
        });

        Schema::table('sermons', function (Blueprint $table) {
            $table->string('vault_id', 50)->nullable()->index()->after('user_id');
        });

        Schema::table('bible_notes', function (Blueprint $table) {
            $table->string('vault_id', 50)->nullable()->index()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bible_notes', function (Blueprint $table) {
            $table->dropColumn('vault_id');
        });

        Schema::table('sermons', function (Blueprint $table) {
            $table->dropColumn('vault_id');
        });

        Schema::dropIfExists('device_pairings');
    }
};

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
        Schema::create('strong_dictionary', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique()->index(); // e.g. H1254, G4151
            $table->string('original_word', 100);          // e.g. בָּרָא, πνεῦμα
            $table->string('transliteration', 100);       // e.g. bara, pneuma
            $table->string('pronunciation', 100)->nullable(); // e.g. baw-raw', pnoy'-mah
            $table->text('definition');                    // Definición amplia en español
            $table->enum('type', ['hebrew', 'greek']);
            $table->timestamps();

            $table->index('transliteration');
            $table->index('type');
        });

        Schema::create('theological_terms', function (Blueprint $table) {
            $table->id();
            $table->string('term', 100)->unique()->index();
            $table->string('category', 50)->nullable();
            $table->text('definition');
            $table->string('cross_references')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theological_terms');
        Schema::dropIfExists('strong_dictionary');
    }
};

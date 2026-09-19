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
        Schema::create('bible_notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('book_number');
            $table->unsignedSmallInteger('chapter');
            $table->unsignedSmallInteger('verse');
            $table->string('version', 20)->nullable();
            $table->text('content');
            $table->string('tags')->nullable();
            $table->timestamps();

            $table->index(['book_number', 'chapter']);
            $table->index(['book_number', 'chapter', 'verse']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bible_notes');
    }
};

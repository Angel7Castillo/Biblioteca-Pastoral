<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bible_verses', function (Blueprint $table) {
            $table->id();
            $table->string('version')->default('RVR1960');
            $table->integer('book_number');
            $table->string('book_name');
            $table->integer('chapter');
            $table->integer('verse');
            $table->text('scripture');
            $table->timestamps();

            $table->index(['version', 'book_number', 'chapter']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bible_verses');
    }
};

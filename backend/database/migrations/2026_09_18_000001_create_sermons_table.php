<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sermons', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content_markdown')->nullable();
            $table->longText('content_html')->nullable();
            $table->string('status')->default('borrador'); // borrador, listo, predicado
            $table->date('preach_date')->nullable();
            $table->string('location')->nullable();
            $table->string('main_passage')->nullable();
            $table->string('target_audience')->nullable();
            $table->string('series_name')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sermons');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    public function up(): void
    {
        // Truncar la tabla bible_verses para forzar el re-sembrado limpio con todos los capítulos
        if (DB::getSchemaBuilder()->hasTable('bible_verses')) {
            DB::table('bible_verses')->truncate();
        }

        // Eliminar archivos JSON antiguos con estructura de capítulo único
        $biblesDir = database_path('bibles');
        foreach (['RVR1960', 'NVI', 'TLA'] as $ver) {
            $jsonFile = "{$biblesDir}/{$ver}.json";
            if (File::exists($jsonFile)) {
                File::delete($jsonFile);
            }
        }
    }

    public function down(): void
    {
    }
};

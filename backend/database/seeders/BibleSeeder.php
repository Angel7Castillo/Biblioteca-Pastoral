<?php

namespace Database\Seeders;

use App\Models\BibleVerse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class BibleSeeder extends Seeder
{
    public function run(): void
    {
        $biblesDir = database_path('bibles');
        $versions = ['RVR1960', 'NVI', 'TLA'];

        // Verificar si la base de datos ya tiene capítulos válidos (>1)
        $hasMultiChapters = BibleVerse::where('chapter', '>', 1)->exists();
        $totalVerses = BibleVerse::count();

        if ($hasMultiChapters && $totalVerses >= 90000) {
            $this->command->info("Los módulos completos de la Biblia ya están cargados correctamente ({$totalVerses} versículos).");
            return;
        }

        // Si los JSON existentes contienen el error de capítulo 1 único, forzar la regeneración
        $needConversion = false;
        foreach ($versions as $ver) {
            $jsonFile = "{$biblesDir}/{$ver}.json";
            if (!File::exists($jsonFile)) {
                $needConversion = true;
                break;
            }
            // Verificar si el JSON tiene capítulos > 1
            $sample = json_decode(File::get($jsonFile), true);
            if (is_array($sample) && count($sample) > 0) {
                $hasCh2 = false;
                foreach (array_slice($sample, 0, 100) as $item) {
                    if (($item['chapter'] ?? 1) > 1) {
                        $hasCh2 = true;
                        break;
                    }
                }
                if (!$hasCh2) {
                    $needConversion = true;
                    File::delete($jsonFile);
                }
            }
        }

        if ($needConversion && File::exists(database_path('download_and_convert_bibles.php'))) {
            $this->command->info("Descargando y convirtiendo módulos bíblicos completos con navegación por capítulos...");
            require database_path('download_and_convert_bibles.php');
        }

        foreach ($versions as $ver) {
            $jsonFile = "{$biblesDir}/{$ver}.json";
            if (File::exists($jsonFile)) {
                $this->command->info("Importando Biblia completa {$ver}...");
                Artisan::call('bible:import', [
                    'version' => $ver,
                    'file' => $jsonFile
                ], $this->command->getOutput());
            }
        }
    }
}



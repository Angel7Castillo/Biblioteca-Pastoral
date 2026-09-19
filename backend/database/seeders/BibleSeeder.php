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
        // Si ya existen más de 90,000 versículos cargados, omitir la importación
        if (BibleVerse::count() >= 90000) {
            $this->command->info("Los módulos completos de la Biblia ya están cargados (" . BibleVerse::count() . " versículos).");
            return;
        }

        $biblesDir = database_path('bibles');
        $versions = ['RVR1960', 'NVI', 'TLA'];

        $missing = false;
        foreach ($versions as $ver) {
            if (!File::exists("{$biblesDir}/{$ver}.json")) {
                $missing = true;
                break;
            }
        }

        if ($missing && File::exists(database_path('download_and_convert_bibles.php'))) {
            $this->command->info("Descargando y preparando los módulos completos de la Biblia (RVR1960, NVI, TLA)...");
            require_once database_path('download_and_convert_bibles.php');
        }

        foreach ($versions as $ver) {
            $jsonFile = "{$biblesDir}/{$ver}.json";
            if (File::exists($jsonFile)) {
                $this->command->info("Importando Biblia completa {$ver} desde archivo JSON...");
                Artisan::call('bible:import', [
                    'version' => $ver,
                    'file' => $jsonFile
                ], $this->command->getOutput());
            }
        }
    }
}


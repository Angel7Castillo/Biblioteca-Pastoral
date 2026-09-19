<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BibleVerse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class ImportBibleCommand extends Command
{
    protected $signature = 'bible:import {version : Nombre de la versión (RVR1960, NVI, TLA)} {file : Ruta al archivo JSON o SQLite de la Biblia}';
    protected $description = 'Importa un módulo bíblico completo (JSON/SQLite) a la base de datos de Biblioteca Pastoral';

    public function handle()
    {
        $version = strtoupper($this->argument('version'));
        $filePath = $this->argument('file');

        if (!File::exists($filePath)) {
            $this->error("El archivo especificado no existe: {$filePath}");
            return 1;
        }

        $this->info("Importando Biblia versión {$version} desde {$filePath}...");

        $extension = pathinfo($filePath, PATHINFO_EXTENSION);

        if ($extension === 'json') {
            $json = json_decode(File::get($filePath), true);
            if (!$json) {
                $this->error("El archivo JSON no es válido.");
                return 1;
            }

            $totalVerses = count($json);
            $bar = $this->output->createProgressBar($totalVerses);
            $bar->start();

            $now = now();
            $chunks = array_chunk($json, 500);

            DB::transaction(function () use ($chunks, $version, $now, $bar) {
                // Remove existing verses for this version to prevent duplicates
                BibleVerse::where('version', $version)->delete();

                foreach ($chunks as $chunk) {
                    $insertData = [];
                    foreach ($chunk as $v) {
                        $insertData[] = [
                            'version'     => $version,
                            'book_number' => $v['book_number'] ?? $v['book'] ?? 1,
                            'book_name'   => $v['book_name'] ?? 'Libro',
                            'chapter'     => $v['chapter'] ?? 1,
                            'verse'       => $v['verse'] ?? 1,
                            'scripture'   => $v['scripture'] ?? $v['text'] ?? '',
                            'created_at'  => $now,
                            'updated_at'  => $now,
                        ];
                    }
                    BibleVerse::insert($insertData);
                    $bar->advance(count($chunk));
                }
            });

            $bar->finish();
            $this->newLine();
            $this->info("¡Importación de {$version} ({$totalVerses} versículos) completada con éxito!");
        } else {
            $this->error("Formato no soportado por este comando. Use un archivo JSON formateado.");
            return 1;
        }

        return 0;
    }
}


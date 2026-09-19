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

        $importedFull = false;

        foreach ($versions as $ver) {
            $jsonFile = "{$biblesDir}/{$ver}.json";
            if (File::exists($jsonFile)) {
                $this->command->info("Importando Biblia completa {$ver} desde archivo JSON...");
                Artisan::call('bible:import', [
                    'version' => $ver,
                    'file' => $jsonFile
                ], $this->command->getOutput());
                $importedFull = true;
            }
        }

        if ($importedFull) {
            return;
        }

        // Dataset de pasajes fundamentales para las 3 versiones (RVR1960, NVI, TLA)
        $versesData = [
            // REINA VALERA 1960 (RVR1960)
            [
                'version' => 'RVR1960',
                'book_number' => 1,
                'book_name' => 'Génesis',
                'chapter' => 1,
                'verse' => 1,
                'scripture' => 'En el principio creó Dios los cielos y la tierra.'
            ],
            [
                'version' => 'RVR1960',
                'book_number' => 1,
                'book_name' => 'Génesis',
                'chapter' => 1,
                'verse' => 2,
                'scripture' => 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.'
            ],
            [
                'version' => 'RVR1960',
                'book_number' => 43,
                'book_name' => 'Juan',
                'chapter' => 3,
                'verse' => 16,
                'scripture' => 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.'
            ],
            [
                'version' => 'RVR1960',
                'book_number' => 19,
                'book_name' => 'Salmos',
                'chapter' => 23,
                'verse' => 1,
                'scripture' => 'Jehová es mi pastor; nada me faltará.'
            ],
            [
                'version' => 'RVR1960',
                'book_number' => 45,
                'book_name' => 'Romanos',
                'chapter' => 1,
                'verse' => 16,
                'scripture' => 'Porque no me avergüenzo del evangelio, porque es poder de Dios para salvación a todo aquel que cree; al judío primeramente, y también al griego.'
            ],

            // NUEVA VERSIÓN INTERNACIONAL (NVI)
            [
                'version' => 'NVI',
                'book_number' => 1,
                'book_name' => 'Génesis',
                'chapter' => 1,
                'verse' => 1,
                'scripture' => 'Dios, en el principio, creó los cielos y la tierra.'
            ],
            [
                'version' => 'NVI',
                'book_number' => 43,
                'book_name' => 'Juan',
                'chapter' => 3,
                'verse' => 16,
                'scripture' => 'Porque tanto amó Dios al mundo que dio a su Hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna.'
            ],
            [
                'version' => 'NVI',
                'book_number' => 19,
                'book_name' => 'Salmos',
                'chapter' => 23,
                'verse' => 1,
                'scripture' => 'El Señor es mi pastor; nada me falta.'
            ],
            [
                'version' => 'NVI',
                'book_number' => 45,
                'book_name' => 'Romanos',
                'chapter' => 1,
                'verse' => 16,
                'scripture' => 'A decir verdad, no me avergüenzo del evangelio, pues es poder de Dios para la salvación de todos los que creen, de los judíos primeramente, pero también de los gentiles.'
            ],

            // TRADUCCIÓN EN LENGUAJE ACTUAL (TLA)
            [
                'version' => 'TLA',
                'book_number' => 1,
                'book_name' => 'Génesis',
                'chapter' => 1,
                'verse' => 1,
                'scripture' => 'Cuando Dios creó los cielos y la tierra,'
            ],
            [
                'version' => 'TLA',
                'book_number' => 43,
                'book_name' => 'Juan',
                'chapter' => 3,
                'verse' => 16,
                'scripture' => 'Dios amó tanto a la gente de este mundo, que me entregó a mí, que soy su único Hijo, para que todo el que crea en mí no muera, sino que tenga vida eterna.'
            ],
            [
                'version' => 'TLA',
                'book_number' => 19,
                'book_name' => 'Salmos',
                'chapter' => 23,
                'verse' => 1,
                'scripture' => 'Tú, mi Dios, eres mi pastor; contigo nada me falta.'
            ],
            [
                'version' => 'TLA',
                'book_number' => 45,
                'book_name' => 'Romanos',
                'chapter' => 1,
                'verse' => 16,
                'scripture' => 'No me avergüenzo de anunciar la buena noticia. Es el poder de Dios para salvar a todos los que creen en él.'
            ],
        ];

        foreach ($versesData as $data) {
            BibleVerse::updateOrCreate(
                [
                    'version' => $data['version'],
                    'book_number' => $data['book_number'],
                    'chapter' => $data['chapter'],
                    'verse' => $data['verse']
                ],
                $data
            );
        }
    }
}


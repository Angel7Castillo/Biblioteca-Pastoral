<?php

namespace Database\Seeders;

use App\Models\Sermon;
use App\Models\BibleVerse;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Sermón de prueba inicial
        Sermon::create([
            'title' => 'Mi Primer Sermón',
            'slug' => 'mi-primer-sermon',
            'content_markdown' => "# Mi Primer Sermón\n\nBienvenido a la Biblioteca Pastoral. Empieza a redactar tu bosquejo aquí.",
            'content_html' => "<h1>Mi Primer Sermón</h1><p>Bienvenido a la Biblioteca Pastoral. Empieza a redactar tu bosquejo aquí.</p>",
            'status' => 'borrador',
            'preach_date' => now()->toDateString(),
            'location' => 'Iglesia Central',
            'main_passage' => 'Juan 3:16',
            'series_name' => 'Serie Fundamentos',
        ]);

        // Versículos bíblicos de prueba
        $verses = [
            ['version' => 'RVR1960', 'book_number' => 1, 'book_name' => 'Génesis', 'chapter' => 1, 'verse' => 1, 'scripture' => 'En el principio creó Dios los cielos y la tierra.'],
            ['version' => 'RVR1960', 'book_number' => 1, 'book_name' => 'Génesis', 'chapter' => 1, 'verse' => 2, 'scripture' => 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.'],
            ['version' => 'RVR1960', 'book_number' => 43, 'book_name' => 'Juan', 'chapter' => 3, 'verse' => 16, 'scripture' => 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.'],
            ['version' => 'RVR1960', 'book_number' => 45, 'book_name' => 'Romanos', 'chapter' => 1, 'verse' => 16, 'scripture' => 'Porque no me avergüenzo del evangelio, porque es poder de Dios para salvación a todo aquel que cree; al judío primeramente, y también al griego.'],
        ];

        foreach ($verses as $v) {
            BibleVerse::create($v);
        }
    }
}

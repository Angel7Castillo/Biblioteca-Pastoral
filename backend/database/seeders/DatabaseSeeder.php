<?php

namespace Database\Seeders;

use App\Models\Sermon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Sermón de prueba inicial
        Sermon::updateOrCreate(
            ['slug' => 'mi-primer-sermon'],
            [
                'title' => 'Mi Primer Sermón',
                'content_markdown' => "# Mi Primer Sermón\n\nBienvenido a la Biblioteca Pastoral. Empieza a redactar tu bosquejo aquí.",
                'content_html' => "<h1>Mi Primer Sermón</h1><p>Bienvenido a la Biblioteca Pastoral. Empieza a redactar tu bosquejo aquí.</p>",
                'status' => 'borrador',
                'preach_date' => now()->toDateString(),
                'location' => 'Iglesia Central',
                'main_passage' => 'Juan 3:16',
                'series_name' => 'Serie Fundamentos',
            ]
        );

        // Ejecutar Seeder Bíblico Multiversión (RVR1960, NVI, TLA)
        $this->call(BibleSeeder::class);

        // Ejecutar Seeder de Diccionario Strong y Términos Teológicos
        $this->call(StrongDictionarySeeder::class);
    }
}

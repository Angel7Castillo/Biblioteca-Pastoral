<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\BibleVerse;
use Illuminate\Support\Facades\Artisan;

echo "Current verse count: " . BibleVerse::count() . "\n";
echo "Current verse chapter > 1 count: " . BibleVerse::where('chapter', '>', 1)->count() . "\n";

// Clear DB and run BibleSeeder
BibleVerse::truncate();
echo "Truncated BibleVerse table.\n";

Artisan::call('db:seed', ['--class' => 'BibleSeeder']);
echo Artisan::output();

echo "New total verses: " . BibleVerse::count() . "\n";
echo "New verses chapter > 1 count: " . BibleVerse::where('chapter', '>', 1)->count() . "\n";

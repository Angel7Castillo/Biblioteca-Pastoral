<?php

require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$chapters = App\Models\BibleVerse::where('book_number', 1)
    ->where('version', 'RVR1960')
    ->distinct()
    ->orderBy('chapter')
    ->pluck('chapter')
    ->toArray();

echo "Genesis RVR1960 total chapters count: " . count($chapters) . "\n";
echo "First 10 chapters: " . implode(', ', array_slice($chapters, 0, 10)) . "\n";
echo "Last 5 chapters: " . implode(', ', array_slice($chapters, -5)) . "\n";

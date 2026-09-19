<?php
$json = json_decode(file_get_contents(__DIR__ . '/../backend/database/bibles/RVR1960.json'), true);

$chaptersPerBook = [];
foreach ($json as $row) {
    $b = $row['book_number'];
    $c = $row['chapter'];
    $chaptersPerBook[$b][$c] = true;
}

echo "Gen (Book 1) chapters: " . count($chaptersPerBook[1]) . "\n";
echo "Exodus (Book 2) chapters: " . count($chaptersPerBook[2]) . "\n";
echo "Psalms (Book 19) chapters: " . count($chaptersPerBook[19]) . "\n";
echo "Luke (Book 42) chapters: " . count($chaptersPerBook[42]) . "\n";
echo "John (Book 43) chapters: " . count($chaptersPerBook[43]) . "\n";
echo "Revelation (Book 66) chapters: " . count($chaptersPerBook[66]) . "\n";

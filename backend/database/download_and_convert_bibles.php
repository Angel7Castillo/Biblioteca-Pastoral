<?php

$versions = [
    'RVR1960' => 'https://mrk214.github.io/snapshots/es___spa___spa/RVR1960_vid_149.json',
    'NVI'     => 'https://mrk214.github.io/snapshots/es___spa___spa/NVI_vid_128.json',
    'TLA'     => 'https://mrk214.github.io/snapshots/es___spa___spa/TLAI_vid_178.json'
];

$outputDir = __DIR__ . '/bibles';
if (!file_exists($outputDir)) {
    mkdir($outputDir, 0777, true);
}

foreach ($versions as $verName => $url) {
    echo "=== Processing {$verName} ===\n";
    $jsonContent = @file_get_contents($url);
    if (!$jsonContent) {
        echo "Error fetching {$verName}\n";
        continue;
    }

    $raw = json_decode($jsonContent, true);
    $normalizedVerses = [];
    $bookNum = 0;

    foreach ($raw['books'] as $book) {
        $bookNum++;
        // Standard 66 books for protestant Bible filter if TLA includes deuterocanonical
        // But let's check bookNum <= 66 or map standard books
        if ($bookNum > 66 && $verName === 'TLA') {
            // TLAI has 78, stop at 66 if needed, or include all
        }

        $bookName = trim($book['name']);
        
        foreach ($book['chapters'] as $chIdx => $chapter) {
            $chapterNum = isset($chapter['current']) ? (int)$chapter['current'] : ($chIdx + 1);
            
            if (!isset($chapter['items']) || !is_array($chapter['items'])) {
                continue;
            }

            foreach ($chapter['items'] as $item) {
                if (($item['type'] ?? '') === 'verse' && !empty($item['verse_numbers'])) {
                    $verseNum = (int)$item['verse_numbers'][0];
                    $scripture = trim(implode(" ", $item['lines'] ?? []));

                    // Remove inline footnote markers or extra spaces if any
                    $scripture = preg_replace('/\s+/', ' ', $scripture);

                    if (!empty($scripture)) {
                        $normalizedVerses[] = [
                            'book_number' => $bookNum,
                            'book_name'   => $bookName,
                            'chapter'     => $chapterNum,
                            'verse'       => $verseNum,
                            'scripture'   => $scripture
                        ];
                    }
                }
            }
        }
    }

    $destPath = "{$outputDir}/{$verName}.json";
    file_put_contents($destPath, json_encode($normalizedVerses, JSON_UNESCAPED_UNICODE));
    echo "Saved {$verName}: " . count($normalizedVerses) . " verses to {$destPath}\n";
}
echo "Conversion complete!\n";

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BibleVerse;
use Illuminate\Http\Request;

class BibleController extends Controller
{
    public function books(Request $request)
    {
        $version = $request->query('version', 'RVR1960');

        $books = BibleVerse::where('version', $version)
            ->select('book_number', 'book_name')
            ->distinct()
            ->orderBy('book_number')
            ->get();

        if ($books->isEmpty()) {
            $books = BibleVerse::select('book_number', 'book_name')
                ->distinct()
                ->orderBy('book_number')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $books,
        ]);
    }

    public function chapters($bookNumber, Request $request)
    {
        $version = $request->query('version', 'RVR1960');

        $chapters = BibleVerse::where('book_number', $bookNumber)
            ->where('version', $version)
            ->select('chapter')
            ->distinct()
            ->orderBy('chapter')
            ->pluck('chapter');

        if ($chapters->isEmpty()) {
            $chapters = BibleVerse::where('book_number', $bookNumber)
                ->select('chapter')
                ->distinct()
                ->orderBy('chapter')
                ->pluck('chapter');
        }

        return response()->json([
            'success' => true,
            'data' => $chapters,
        ]);
    }

    public function verses($bookNumber, $chapter, Request $request)
    {
        $version = $request->query('version', 'RVR1960');
        $verse = $request->query('verse');

        $query = BibleVerse::where('book_number', $bookNumber)
            ->where('chapter', $chapter)
            ->where('version', $version);

        if (!empty($verse)) {
            $query->where('verse', $verse);
        }

        $verses = $query->orderBy('verse')->get();

        if ($verses->isEmpty()) {
            $fallbackQuery = BibleVerse::where('book_number', $bookNumber)
                ->where('chapter', $chapter);
            if (!empty($verse)) {
                $fallbackQuery->where('verse', $verse);
            }
            $verses = $fallbackQuery->orderBy('verse')->get();
        }

        return response()->json([
            'success' => true,
            'data' => $verses,
        ]);
    }

    public function search(Request $request)
    {
        $query = trim($request->query('q', ''));
        $version = $request->query('version');

        if (empty($query)) {
            return response()->json([
                'success' => false,
                'message' => 'Término de búsqueda requerido.',
                'data' => [],
            ], 400);
        }

        // Detectar si la búsqueda es una cita bíblica ej: "Juan 3", "Juan 3:16", "1 Juan 1:9", "Salmos 23"
        if (preg_match('/^([0-9]?\s*[a-záéíóúñA-ZÁÉÍÓÚÑ]+)\s+([0-9]+)(?::([0-9]+))?$/u', $query, $matches)) {
            $bookSearch = trim($matches[1]);
            $chapterNum = (int)$matches[2];
            $verseNum = isset($matches[3]) ? (int)$matches[3] : null;

            $builder = BibleVerse::where('book_name', 'like', "%{$bookSearch}%")
                ->where('chapter', $chapterNum);

            if ($verseNum) {
                $builder->where('verse', $verseNum);
            }

            if (!empty($version)) {
                $builder->where('version', $version);
            }

            $results = $builder->orderBy('book_number')->orderBy('verse')->get();

            if (!$results->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'is_reference' => true,
                    'data' => $results,
                ]);
            }
        }

        // Búsqueda por palabra o frase en el texto bíblico
        $builder = BibleVerse::where('scripture', 'like', "%{$query}%");

        if (!empty($version)) {
            $builder->where('version', $version);
        }

        $results = $builder->orderBy('book_number')->orderBy('chapter')->orderBy('verse')->limit(100)->get();

        return response()->json([
            'success' => true,
            'is_reference' => false,
            'data' => $results,
        ]);
    }
}


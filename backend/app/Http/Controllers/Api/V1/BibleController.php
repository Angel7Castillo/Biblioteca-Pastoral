<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BibleVerse;
use Illuminate\Http\Request;

class BibleController extends Controller
{
    public function books()
    {
        $books = BibleVerse::select('book_number', 'book_name')
            ->distinct()
            ->orderBy('book_number')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $books,
        ]);
    }

    public function verses($bookNumber, $chapter)
    {
        $verses = BibleVerse::where('book_number', $bookNumber)
            ->where('chapter', $chapter)
            ->orderBy('verse')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $verses,
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->query('q');

        if (empty($query)) {
            return response()->json([
                'success' => false,
                'message' => 'Término de búsqueda requerido.',
                'data' => [],
            ], 400);
        }

        $results = BibleVerse::where('scripture', 'like', "%{$query}%")
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }
}

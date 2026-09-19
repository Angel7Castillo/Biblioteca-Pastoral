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

        // Si no hay libros para la versión seleccionada, devolver libros por defecto
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

    public function verses($bookNumber, $chapter, Request $request)
    {
        $version = $request->query('version', 'RVR1960');

        $verses = BibleVerse::where('book_number', $bookNumber)
            ->where('chapter', $chapter)
            ->where('version', $version)
            ->orderBy('verse')
            ->get();

        // Fallback si la versión específica aún no se ha cargado totalmente
        if ($verses->isEmpty()) {
            $verses = BibleVerse::where('book_number', $bookNumber)
                ->where('chapter', $chapter)
                ->orderBy('verse')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $verses,
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->query('q');
        $version = $request->query('version');

        if (empty($query)) {
            return response()->json([
                'success' => false,
                'message' => 'Término de búsqueda requerido.',
                'data' => [],
            ], 400);
        }

        $builder = BibleVerse::where('scripture', 'like', "%{$query}%");

        if (!empty($version)) {
            $builder->where('version', $version);
        }

        $results = $builder->limit(50)->get();

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }
}

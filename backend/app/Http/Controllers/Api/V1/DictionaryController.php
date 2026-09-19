<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StrongDictionary;
use App\Models\TheologicalTerm;
use Illuminate\Http\Request;

class DictionaryController extends Controller
{
    /**
     * Obtener una entrada del Diccionario Strong por su código exacto (ej. G4151, H1254).
     */
    public function showStrong($code)
    {
        $code = strtoupper(trim($code));
        $entry = StrongDictionary::where('code', $code)->first();

        if (!$entry) {
            return response()->json([
                'success' => false,
                'message' => "Código Strong {$code} no encontrado.",
            ], 44);
        }

        return response()->json([
            'success' => true,
            'data' => $entry,
        ]);
    }

    /**
     * Buscar en la concordancia Strong por código, palabra original, transliteración o definición.
     */
    public function searchStrong(Request $request)
    {
        $q = trim($request->query('q', ''));
        $type = $request->query('type'); // 'hebrew' o 'greek'

        $queryBuilder = StrongDictionary::query();

        if (!empty($type)) {
            $queryBuilder->where('type', strtolower($type));
        }

        if (!empty($q)) {
            $upperQ = strtoupper($q);
            $queryBuilder->where(function ($b) use ($q, $upperQ) {
                $b->where('code', 'like', "%{$upperQ}%")
                  ->orWhere('original_word', 'like', "%{$q}%")
                  ->orWhere('transliteration', 'like', "%{$q}%")
                  ->orWhere('pronunciation', 'like', "%{$q}%")
                  ->orWhere('definition', 'like', "%{$q}%");
            });
        }

        $results = $queryBuilder->orderBy('code')->limit(100)->get();

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }

    /**
     * Buscar o listar términos del Diccionario Teológico.
     */
    public function searchTheological(Request $request)
    {
        $q = trim($request->query('q', ''));
        $category = $request->query('category');

        $queryBuilder = TheologicalTerm::query();

        if (!empty($category)) {
            $queryBuilder->where('category', 'like', "%{$category}%");
        }

        if (!empty($q)) {
            $queryBuilder->where(function ($b) use ($q) {
                $b->where('term', 'like', "%{$q}%")
                  ->orWhere('category', 'like', "%{$q}%")
                  ->orWhere('definition', 'like', "%{$q}%")
                  ->orWhere('cross_references', 'like', "%{$q}%");
            });
        }

        $results = $queryBuilder->orderBy('term')->get();

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BibleNote;
use Illuminate\Http\Request;

class BibleNoteController extends Controller
{
    /**
     * Listar todas las notas bíblicas con búsqueda opcional.
     */
    public function index(Request $request)
    {
        $query = BibleNote::query();

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where('content', 'like', "%{$q}%")
                  ->orWhere('tags', 'like', "%{$q}%");
        }

        $notes = $query->orderBy('updated_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $notes
        ]);
    }

    /**
     * Obtener todas las notas para un capítulo específico.
     */
    public function getByChapter(Request $request)
    {
        $book = $request->input('book');
        $chapter = $request->input('chapter');

        if (!$book || !$chapter) {
            return response()->json([
                'success' => false,
                'message' => 'Parámetros book y chapter requeridos.'
            ], 422);
        }

        $notes = BibleNote::where('book_number', $book)
            ->where('chapter', $chapter)
            ->orderBy('verse', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notes
        ]);
    }

    /**
     * Crear o actualizar la nota para un versículo.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_number' => 'required|integer',
            'chapter' => 'required|integer',
            'verse' => 'required|integer',
            'version' => 'nullable|string|max:20',
            'content' => 'required|string',
            'tags' => 'nullable|string',
        ]);

        $note = BibleNote::updateOrCreate(
            [
                'book_number' => $validated['book_number'],
                'chapter' => $validated['chapter'],
                'verse' => $validated['verse'],
            ],
            [
                'version' => $validated['version'] ?? null,
                'content' => $validated['content'],
                'tags' => $validated['tags'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Nota guardada exitosamente.',
            'data' => $note
        ], 200);
    }

    /**
     * Eliminar una nota.
     */
    public function destroy($id)
    {
        $note = BibleNote::find($id);
        if (!$note) {
            return response()->json([
                'success' => false,
                'message' => 'Nota no encontrada.'
            ], 44);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nota eliminada exitosamente.'
        ]);
    }
}

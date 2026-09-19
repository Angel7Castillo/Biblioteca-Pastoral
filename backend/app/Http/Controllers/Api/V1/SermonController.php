<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Sermon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SermonController extends Controller
{
    public function index(Request $request)
    {
        $query = Sermon::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('main_passage', 'like', "%{$search}%")
                  ->orWhere('series_name', 'like', "%{$search}%");
            });
        }

        $sermons = $query->orderBy('updated_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $sermons,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content_markdown' => 'nullable|string',
            'content_html' => 'nullable|string',
            'status' => 'nullable|string|in:borrador,listo,predicado',
            'preach_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'main_passage' => 'nullable|string|max:255',
            'target_audience' => 'nullable|string|max:255',
            'series_name' => 'nullable|string|max:255',
        ]);

        $sermon = Sermon::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(5),
            'content_markdown' => $validated['content_markdown'] ?? '',
            'content_html' => $validated['content_html'] ?? '',
            'status' => $validated['status'] ?? 'borrador',
            'preach_date' => $validated['preach_date'] ?? null,
            'location' => $validated['location'] ?? null,
            'main_passage' => $validated['main_passage'] ?? null,
            'target_audience' => $validated['target_audience'] ?? null,
            'series_name' => $validated['series_name'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sermón creado correctamente.',
            'data' => $sermon,
        ], 201);
    }

    public function show($id)
    {
        $sermon = Sermon::find($id) ?? Sermon::where('slug', $id)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $sermon,
        ]);
    }

    public function update(Request $request, $id)
    {
        $sermon = Sermon::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content_markdown' => 'nullable|string',
            'content_html' => 'nullable|string',
            'status' => 'nullable|string|in:borrador,listo,predicado',
            'preach_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'main_passage' => 'nullable|string|max:255',
            'target_audience' => 'nullable|string|max:255',
            'series_name' => 'nullable|string|max:255',
        ]);

        $sermon->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Sermón actualizado correctamente.',
            'data' => $sermon,
        ]);
    }

    public function destroy($id)
    {
        $sermon = Sermon::findOrFail($id);
        $sermon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sermón eliminado correctamente.',
        ]);
    }

    public function duplicate($id)
    {
        $original = Sermon::findOrFail($id);

        $cloned = $original->replicate([
            'slug',
            'preach_date',
            'location',
            'created_at',
            'updated_at'
        ]);

        $cloned->title = $original->title . ' (Copia)';
        $cloned->status = 'borrador';
        $cloned->slug = Str::slug($cloned->title) . '-' . Str::random(5);
        $cloned->save();

        return response()->json([
            'success' => true,
            'message' => 'Sermón duplicado correctamente.',
            'data' => $cloned,
        ]);
    }
}

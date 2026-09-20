<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\SermonController;
use App\Http\Controllers\Api\V1\BibleController;
use App\Http\Controllers\Api\V1\BibleNoteController;
use App\Http\Controllers\Api\V1\DictionaryController;
use App\Http\Controllers\Api\V1\SyncController;
use App\Http\Controllers\Api\V1\SystemController;

Route::prefix('v1')->group(function () {
    // API de Sermones y Apuntes
    Route::get('/sermones', [SermonController::class, 'index']);
    Route::get('/sermones/series', [SermonController::class, 'seriesList']);
    Route::get('/sermones/etiquetas', [SermonController::class, 'tagsList']);
    Route::post('/sermones', [SermonController::class, 'store']);
    Route::get('/sermones/{id}', [SermonController::class, 'show']);
    Route::put('/sermones/{id}', [SermonController::class, 'update']);
    Route::delete('/sermones/{id}', [SermonController::class, 'destroy']);
    Route::post('/sermones/{id}/reutilizar', [SermonController::class, 'duplicate']);

    // API de Biblia
    Route::get('/biblia/libros', [BibleController::class, 'books']);
    Route::get('/biblia/{bookNumber}/capitulos', [BibleController::class, 'chapters']);
    Route::get('/biblia/{bookNumber}/{chapter}', [BibleController::class, 'verses']);
    Route::get('/biblia/buscar', [BibleController::class, 'search']);

    // API de Notas Bíblicas
    Route::get('/notas', [BibleNoteController::class, 'index']);
    Route::get('/notas/capitulo', [BibleNoteController::class, 'getByChapter']);
    Route::post('/notas', [BibleNoteController::class, 'store']);
    Route::delete('/notas/{id}', [BibleNoteController::class, 'destroy']);

    // API de Diccionario Strong & Teológico
    Route::get('/diccionario/strong/buscar', [DictionaryController::class, 'searchStrong']);
    Route::get('/diccionario/strong/{code}', [DictionaryController::class, 'showStrong']);
    Route::get('/diccionario/teologico', [DictionaryController::class, 'searchTheological']);

    // API de Vinculación de Dispositivos (PC ↔ Móvil)
    Route::post('/sincronizacion/generar-codigo', [SyncController::class, 'generateCode']);
    Route::post('/sincronizacion/vincular', [SyncController::class, 'linkDevice']);
    Route::get('/sincronizacion/estado', [SyncController::class, 'getStatus']);

    // Mantenimiento y Auto-Despliegue del Servidor Proxmox
    Route::get('/sistema/estado', [SystemController::class, 'status']);
    Route::post('/sistema/actualizar', [SystemController::class, 'update']);
});


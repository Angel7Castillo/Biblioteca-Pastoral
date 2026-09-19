<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\SermonController;
use App\Http\Controllers\Api\V1\BibleController;
use App\Http\Controllers\Api\V1\SystemController;

Route::prefix('v1')->group(function () {
    // API de Sermones y Apuntes
    Route::get('/sermones', [SermonController::class, 'index']);
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

    // Mantenimiento y Auto-Despliegue del Servidor Proxmox
    Route::get('/sistema/estado', [SystemController::class, 'status']);
    Route::post('/sistema/actualizar', [SystemController::class, 'update']);
});


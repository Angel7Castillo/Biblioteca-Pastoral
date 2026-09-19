<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Biblioteca Pastoral API',
        'version' => '2.0.0',
        'status' => 'online'
    ]);
});

// Incluir rutas de API para compatibilidad completa
require __DIR__.'/api.php';

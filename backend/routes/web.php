<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Biblioteca Pastoral API',
        'version' => '2.0.0',
        'status' => 'online'
    ]);
});


<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class SystemController extends Controller
{
    public function update(Request $request)
    {
        $baseDir = base_path('..');
        $backendDir = base_path();
        $token = 'ghp_HflB1yZ7KkWkY46b9S0hRz5t3oA26C458i7K';
        $remoteUrl = "https://{$token}@github.com/Angel7Castillo/Biblioteca-Pastoral.git";

        // Script de actualización robusta con soporte para repositorio privado PAT y ejecución de migraciones
        $commands = [
            "export HOME=/tmp; git -C {$baseDir} config safe.directory '*' 2>&1",
            "export HOME=/tmp; git -C {$baseDir} remote set-url origin {$remoteUrl} 2>&1",
            "export HOME=/tmp; git -C {$baseDir} fetch origin main 2>&1",
            "export HOME=/tmp; git -C {$baseDir} reset --hard origin/main 2>&1",
            "cd {$backendDir} && php artisan route:clear 2>&1",
            "cd {$backendDir} && php artisan config:clear 2>&1",
            "cd {$backendDir} && php artisan cache:clear 2>&1",
            "cd {$backendDir} && php artisan migrate --force 2>&1",
            "cd {$backendDir} && php artisan db:seed --class=StrongDictionarySeeder --force 2>&1",
        ];

        $outputLog = [];
        foreach ($commands as $cmd) {
            $outputLog[] = "[$cmd]: " . shell_exec($cmd);
        }

        if (function_exists('opcache_reset')) {
            @opcache_reset();
        }

        $commitInfo = shell_exec("export HOME=/tmp; git -C {$baseDir} log -1 --pretty=format:\"%h - %s (%cr)\" 2>&1");

        return response()->json([
            'success' => true,
            'message' => 'Sistema actualizado con éxito.',
            'version' => '2.0',
            'commit' => trim($commitInfo),
            'log' => $outputLog,
        ]);
    }

    public function status(Request $request)
    {
        $baseDir = base_path('..');
        $commitInfo = shell_exec("export HOME=/tmp; git -C {$baseDir} log -1 --pretty=format:\"%h - %s (%cr)\" 2>&1");

        return response()->json([
            'success' => true,
            'version' => '2.0',
            'commit' => trim($commitInfo) ?: 'v2.0',
        ]);
    }
}

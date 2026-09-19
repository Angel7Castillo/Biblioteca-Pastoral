<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Process;

class SystemController extends Controller
{
    public function update(Request $request)
    {
        $baseDir = base_path('..');
        $backendDir = base_path();

        // Establecer HOME=/tmp para permitir escritura de config en www-data
        $command = "export HOME=/tmp; git -C {$baseDir} config --add safe.directory {$baseDir} 2>&1 && git -C {$baseDir} fetch origin 2>&1 && git -C {$baseDir} reset --hard origin/main 2>&1 && cd {$backendDir} && php artisan route:clear 2>&1 && php artisan config:clear 2>&1 && php artisan migrate --force 2>&1";

        $output = shell_exec($command);

        // Obtener último commit
        $commitInfo = shell_exec("export HOME=/tmp; git -C {$baseDir} log -1 --pretty=format:\"%h - %s (%cr)\" 2>&1");

        return response()->json([
            'success' => true,
            'message' => 'Servidor Proxmox actualizado con éxito.',
            'commit' => $commitInfo ? trim($commitInfo) : 'Última versión instalada',
            'log' => $output
        ]);
    }

    public function status(Request $request)
    {
        $baseDir = base_path('..');
        $commitInfo = shell_exec("export HOME=/tmp; git -C {$baseDir} log -1 --pretty=format:\"%h - %s (%cr)\" 2>&1");

        return response()->json([
            'success' => true,
            'version' => '2.0.0',
            'commit' => $commitInfo ? trim($commitInfo) : 'Desconocido',
            'php_version' => PHP_VERSION,
            'os' => PHP_OS
        ]);
    }
}

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
        $command = "export HOME=/tmp; git -C {$baseDir} config --add safe.directory {$baseDir} 2>&1 && git -C {$baseDir} fetch origin 2>&1 && git -C {$baseDir} reset --hard origin/main 2>&1 && cd {$backendDir} && php artisan route:clear 2>&1 && php artisan config:clear 2>&1 && php artisan migrate --force 2>&1 && php artisan db:seed --class=BibleSeeder --force 2>&1";

        $output = shell_exec($command);

        if (function_exists('opcache_reset')) {
            @opcache_reset();
        }

        // Obtener último commit
        $commitInfo = shell_exec("export HOME=/tmp; git -C {$baseDir} log -1 --pretty=format:\"%h - %s (%cr)\" 2>&1");

        return response()->json([
            'success' => true,
            'message' => 'Sistema actualizado con éxito.',
            'version' => '2.0',
            'commit' => trim($commitInfo),
            'debug_output' => $output
        ]);
    }

    public function status(Request $request)
    {
        return response()->json([
            'success' => true,
            'version' => '2.0',
            'commit' => 'v2.0'
        ]);
    }
}

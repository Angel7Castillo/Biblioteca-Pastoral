<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class SystemController extends Controller
{
    public function update(Request $request)
    {
        $baseDir = realpath(base_path('..')) ?: base_path('..');
        $backendDir = base_path();
        $token = 'ghp_HflB1yZ7KkWkY46b9S0hRz5t3oA26C458i7K';
        $remoteUrl = "https://{$token}@github.com/Angel7Castillo/Biblioteca-Pastoral.git";

        $outputLog = [];

        // Intentar varias rutas posibles del repositorio Git
        $possibleDirs = [
            $baseDir,
            '/var/www/biblioteca-pastoral',
            '/var/www/html',
            $backendDir
        ];

        $gitSuccess = false;
        foreach ($possibleDirs as $dir) {
            if (is_dir($dir . '/.git')) {
                $outputLog[] = "Repo git encontrado en: {$dir}";
                $cmds = [
                    "export HOME=/tmp; git -C {$dir} config safe.directory '*' 2>&1",
                    "export HOME=/tmp; git -C {$dir} remote set-url origin {$remoteUrl} 2>&1",
                    "export HOME=/tmp; git -C {$dir} fetch origin main 2>&1",
                    "export HOME=/tmp; git -C {$dir} reset --hard origin/main 2>&1",
                ];
                foreach ($cmds as $c) {
                    $res = shell_exec($c);
                    $outputLog[] = "[$c]: " . trim($res);
                }
                $gitSuccess = true;
                break;
            }
        }

        // Si Git no está disponible o no se encuentra el repositorio, descargar el ZIP mediante API de GitHub
        if (!$gitSuccess) {
            $outputLog[] = "Descargando ZIP de GitHub mediante API...";
            try {
                $zipUrl = "https://api.github.com/repos/Angel7Castillo/Biblioteca-Pastoral/zipball/main";
                $opts = [
                    'http' => [
                        'method' => 'GET',
                        'header' => [
                            "Authorization: token {$token}",
                            "User-Agent: PHP-BibliotecaPastoral-Updater"
                        ]
                    ]
                ];
                $context = stream_context_create($opts);
                $zipData = file_get_contents($zipUrl, false, $context);

                if ($zipData !== false) {
                    $zipFile = '/tmp/update_latest.zip';
                    file_put_contents($zipFile, $zipData);

                    $extractDir = '/tmp/extracted_repo';
                    shell_exec("rm -rf {$extractDir} && mkdir -p {$extractDir} && unzip -q -o {$zipFile} -d {$extractDir}");
                    
                    // Copiar los archivos extraídos sobre la carpeta base
                    $subDirs = glob("{$extractDir}/*", GLOB_ONLYDIR);
                    if (!empty($subDirs)) {
                        $sourceDir = $subDirs[0];
                        shell_exec("cp -rf {$sourceDir}/* {$baseDir}/ 2>&1");
                        $outputLog[] = "Archivos actualizados desde ZIP a {$baseDir}";
                    }
                } else {
                    $outputLog[] = "Error al descargar ZIP desde GitHub API";
                }
            } catch (\Exception $e) {
                $outputLog[] = "Excepción en descarga ZIP: " . $e->getMessage();
            }
        }

        // Ejecutar comandos de actualización de Laravel
        $artisanCmds = [
            "cd {$backendDir} && php artisan route:clear 2>&1",
            "cd {$backendDir} && php artisan config:clear 2>&1",
            "cd {$backendDir} && php artisan cache:clear 2>&1",
            "cd {$backendDir} && php artisan migrate --force 2>&1",
        ];

        foreach ($artisanCmds as $cmd) {
            $outputLog[] = "[$cmd]: " . trim(shell_exec($cmd));
        }

        if (function_exists('opcache_reset')) {
            @opcache_reset();
        }

        return response()->json([
            'success' => true,
            'message' => 'Sistema actualizado con éxito.',
            'version' => '2.0.0',
            'log' => $outputLog,
        ]);
    }

    public function status(Request $request)
    {
        $baseDir = base_path('..');
        $backendDir = base_path();
        
        $gitLogParent = shell_exec("export HOME=/tmp; git -C {$baseDir} log -1 --oneline 2>&1");
        $gitLogBackend = shell_exec("export HOME=/tmp; git -C {$backendDir} log -1 --oneline 2>&1");
        $gitLogCurrent = shell_exec("export HOME=/tmp; git log -1 --oneline 2>&1");

        return response()->json([
            'success' => true,
            'version' => '2.0',
            'backend_dir' => $backendDir,
            'base_dir' => $baseDir,
            'git_parent' => trim($gitLogParent),
            'git_backend' => trim($gitLogBackend),
            'git_current' => trim($gitLogCurrent),
        ]);
    }
}
